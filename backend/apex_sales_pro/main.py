import os
import asyncio
import json
from enum import Enum
from typing import List, Optional, Dict, Any, Literal

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse
import io
import httpx
import websockets



# Load .env
load_dotenv()
HUBSPOT_API_KEY = os.getenv("HUBSPOT_API_KEY")

# --- OpenAI client ---
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")   # Auto loads from .env
)
REALTIME_MODEL = os.getenv("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview")
REALTIME_SAMPLE_RATE = 24000

# --- FastAPI app ---
app = FastAPI(
    title="Apex Sales Pro API",
    description="Platinum outbound sales closer agent (Apex Sales Pro) with CRM / sentiment / A/B testing hooks.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ENUMS & MODELS
# =========================



class Channel(str, Enum):
    phone = "phone"
    video = "video"
    chat = "chat"
    meeting = "meeting"


class WebhookEventType(str, Enum):
    call_started = "call.started"
    call_completed = "call.completed"
    call_failed = "call.failed"
    call_voicemail = "call.voicemail"


class SentimentLabel(str, Enum):
    very_negative = "very_negative"
    negative = "negative"
    neutral = "neutral"
    positive = "positive"
    very_positive = "very_positive"


class AgentPersona(BaseModel):
    tier: str = "Platinum"
    description: str = (
        "Platinum sales closer focused on outbound demos and contracts; "
        "confident tone, assumptive closing, ROI storytelling, strong objection handling."
    )
    tone: str = "confident, consultative, assumptive-closing"
    closing_style: str = "assumptive close with clear next steps (demo / contract)"
    storytelling_focus: str = "ROI, business impact, and time-to-value"


class AgentAdvancedSettings(BaseModel):
    max_call_duration_seconds: int = 900  # 15 min
    max_retries: int = 3
    voicemail_strategy: str = "drop_voicemail_if_no_answer"
    record_calls: bool = True
    transcribe_calls: bool = True
    retain_days: int = 30
    rate_limit_per_minute: int = 30
    fallback_routing: str = "transfer_to_AE_if_blocked"
    webhook_urls: Dict[str, str] = Field(
        default_factory=lambda: {
            "call.started": "https://example.com/webhooks/call-started",
            "call.completed": "https://example.com/webhooks/call-completed",
            "call.failed": "https://example.com/webhooks/call-failed",
            "call.voicemail": "https://example.com/webhooks/call-voicemail",
        }
    )


class AgentIntegrations(BaseModel):
    crm_provider: Optional[str] = None
    crm_auto_sync: bool = False
    lead_scoring_enabled: bool = True
    conferencing_platforms: List[str] = ["Zoom", "Google Meet", "Teams"]
    default_meeting_link_template: str = (
        "https://meet.example.com/{owner_id}/{lead_id}"
    )


class AgentConfig(BaseModel):
    name: str = "Apex Sales Pro"
    active: bool = True
    model: str = "gpt-4o-mini"  # faster default for conversational latency
    voice: str = "nova"     # conceptual; real voice handled in telephony layer
    deployment_channels: List[Channel] = [
        Channel.phone,
        Channel.video,
        Channel.chat,
        Channel.meeting,
    ]
    temperature: float = 0.6
    top_p: float = 0.9
    memory_turns: int = 15  # how many past messages to keep
    multi_language: bool = True
    persona: AgentPersona = Field(default_factory=AgentPersona)
    advanced: AgentAdvancedSettings = Field(default_factory=AgentAdvancedSettings)
    integrations: AgentIntegrations = Field(default_factory=AgentIntegrations)
    # A/B testing variant label, e.g. "A" vs "B"
    ab_test_variant: Optional[str] = "A"


class LeadContext(BaseModel):
    lead_id: str
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    region: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    estimated_deal_size: Optional[float] = None
    currency: str = "USD"
    crm_id: Optional[str] = None
    pain_points: List[str] = Field(default_factory=list)
    current_tools: Optional[str] = None
    notes: Optional[str] = None
    preferred_language: Optional[str] = None


class ConversationTurn(BaseModel):
    role: Literal["agent", "prospect"]
    content: str
    sentiment: Optional[SentimentLabel] = None
    timestamp: Optional[str] = None


class CallSettings(BaseModel):
    channel: Channel = Channel.phone
    call_id: str
    call_attempt: int = 1
    allow_negotiation: bool = True
    target_next_step: str = "book_demo"
    max_agent_response_tokens: int = 600


class ApexSalesRequest(BaseModel):
    agent: AgentConfig = Field(default_factory=AgentConfig)
    lead: LeadContext
    settings: CallSettings
    history: List[ConversationTurn] = Field(
        default_factory=list,
        description="Chronological conversation turns (agent/prospect).",
    )
    custom_variables: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional custom variables like deal size, CRM IDs, campaign IDs etc.",
    )


class ApexSalesResponse(BaseModel):
    call_id: str
    channel: Channel
    agent_message: str
    sentiment: SentimentLabel
    lead_score: Optional[int] = None
    recommended_next_step: str
    recommended_next_step_reason: str
    variant: Optional[str] = None
    debug_metadata: Optional[Dict[str, Any]] = None


class WebhookEvent(BaseModel):
    event_type: WebhookEventType
    call_id: str
    lead_id: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)


class DialRequest(BaseModel):
    phone_number: str
    caller_id: Optional[str] = "+15551234567"
    agent_name: str = "Apex Sales Pro"
    metadata: Dict[str, Any] = Field(default_factory=dict)


# Simple in-memory call logs for demo purposes
CALL_LOGS: Dict[str, List[ConversationTurn]] = {}


# =========================
# HELPER FUNCTIONS
# =========================

def run_apex_sales_turn(payload: ApexSalesRequest, background_tasks: BackgroundTasks) -> ApexSalesResponse:
    if not payload.agent.active:
        raise HTTPException(status_code=400, detail="Agent is not active.")

    if payload.settings.channel not in payload.agent.deployment_channels:
        raise HTTPException(
            status_code=400,
            detail=f"Channel {payload.settings.channel} not enabled for this agent.",
        )

    # Limit history for memory window
    history = payload.history[-payload.agent.memory_turns :]

    # Build messages for OpenAI
    system_prompt = build_system_prompt(payload.agent, payload.lead, payload.settings)
    messages = [{"role": "system", "content": system_prompt}]
    messages += convert_history_to_openai_messages(history)

    # Call OpenAI to generate the next agent turn
    completion = client.chat.completions.create(
        model=payload.agent.model,
        messages=messages,
        temperature=payload.agent.temperature,
        top_p=payload.agent.top_p,
        max_tokens=min(payload.settings.max_agent_response_tokens, 320),
    )

    agent_message = completion.choices[0].message.content.strip()

    # Sentiment of agent reply
    sentiment = analyze_sentiment(agent_message)

    # Log conversation
    CALL_LOGS.setdefault(payload.settings.call_id, [])
    CALL_LOGS[payload.settings.call_id].extend(history)
    CALL_LOGS[payload.settings.call_id].append(
        ConversationTurn(role="agent", content=agent_message, sentiment=sentiment)
    )

    # Lead scoring + recommended next step
    lead_score = score_lead(payload.lead, CALL_LOGS[payload.settings.call_id])
    next_step, reason = determine_next_step(lead_score, payload.settings)

    # Trigger webhook asynchronously (stub; here we only simulate)
    background_tasks.add_task(
        simulate_webhook_push,
        event_type=WebhookEventType.call_started.value,
        call_id=payload.settings.call_id,
        lead_id=payload.lead.lead_id,
    )

    result = ApexSalesResponse(
        call_id=payload.settings.call_id,
        channel=payload.settings.channel,
        agent_message=agent_message,
        sentiment=sentiment,
        lead_score=lead_score,
        recommended_next_step=next_step,
        recommended_next_step_reason=reason,
        variant=payload.agent.ab_test_variant,
        debug_metadata={
            "model": payload.agent.model,
            "temperature": payload.agent.temperature,
            "top_p": payload.agent.top_p,
            "memory_turns_used": len(history),
        },
    )

    if payload.agent.integrations.crm_auto_sync and payload.agent.integrations.crm_provider == "HubSpot":
        background_tasks.add_task(sync_lead_to_hubspot, payload.lead, result)

    return result


def synthesize_agent_audio(text: str, voice: str = "nova") -> bytes:
    """
    Helper that turns agent text into mp3 bytes using OpenAI TTS.
    """
    audio_bytes = b""
    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice=voice,
        input=text,
    ) as response:
        for chunk in response.iter_bytes():
            audio_bytes += chunk
    return audio_bytes


def sanitize_header_value(value: str) -> str:
    """
    Ensures header values avoid characters that break latin-1 encoding.
    """
    value = value.replace("\r", " ").replace("\n", " ")
    try:
        value.encode("latin-1")
        return value
    except UnicodeEncodeError:
        return value.encode("latin-1", "ignore").decode("latin-1")




def build_system_prompt(agent: AgentConfig, lead: LeadContext, settings: CallSettings) -> str:
    """
    System prompt encoding persona, objection handling, ROI storytelling,
    multi-language support, and channel-specific behavior.
    """
    persona = agent.persona
    channel = settings.channel.value

    return f"""
You are **{agent.name}**, a {persona.tier} outbound sales closer focused on demos and contracts.

Personality & tone:
- {persona.description}
- Tone: {persona.tone}
- Storytelling: {persona.storytelling_focus}
- Always aim to move the conversation forward with an assumptive close.

Channel & format:
- Current channel: {channel}
- If channel is 'phone' or 'video', keep responses conversational and speakable.
- If channel is 'chat' or 'meeting', you can use short bullet points, but still keep it concise.

Sales behavior:
- Quickly qualify using frameworks like BANT / SPICED (budget, authority, need, timeline).
- Focus heavily on ROI, business impact, and time-to-value for the buyer.
- Handle objections clearly and confidently (pricing, timing, competitors, integrations, proof).
- Offer clear, specific next steps (e.g., book a demo, send contract, introduce AE).
- You can negotiate pricing, but protect margin; trade discounts for commitment (longer term, multi-seat).
- Avoid being pushy; be consultative and value-based.

Opening behavior:
- On the very first response in each conversation, greet the prospect warmly and introduce yourself as {agent.name}, their dedicated Apex Sales Pro closer, before addressing their question.
- After you have introduced yourself once, do not keep repeating your name or recycled talking points unless the prospect explicitly asks for them again.

Conversation flow:
- Treat each call as a natural human conversation: acknowledge what the prospect just said, reference earlier moments from this same call when helpful, and avoid restating the full backstory every turn.
- Pivot quickly to the prospect's current question or objection; only reuse prior messaging when it directly moves the conversation forward.
- Vary your phrasing so the conversation feels like two people talking, not a script being read.

Multi-language:
- If the prospect speaks a language other than English, mirror their language.
- Lead's preferred language: {lead.preferred_language or "unknown"}.
- If unclear, default to English.

Lead context:
- Lead ID: {lead.lead_id}
- Name: {lead.name}
- Company: {lead.company}
- Role: {lead.role}
- Region: {lead.region}
- Estimated deal size: {lead.estimated_deal_size} {lead.currency}
- Pain points: {", ".join(lead.pain_points) if lead.pain_points else "N/A"}
- Current tools: {lead.current_tools}
- Notes: {lead.notes}

Next step target for this interaction:
- Primary goal: {settings.target_next_step} (e.g., book_demo, send_contract, schedule_followup)

Output style:
- Be concise.
- Respect the channel.
- End most messages with a simple assumptive next step question or confirmation.
    """.strip()


def convert_history_to_openai_messages(history: List[ConversationTurn]) -> List[Dict[str, str]]:
    """
    Convert our internal history to OpenAI chat format.
    'prospect' -> 'user', 'agent' -> 'assistant'.
    """
    messages: List[Dict[str, str]] = []
    for turn in history:
        if turn.role == "prospect":
            messages.append({"role": "user", "content": turn.content})
        else:
            messages.append({"role": "assistant", "content": turn.content})
    return messages


def analyze_sentiment(text: str) -> SentimentLabel:
    """
    Very simple sentiment analysis via OpenAI.
    In a real system you'd probably optimize or batch this.
    """
    sentiment_prompt = f"""
Classify the sentiment of this prospect message as one of:
very_negative, negative, neutral, positive, very_positive.

Message:
{text}
"""
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a precise sentiment analysis classifier."},
            {"role": "user", "content": sentiment_prompt},
        ],
        max_tokens=8,
        temperature=0.0,
    )
    label_text = completion.choices[0].message.content.strip().lower()
    # Robust fallback mapping
    if "very negative" in label_text:
        return SentimentLabel.very_negative
    if "negative" in label_text and "very" not in label_text:
        return SentimentLabel.negative
    if "very positive" in label_text:
        return SentimentLabel.very_positive
    if "positive" in label_text and "very" not in label_text:
        return SentimentLabel.positive
    return SentimentLabel.neutral


def score_lead(lead: LeadContext, history: List[ConversationTurn]) -> int:
    """
    Simple lead scoring stub (0-100).
    You can replace this with your own logic or another model call.
    """
    score = 50
    if lead.estimated_deal_size and lead.estimated_deal_size > 10000:
        score += 10
    if lead.role and any(k in lead.role.lower() for k in ["cfo", "vp", "director", "head"]):
        score += 10
    if lead.region and lead.region.lower() in {"us", "usa", "north america"}:
        score += 5
    if history:
        last = history[-1]
        if last.sentiment in {SentimentLabel.positive, SentimentLabel.very_positive}:
            score += 10
        if last.sentiment in {SentimentLabel.negative, SentimentLabel.very_negative}:
            score -= 10
    return max(0, min(100, score))


def determine_next_step(lead_score: int, settings: CallSettings) -> (str, str): # type: ignore
    """
    Simple rule-based next-step recommendation.
    """
    if lead_score >= 80:
        step = "send_contract"
        reason = "Lead is highly qualified with strong buying signals."
    elif lead_score >= 60:
        step = "book_demo"
        reason = "Lead appears qualified but may still need to see the product in action."
    elif lead_score >= 40:
        step = "schedule_discovery_call"
        reason = "Lead shows some interest but needs more discovery and value alignment."
    else:
        step = "nurture_sequence"
        reason = "Signals are weak; better to add to nurture sequence instead of pushing for a meeting."
    # Prefer explicit goal from settings if provided
    if settings.target_next_step and settings.target_next_step != step:
        reason += f" Primary campaign target is {settings.target_next_step}."
    return step, reason


def build_demo_request() -> ApexSalesRequest:
    """
    Creates a ready-to-run Apex request payload for simplified testing.
    """
    agent = AgentConfig()
    lead = LeadContext(
        lead_id="LEAD-DEMO-001",
        name="Jordan",
        company="Northwind Analytics",
        role="COO",
        region="USA",
        email="jordan@nwanalytics.com",
        phone="+15551231234",
        estimated_deal_size=25000,
        notes="Inbound demo request from website CTA.",
        preferred_language="en",
    )
    history = [
        ConversationTurn(
            role="prospect",
            content="Hi, I'm curious how you can help us automate onboarding.",
            sentiment=SentimentLabel.neutral,
        )
    ]
    settings = CallSettings(
        channel=Channel.phone,
        call_id="CALL-DEMO-001",
        call_attempt=1,
        allow_negotiation=True,
        target_next_step="book_demo",
        max_agent_response_tokens=600,
    )
    return ApexSalesRequest(
        agent=agent,
        lead=lead,
        settings=settings,
        history=history,
        custom_variables={},
    )


def default_realtime_instructions() -> str:
    """
    Reuse the normal system prompt so realtime sessions sound like Apex.
    """
    payload = build_demo_request()
    return build_system_prompt(payload.agent, payload.lead, payload.settings)


def sync_lead_to_hubspot(lead: LeadContext, call_result: ApexSalesResponse):
    """
    Minimal CRM sync stub so the agent can auto-push updates into HubSpot.
    """
    if not HUBSPOT_API_KEY:
        print("[CRM] HUBSPOT_API_KEY not set, skipping HubSpot sync.")
        return

    headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json",
    }
    contact_body = {
        "properties": {
            "email": lead.email,
            "firstname": lead.name,
            "phone": lead.phone,
            "company": lead.company,
            "jobtitle": lead.role,
            "country": lead.region,
            "lifecyclestage": "opportunity",
            "apex_lead_score": call_result.lead_score,
            "apex_last_agent_message": call_result.agent_message,
            "apex_recommended_next_step": call_result.recommended_next_step,
        }
    }

    try:
        with httpx.Client(base_url="https://api.hubapi.com", headers=headers, timeout=10.0) as client:
            response = client.post("/crm/v3/objects/contacts", json=contact_body)
            print("[CRM] Contact sync response:", response.status_code)
    except Exception as exc:
        print("[CRM] Error syncing lead:", exc)


def _estimate_audio_ms_from_b64(audio_b64: Optional[str]) -> float:
    if not audio_b64:
        return 0.0
    padding = audio_b64.count("=")
    byte_length = (len(audio_b64) * 3) // 4 - padding
    if byte_length <= 0:
        return 0.0
    samples = byte_length / 2.0  # 2 bytes per PCM16 sample
    return (samples / REALTIME_SAMPLE_RATE) * 1000.0


async def _forward_client_to_openai(client_ws: WebSocket, openai_ws):
    audio_frames_forwarded = 0
    total_audio_ms = 0.0
    audio_items_forwarded = 0
    try:
        while True:
            data = await client_ws.receive()
            text = data.get("text")
            binary = data.get("bytes")
            if text is not None:
                await openai_ws.send(text)
                try:
                    payload = json.loads(text)
                except json.JSONDecodeError:
                    payload = None
                if payload:
                    msg_type = payload.get("type")
                    if msg_type == "input_audio_buffer.append":
                        audio_frames_forwarded += 1
                        ms = _estimate_audio_ms_from_b64(payload.get("audio"))
                        total_audio_ms += ms
                        if audio_frames_forwarded <= 5 or audio_frames_forwarded % 50 == 0:
                            print(
                                f"[REALTIME] Forwarded {audio_frames_forwarded} audio frames (~{total_audio_ms:.1f} ms total)."
                            )
                    elif msg_type == "conversation.item.create":
                        item = payload.get("item") or {}
                        contents = item.get("content") or []
                        item_ms = 0.0
                        for part in contents:
                            if isinstance(part, dict) and part.get("type") == "input_audio":
                                item_ms += _estimate_audio_ms_from_b64(part.get("audio"))
                        if item_ms > 0:
                            audio_items_forwarded += 1
                            print(
                                f"[REALTIME] Forwarded conversation audio item #{audio_items_forwarded} (~{item_ms:.1f} ms)."
                            )
                    elif msg_type == "input_audio_buffer.commit":
                        print(
                            f"[REALTIME] Client requested buffer commit after {audio_frames_forwarded} frames (~{total_audio_ms:.1f} ms)."
                        )
                    elif msg_type == "input_audio_buffer.clear":
                        audio_frames_forwarded = 0
                        total_audio_ms = 0.0
            elif binary is not None:
                await openai_ws.send(binary)
    except WebSocketDisconnect:
        pass


async def _forward_openai_to_client(client_ws: WebSocket, openai_ws):
    try:
        async for message in openai_ws:
            if isinstance(message, bytes):
                await client_ws.send_bytes(message)
            else:
                await client_ws.send_text(message)
                try:
                    payload = json.loads(message)
                except json.JSONDecodeError:
                    payload = None
                if payload:
                    event_type = payload.get("type")
                    interesting = {
                        "error",
                        "response.created",
                        "response.completed",
                        "response.done",
                        "response.text.delta",
                        "response.audio.delta",
                        "conversation.item.created",
                    }
                    if event_type in interesting:
                        if event_type == "error":
                            print(f"[REALTIME<-OAI] {event_type}: {payload.get('error')}")
                        else:
                            print(f"[REALTIME<-OAI] {event_type}")
    except websockets.ConnectionClosed:
        pass


async def bridge_realtime_session(client_ws: WebSocket, instructions: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        await client_ws.send_text(json.dumps({"type": "error", "message": "Missing OPENAI_API_KEY"}))
        await client_ws.close(code=1011)
        return

    uri = f"wss://api.openai.com/v1/realtime?model={REALTIME_MODEL}"
    headers = [
        ("Authorization", f"Bearer {api_key}"),
        ("OpenAI-Beta", "realtime=v1"),
    ]

    async with websockets.connect(uri, additional_headers=headers) as openai_ws:
        await openai_ws.send(
            json.dumps(
                {
                    "type": "session.update",
                    "session": {
                        "instructions": instructions,
                        "voice": "alloy",
                        "input_audio_format": "pcm16",
                        "modalities": ["text", "audio"],
                    },
                }
            )
        )
        client_task = asyncio.create_task(_forward_client_to_openai(client_ws, openai_ws))
        server_task = asyncio.create_task(_forward_openai_to_client(client_ws, openai_ws))
        done, pending = await asyncio.wait(
            [client_task, server_task],
            return_when=asyncio.FIRST_EXCEPTION,
        )
        for task in pending:
            task.cancel()


# =========================
# ENDPOINTS
# =========================

@app.get("/agents/apex-sales-pro/config", response_model=AgentConfig)
def get_default_agent_config():
    """
    Get the default Apex Sales Pro agent configuration (for UI / debugging).
    """
    return AgentConfig()


@app.post("/agents/apex-sales-pro/chat", response_model=ApexSalesResponse)
def apex_sales_chat(payload: ApexSalesRequest, background_tasks: BackgroundTasks):
    """
    Generate the next Apex Sales Pro message for a given lead, channel, and history.
    """
    return run_apex_sales_turn(payload, background_tasks)


@app.post("/agents/apex-sales-pro/chat-demo", response_model=ApexSalesResponse)
def apex_sales_chat_demo(background_tasks: BackgroundTasks):
    """
    Fire the agent with a built-in payload so you can test without crafting JSON.
    """
    payload = build_demo_request()
    return run_apex_sales_turn(payload, background_tasks)


@app.post("/agents/apex-sales-pro/chat-voice", response_class=StreamingResponse)
def apex_sales_chat_voice(payload: ApexSalesRequest, background_tasks: BackgroundTasks):
    """
    Same as /chat but returns an MP3 stream of the agent response.
    """
    result = run_apex_sales_turn(payload, background_tasks)
    audio_bytes = synthesize_agent_audio(result.agent_message, voice=payload.agent.voice)
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
        headers={"X-Agent-Message": sanitize_header_value(result.agent_message)},
    )


@app.post("/agents/apex-sales-pro/chat-voice-demo")
def apex_sales_chat_voice_demo(background_tasks: BackgroundTasks):
    """
    Same as chat-demo but streams an MP3 audio reply (X-Agent-Message header carries text).
    """
    payload = build_demo_request()
    result = run_apex_sales_turn(payload, background_tasks)
    audio_bytes = synthesize_agent_audio(result.agent_message, voice=payload.agent.voice)
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
        headers={"X-Agent-Message": sanitize_header_value(result.agent_message)},
    )


@app.post("/integrations/zoom/webhook")
async def zoom_webhook(request: Request):
    """
    Receives meeting lifecycle events from Zoom (or a CPaaS bridge).
    """
    body = await request.json()
    event_type = body.get("event")
    payload = body.get("payload", {})
    print("[ZOOM] event:", event_type, "payload:", payload)
    # TODO: map Zoom meeting audio streams to call_id / lead contexts here.
    return {"status": "ok"}


@app.websocket("/ws/agents/apex-sales-pro/realtime")
async def apex_sales_realtime_socket(websocket: WebSocket):
    """
    WebSocket bridge that lets browsers/telephony send audio to OpenAI Realtime and
    receive synthesized replies in near real-time.
    """
    await websocket.accept()
    instructions = default_realtime_instructions()
    try:
        await bridge_realtime_session(websocket, instructions)
    except Exception as exc:
        await websocket.close(code=1011, reason=str(exc))


def simulate_webhook_push(event_type: str, call_id: str, lead_id: Optional[str]):
    """
    Stub for webhook delivery; in a real system you'd do an HTTP POST
    to the configured webhook URLs. Here we just print for demo.
    """
    print(f"[WEBHOOK] {event_type} for call_id={call_id}, lead_id={lead_id}")


@app.post("/webhooks/call-events")
def receive_call_webhook(event: WebhookEvent):
    """
    Endpoint to receive call-related webhooks from your telephony/meeting system:
    - call.started
    - call.completed
    - call.failed
    - call.voicemail

    For now, only logs them.
    """
    print(f"[INBOUND WEBHOOK] {event.event_type} - {event.call_id} - payload={event.payload}")
    return {"status": "ok"}


@app.post("/telephony/dial")
def dial_any_number(request_data: DialRequest):
    """
    Simple stub to show how you'd tell a telephony provider to dial any number.
    """
    print(
        f"[DIALER] Dialing {request_data.phone_number} from {request_data.caller_id} "
        f"with agent {request_data.agent_name} metadata={request_data.metadata}"
    )
    # In production you'd call Twilio/Vonage/etc. here.
    return {
        "status": "initiated",
        "phone_number": request_data.phone_number,
        "caller_id": request_data.caller_id,
        "agent": request_data.agent_name,
    }


@app.get("/calls/{call_id}/log", response_model=List[ConversationTurn])
def get_call_log(call_id: str):
    """
    Return the in-memory call log for debugging / QA.
    """
    if call_id not in CALL_LOGS:
        raise HTTPException(status_code=404, detail="Call log not found.")
    return CALL_LOGS[call_id]
