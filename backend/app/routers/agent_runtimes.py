import io
import sys
from pathlib import Path
from typing import Dict, List, TypedDict

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, WebSocket
from fastapi.responses import StreamingResponse

# Make the sibling apex_sales_pro package importable when the API is launched
# from backend/app.
BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

from apex_sales_pro import main as apex_runtime  # type: ignore  # noqa: E402

router = APIRouter(tags=["Agent Runtime"])


class RuntimeAgentBlueprint(TypedDict):
    config: apex_runtime.AgentConfig
    lead: apex_runtime.LeadContext
    history: List[apex_runtime.ConversationTurn]
    settings: apex_runtime.CallSettings


def _apex_blueprint() -> RuntimeAgentBlueprint:
    demo = apex_runtime.build_demo_request()
    return {
        "config": demo.agent,
        "lead": demo.lead,
        "history": demo.history,
        "settings": demo.settings,
    }


AGENT_BLUEPRINTS: Dict[str, RuntimeAgentBlueprint] = {
    "apex-sales-pro": _apex_blueprint(),
    "zenith-support": {
        "config": apex_runtime.AgentConfig(
            name="Zenith Support Agent",
            model="gpt-4o-mini",
            voice="alloy",
            deployment_channels=[
                apex_runtime.Channel.phone,
                apex_runtime.Channel.video,
                apex_runtime.Channel.chat,
                apex_runtime.Channel.meeting,
            ],
            temperature=0.35,
            top_p=0.9,
            memory_turns=20,
            persona=apex_runtime.AgentPersona(
                tier="Platinum",
                description="Empathetic tier-2 support agent that triages, troubleshoots, and resolves complex product cases.",
                tone="calm, patient, solution-focused",
                closing_style="confirm resolution and surface next helpful action",
                storytelling_focus="clear troubleshooting, reassurance, and expectation setting",
            ),
            advanced=apex_runtime.AgentAdvancedSettings(
                fallback_routing="escalate_to_human_if_blocked",
                record_calls=True,
                transcribe_calls=True,
                rate_limit_per_minute=40,
            ),
            integrations=apex_runtime.AgentIntegrations(
                crm_provider="HubSpot",
                crm_auto_sync=True,
                lead_scoring_enabled=False,
            ),
            ab_test_variant="support-A",
        ),
        "lead": apex_runtime.LeadContext(
            lead_id="SUPPORT-DEMO-001",
            name="Casey",
            company="AcmeSoft",
            role="IT Manager",
            region="USA",
            email="casey@acmesoft.com",
            phone="+15550101010",
            pain_points=["SSO failing for VIPs", "Unable to provision new seats"],
            preferred_language="en",
            notes="Enterprise customer with high urgency ticket.",
        ),
        "history": [
            apex_runtime.ConversationTurn(
                role="prospect",
                content="Hi, our SSO stopped working for some users after yesterday's update.",
                sentiment=apex_runtime.SentimentLabel.negative,
            )
        ],
        "settings": apex_runtime.CallSettings(
            channel=apex_runtime.Channel.chat,
            call_id="SUPPORT-CALL-001",
            call_attempt=1,
            allow_negotiation=False,
            target_next_step="resolve_issue",
            max_agent_response_tokens=450,
        ),
    },
    "quantum-scheduler": {
        "config": apex_runtime.AgentConfig(
            name="Quantum Scheduler",
            model="gpt-4o-mini",
            voice="fable",
            deployment_channels=[
                apex_runtime.Channel.phone,
                apex_runtime.Channel.chat,
                apex_runtime.Channel.meeting,
            ],
            temperature=0.35,
            top_p=0.9,
            memory_turns=12,
            persona=apex_runtime.AgentPersona(
                tier="Gold",
                description="Logistics-focused meeting concierge that owns scheduling, reminders, and conflict resolution.",
                tone="polished, efficient, helpful",
                closing_style="lock in times quickly and confirm invites",
                storytelling_focus="time savings, reduced no-shows, smooth coordination",
            ),
            advanced=apex_runtime.AgentAdvancedSettings(
                voicemail_strategy="leave_callback_number",
                record_calls=False,
                transcribe_calls=True,
                rate_limit_per_minute=50,
            ),
            integrations=apex_runtime.AgentIntegrations(
                crm_provider=None,
                crm_auto_sync=False,
                conferencing_platforms=["Zoom", "Google Meet", "Teams", "Webex"],
            ),
            ab_test_variant="scheduler-A",
        ),
        "lead": apex_runtime.LeadContext(
            lead_id="SCHED-DEMO-001",
            name="Priya",
            company="Northwind Analytics",
            role="Operations Lead",
            region="UK",
            email="priya@nwanalytics.com",
            preferred_language="en-GB",
            notes="Needs to coordinate a 6-person kickoff with multiple time zones.",
        ),
        "history": [
            apex_runtime.ConversationTurn(
                role="prospect",
                content="Can you find a time next week for a 60 minute kickoff with New York, London, and Sydney?",
                sentiment=apex_runtime.SentimentLabel.neutral,
            )
        ],
        "settings": apex_runtime.CallSettings(
            channel=apex_runtime.Channel.chat,
            call_id="SCHED-CALL-001",
            call_attempt=1,
            allow_negotiation=True,
            target_next_step="book_meeting",
            max_agent_response_tokens=400,
        ),
    },
    "summit-onboarding": {
        "config": apex_runtime.AgentConfig(
            name="Summit Onboarding",
            model="gpt-4o-mini",
            voice="verse",
            deployment_channels=[
                apex_runtime.Channel.phone,
                apex_runtime.Channel.video,
                apex_runtime.Channel.chat,
            ],
            temperature=0.4,
            top_p=0.9,
            memory_turns=18,
            persona=apex_runtime.AgentPersona(
                tier="Gold",
                description="Guided onboarding and implementation specialist that removes friction and drives adoption.",
                tone="reassuring, proactive, clear",
                closing_style="summarize progress and set the next milestone",
                storytelling_focus="speed-to-value, confidence, and clear checklists",
            ),
            advanced=apex_runtime.AgentAdvancedSettings(
                record_calls=True,
                transcribe_calls=True,
                retain_days=45,
                rate_limit_per_minute=30,
            ),
            integrations=apex_runtime.AgentIntegrations(
                crm_provider="HubSpot",
                crm_auto_sync=True,
                conferencing_platforms=["Zoom", "Google Meet", "Teams"],
            ),
            ab_test_variant="onboarding-A",
        ),
        "lead": apex_runtime.LeadContext(
            lead_id="ONBOARD-DEMO-001",
            name="Morgan",
            company="Helio Health",
            role="Implementation Manager",
            region="USA",
            email="morgan@heliohealth.com",
            preferred_language="en",
            notes="Needs a clear rollout plan for 150 seats across three departments.",
        ),
        "history": [
            apex_runtime.ConversationTurn(
                role="prospect",
                content="We want a phased rollout but need help sequencing training and permissions.",
                sentiment=apex_runtime.SentimentLabel.neutral,
            )
        ],
        "settings": apex_runtime.CallSettings(
            channel=apex_runtime.Channel.video,
            call_id="ONBOARD-CALL-001",
            call_attempt=1,
            allow_negotiation=False,
            target_next_step="plan_milestones",
            max_agent_response_tokens=500,
        ),
    },
    "commerce-concierge": {
        "config": apex_runtime.AgentConfig(
            name="Commerce Concierge",
            model="gpt-4o-mini",
            voice="shimmer",
            deployment_channels=[
                apex_runtime.Channel.chat,
                apex_runtime.Channel.phone,
            ],
            temperature=0.5,
            top_p=0.9,
            memory_turns=10,
            persona=apex_runtime.AgentPersona(
                tier="Gold",
                description="Retail-focused assistant that guides buyers, recovers carts, and handles post-purchase care.",
                tone="friendly, enthusiastic, trustworthy",
                closing_style="recommend and confirm purchase choices",
                storytelling_focus="product benefits, fit, and fast checkout",
            ),
            advanced=apex_runtime.AgentAdvancedSettings(
                max_call_duration_seconds=600,
                rate_limit_per_minute=60,
                voicemail_strategy="retry_and_sms",
                record_calls=False,
                transcribe_calls=False,
            ),
            integrations=apex_runtime.AgentIntegrations(
                crm_provider=None,
                crm_auto_sync=False,
                lead_scoring_enabled=True,
                conferencing_platforms=["Voice", "Chat"],
            ),
            ab_test_variant="commerce-A",
        ),
        "lead": apex_runtime.LeadContext(
            lead_id="COMMERCE-DEMO-001",
            name="Alex",
            company="Personal",
            role="Buyer",
            region="USA",
            email="alex@example.com",
            preferred_language="en",
            notes="Comparing bundles and unsure about sizing and shipping speed.",
        ),
        "history": [
            apex_runtime.ConversationTurn(
                role="prospect",
                content="I'm between the pro and premium bundle. Can you help me decide and place the order?",
                sentiment=apex_runtime.SentimentLabel.positive,
            )
        ],
        "settings": apex_runtime.CallSettings(
            channel=apex_runtime.Channel.chat,
            call_id="COMMERCE-CALL-001",
            call_attempt=1,
            allow_negotiation=True,
            target_next_step="complete_purchase",
            max_agent_response_tokens=380,
        ),
    },
}


def get_blueprint(agent_slug: str) -> RuntimeAgentBlueprint:
    blueprint = AGENT_BLUEPRINTS.get(agent_slug)
    if blueprint:
        return blueprint
    raise HTTPException(status_code=404, detail=f"Agent '{agent_slug}' is not configured.")


def merge_agent_config(agent_slug: str, incoming: apex_runtime.AgentConfig) -> apex_runtime.AgentConfig:
    base = get_blueprint(agent_slug)["config"]
    merged = base.model_dump()
    incoming_data = incoming.model_dump(exclude_none=True)
    for field, value in incoming_data.items():
        if field in {"name", "persona"}:
            continue
        merged[field] = value
    merged["name"] = base.name
    merged["persona"] = base.persona.model_dump()
    return apex_runtime.AgentConfig(**merged)


def build_demo_request_for(agent_slug: str) -> apex_runtime.ApexSalesRequest:
    blueprint = get_blueprint(agent_slug)
    return apex_runtime.ApexSalesRequest(
        agent=blueprint["config"].model_copy(deep=True),
        lead=blueprint["lead"].model_copy(deep=True),
        settings=blueprint["settings"].model_copy(deep=True),
        history=[turn.model_copy(deep=True) for turn in blueprint["history"]],
        custom_variables={},
    )


def build_runtime_request(agent_slug: str, payload: apex_runtime.ApexSalesRequest) -> apex_runtime.ApexSalesRequest:
    payload.agent = merge_agent_config(agent_slug, payload.agent)
    return payload


@router.get("/agents/{agent_slug}/config", response_model=apex_runtime.AgentConfig)
async def get_agent_config(agent_slug: str):
    """
    Return the default runtime configuration for the requested agent template.
    """
    blueprint = get_blueprint(agent_slug)
    return blueprint["config"]


@router.post("/agents/{agent_slug}/chat", response_model=apex_runtime.ApexSalesResponse)
async def agent_chat(agent_slug: str, payload: apex_runtime.ApexSalesRequest, background_tasks: BackgroundTasks):
    """
    Generate the next turn for a given specialized agent (sales, support, scheduling, onboarding, commerce).
    """
    runtime_payload = build_runtime_request(agent_slug, payload)
    return apex_runtime.run_apex_sales_turn(runtime_payload, background_tasks)


@router.post("/agents/{agent_slug}/chat-demo", response_model=apex_runtime.ApexSalesResponse)
async def agent_chat_demo(agent_slug: str, background_tasks: BackgroundTasks):
    """
    Trigger the agent using a baked-in demo payload so UI testers can hit /docs quickly.
    """
    payload = build_demo_request_for(agent_slug)
    return apex_runtime.run_apex_sales_turn(payload, background_tasks)


@router.post("/agents/{agent_slug}/chat-voice", response_class=StreamingResponse)
async def agent_chat_voice(agent_slug: str, payload: apex_runtime.ApexSalesRequest, background_tasks: BackgroundTasks):
    """
    Same as /chat but returns an MP3 stream of the agent response.
    """
    runtime_payload = build_runtime_request(agent_slug, payload)
    result = apex_runtime.run_apex_sales_turn(runtime_payload, background_tasks)
    audio_bytes = apex_runtime.synthesize_agent_audio(result.agent_message, voice=runtime_payload.agent.voice)
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
        headers={"X-Agent-Message": apex_runtime.sanitize_header_value(result.agent_message)},
    )


@router.post("/agents/{agent_slug}/chat-voice-demo")
async def agent_chat_voice_demo(agent_slug: str, background_tasks: BackgroundTasks):
    """
    Same as chat-demo but streams an MP3 audio reply (X-Agent-Message header carries text).
    """
    payload = build_demo_request_for(agent_slug)
    result = apex_runtime.run_apex_sales_turn(payload, background_tasks)
    audio_bytes = apex_runtime.synthesize_agent_audio(result.agent_message, voice=payload.agent.voice)
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
        headers={"X-Agent-Message": apex_runtime.sanitize_header_value(result.agent_message)},
    )


@router.websocket("/ws/agents/{agent_slug}/realtime")
async def agent_realtime_socket(agent_slug: str, websocket: WebSocket):
    """
    WebSocket bridge for live audio/text streaming into OpenAI Realtime for any configured agent.
    """
    blueprint = get_blueprint(agent_slug)
    instructions = apex_runtime.build_system_prompt(
        blueprint["config"], blueprint["lead"], blueprint["settings"]
    )
    await websocket.accept()
    try:
        await apex_runtime.bridge_realtime_session(websocket, instructions)
    except Exception as exc:
        await websocket.close(code=1011, reason=str(exc))


@router.post("/integrations/{agent_slug}/zoom/webhook")
async def zoom_webhook(agent_slug: str, request: Request):
    """
    Receives meeting lifecycle events and tags them with the target agent.
    """
    _ = get_blueprint(agent_slug)
    body = await request.json()
    print(f"[ZOOM] event for {agent_slug}:", body)
    return {"status": "ok"}


@router.post("/webhooks/{agent_slug}/call-events")
async def receive_call_webhook(agent_slug: str, event: apex_runtime.WebhookEvent):
    """
    Receive call-related webhooks and log them with the agent slug for debugging.
    """
    _ = get_blueprint(agent_slug)
    print(f"[INBOUND WEBHOOK][{agent_slug}] {event.event_type} - {event.call_id} - payload={event.payload}")
    return {"status": "ok"}


@router.post("/telephony/{agent_slug}/dial")
async def dial_any_number(agent_slug: str, request_data: apex_runtime.DialRequest):
    """
    Stub dialer endpoint that tags the request with the chosen agent.
    """
    blueprint = get_blueprint(agent_slug)
    agent_name = blueprint["config"].name
    print(
        f"[DIALER][{agent_slug}] Dialing {request_data.phone_number} from {request_data.caller_id} "
        f"with agent {agent_name} metadata={request_data.metadata}"
    )
    return {
        "status": "initiated",
        "phone_number": request_data.phone_number,
        "caller_id": request_data.caller_id,
        "agent": agent_name,
    }


@router.get("/calls/{call_id}/log", response_model=List[apex_runtime.ConversationTurn])
async def get_call_log(call_id: str):
    """
    Return the in-memory call log for debugging / QA.
    """
    if call_id not in apex_runtime.CALL_LOGS:
        raise HTTPException(status_code=404, detail="Call log not found.")
    return apex_runtime.CALL_LOGS[call_id]
