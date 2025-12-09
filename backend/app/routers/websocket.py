import base64
from datetime import datetime
from typing import Dict
from uuid import uuid4
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.models.agent import Agent
from app.models.call import CallLog
from app.services.call_sessions import CallSessionState, call_session_manager
from app.services.openai_service import openai_service

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[str, list] = {
    "calls": {},
    "notifications": {},
    "agents": {},
}


async def safe_websocket_send(websocket: WebSocket, message: dict):
    """Safely send a message through websocket, ignoring connection errors."""
    try:
        await websocket.send_json(message)
    except (RuntimeError, WebSocketDisconnect):
        # Websocket is already closed, ignore
        pass


class ConnectionManager:
    """Manage WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, list] = {}
    
    async def connect(self, websocket: WebSocket, connection_id: str):
        """Accept and store WebSocket connection."""
        await websocket.accept()
        if connection_id not in self.active_connections:
            self.active_connections[connection_id] = []
        self.active_connections[connection_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, connection_id: str):
        """Remove WebSocket connection."""
        if connection_id in self.active_connections:
            self.active_connections[connection_id].remove(websocket)
            if not self.active_connections[connection_id]:
                del self.active_connections[connection_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific WebSocket."""
        await websocket.send_json(message)
    
    async def broadcast(self, message: dict, connection_id: str):
        """Broadcast message to all connections in group."""
        if connection_id in self.active_connections:
            for connection in self.active_connections[connection_id]:
                await connection.send_json(message)


call_manager = ConnectionManager()
notification_manager = ConnectionManager()
agent_manager = ConnectionManager()


@router.websocket("/calls/{call_id}")
async def websocket_call_updates(
    websocket: WebSocket,
    call_id: int,
    token: str = Query(...),
    session: Session = Depends(get_session),
):
    """WebSocket for real-time call updates."""
    # TODO: Validate token and user access to call
    
    connection_id = f"call_{call_id}"
    await call_manager.connect(websocket, connection_id)
    
    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connected",
            "call_id": call_id,
            "message": "Connected to call updates",
        })
        
        # Keep connection alive and listen for messages
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
            # Echo received data (for testing)
            await call_manager.broadcast({
                "type": "call_update",
                "call_id": call_id,
                "data": data,
            }, connection_id)
    
    except WebSocketDisconnect:
        call_manager.disconnect(websocket, connection_id)
        print(f"Client disconnected from call {call_id}")


@router.websocket("/calls/live/{session_id}")
async def websocket_live_voice_call(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(...),
    session: Session = Depends(get_session),
):
    """WebSocket that streams audio for an active VoiceAI call."""
    state = call_session_manager.get_session(session_id)
    if not state or state.token != token:
        await websocket.close(code=4403)
        return

    call_log = session.get(CallLog, state.call_id)
    agent = session.get(Agent, state.agent_id)
    if not call_log or not agent:
        call_session_manager.remove_session(session_id)
        await websocket.close(code=4404)
        return

    await websocket.accept()
    await websocket.send_json({
        "type": "connected",
        "call_id": call_log.id,
        "agent_id": agent.id,
        "message": "Live call session established",
    })

    # Trigger initial greeting
    await _generate_initial_greeting(
        websocket=websocket,
        call_log=call_log,
        state=state,
        session=session,
    )

    def _normalize_extension(ext: str | None, default: str = ".wav") -> str:
        """Normalize extension or mime-type to a supported suffix for Whisper."""
        # Force WAV for all audio to avoid codec compatibility issues
        # Even though OpenAI supports other formats, WebM and other containers
        # can have incompatible codecs that cause 400 errors
        return ".wav"

    audio_extension = _normalize_extension(state.metadata.get("audio_extension"), ".wav")
    last_audio_process = datetime.utcnow()

    try:
        while True:
            payload = await websocket.receive_json()
            event_type = payload.get("type")

            if event_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if event_type == "audio_chunk":
                chunk_b64 = payload.get("data")
                if not chunk_b64:
                    continue
                try:
                    chunk = base64.b64decode(chunk_b64)
                    
                    # Validate audio chunk before adding to buffer
                    if len(chunk) < 100:  # Skip tiny chunks that are likely noise
                        continue
                    if len(chunk) > 1024 * 1024:  # Skip chunks larger than 1MB
                        continue
                    
                    original_extension = payload.get("file_extension")
                    audio_extension = _normalize_extension(original_extension, audio_extension)
                    
                    # Debug logging
                    if original_extension != audio_extension:
                        print(f"Audio extension converted: {original_extension} -> {audio_extension}")
                    
                    state.metadata["audio_extension"] = audio_extension
                    state.push_audio(chunk)
                    
                    # Auto-process buffered audio for low latency responses
                    now = datetime.utcnow()
                    if len(state.audio_buffer) > 12000 or (now - last_audio_process).total_seconds() > 1.5:
                        await _process_audio_buffer(
                            websocket=websocket,
                            state=state,
                            call_log=call_log,
                            session=session,
                            audio_extension=audio_extension,
                        )
                        last_audio_process = datetime.utcnow()
                except Exception:
                    # Only try to send error if websocket is still connected
                    await safe_websocket_send(websocket, {"type": "error", "message": "Invalid audio chunk"})
                continue

            if event_type == "user_text":
                user_text = (payload.get("text") or "").strip()
                if user_text:
                    user_message_id = uuid4().hex
                    await websocket.send_json({
                        "type": "transcript",
                        "role": "user",
                        "text": user_text,
                        "message_id": user_message_id,
                    })
                    await _handle_agent_turn(
                        websocket=websocket,
                        user_text=user_text,
                        user_message_id=user_message_id,
                        call_log=call_log,
                        state=state,
                        session=session,
                    )
                continue

            if event_type == "end_utterance":
                audio_bytes = state.pop_audio()
                if not audio_bytes or len(audio_bytes) < 200:
                    # Send a spoken prompt so the user hears a response
                    assistant_text = "I didn't catch that. Could you please repeat?"
                    assistant_message_id = uuid4().hex
                    state.append_history("assistant", assistant_text, message_id=assistant_message_id)
                    call_log.transcript = state.history
                    session.add(call_log)
                    session.commit()
                    await websocket.send_json({
                        "type": "transcript",
                        "role": "assistant",
                        "text": assistant_text,
                        "message_id": assistant_message_id,
                    })
                    await send_call_update(call_log.id, {"type": "transcript", "role": "assistant", "text": assistant_text})
                    try:
                        audio_bytes = await openai_service.text_to_speech(
                            text=assistant_text,
                            voice=state.voice,
                            model="tts-1",
                        )
                        await websocket.send_json({
                            "type": "audio_chunk",
                            "role": "assistant",
                            "data": base64.b64encode(audio_bytes).decode("utf-8"),
                            "message_id": assistant_message_id,
                        })
                    except Exception:
                        pass
                    continue

                whisper_language = state.language.split("-")[0]
                
                # Rate limiting: check for recent failures
                if not hasattr(state, 'stt_failures'):
                    state.stt_failures = 0
                if not hasattr(state, 'last_stt_failure'):
                    state.last_stt_failure = None
                
                # Reset if it's been more than 30 seconds since last failure
                if state.last_stt_failure and (datetime.utcnow() - state.last_stt_failure).total_seconds() > 30:
                    state.stt_failures = 0
                    state.last_stt_failure = None
                
                # Skip STT if too many recent failures
                if state.stt_failures >= 5 and state.last_stt_failure and (datetime.utcnow() - state.last_stt_failure).total_seconds() < 15:
                    print("Skipping STT due to rate limiting")
                    continue
                
                try:
                    transcription = await openai_service.speech_to_text(
                        audio_file=audio_bytes,
                        language=whisper_language,
                        file_extension=audio_extension,
                    )
                    # Reset failure count on success
                    state.stt_failures = 0
                    state.last_stt_failure = None
                except Exception as exc:
                    # Increment failure count
                    state.stt_failures += 1
                    state.last_stt_failure = datetime.utcnow()
                    
                    error_msg = str(exc)
                    if "quota exceeded" in error_msg.lower():
                        await safe_websocket_send(websocket, {
                            "type": "error", 
                            "message": "Voice service temporarily unavailable due to quota limits. Please try again later."
                        })
                        return  # Don't continue processing
                    elif "invalid audio format" in error_msg.lower():
                        await safe_websocket_send(websocket, {
                            "type": "warning", 
                            "message": "Audio format not supported. Please check your microphone settings."
                        })
                    else:
                        await safe_websocket_send(websocket, {"type": "warning", "message": f"Did not catch that ({exc})"})
                    # Proactively ask user to repeat instead of stalling the turn
                    assistant_text = "I didn't catch that. Could you please repeat?"
                    assistant_message_id = uuid4().hex
                    state.append_history("assistant", assistant_text, message_id=assistant_message_id)
                    call_log.transcript = state.history
                    session.add(call_log)
                    session.commit()
                    await websocket.send_json({
                        "type": "transcript",
                        "role": "assistant",
                        "text": assistant_text,
                        "message_id": assistant_message_id,
                    })
                    await send_call_update(call_log.id, {"type": "transcript", "role": "assistant", "text": assistant_text})
                    try:
                        audio_bytes = await openai_service.text_to_speech(
                            text=assistant_text,
                            voice=state.voice,
                            model="tts-1",
                        )
                        await websocket.send_json({
                            "type": "audio_chunk",
                            "role": "assistant",
                            "data": base64.b64encode(audio_bytes).decode("utf-8"),
                            "message_id": assistant_message_id,
                        })
                    except Exception:
                        pass
                    continue

                user_text = (transcription.get("text") or "").strip()
                if not user_text:
                    await safe_websocket_send(websocket, {"type": "warning", "message": "Silence detected"})
                    continue

                user_message_id = uuid4().hex
                await websocket.send_json({
                    "type": "transcript",
                    "role": "user",
                    "text": user_text,
                    "message_id": user_message_id,
                })
                await _handle_agent_turn(
                    websocket=websocket,
                    user_text=user_text,
                    user_message_id=user_message_id,
                    call_log=call_log,
                    state=state,
                    session=session,
                )
                continue

            if event_type == "hangup":
                await websocket.send_json({"type": "ended"})
                break

    except WebSocketDisconnect:
        pass
    finally:
        call_log.status = "completed"
        call_log.ended_at = datetime.utcnow()
        call_log.duration_seconds = int((call_log.ended_at - call_log.started_at).total_seconds())
        call_log.transcript = state.history
        session.add(call_log)
        session.commit()
        call_session_manager.remove_session(session_id)
        await send_call_update(call_log.id, {"type": "call_completed", "call_id": call_log.id})


@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    workspace_id: int = Query(...),
    token: str = Query(...),
    session: Session = Depends(get_session),
):
    """WebSocket for real-time notifications."""
    # TODO: Validate token and user access to workspace
    
    connection_id = f"workspace_{workspace_id}"
    await notification_manager.connect(websocket, connection_id)
    
    try:
        await websocket.send_json({
            "type": "connected",
            "workspace_id": workspace_id,
            "message": "Connected to notifications",
        })
        
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket, connection_id)
        print(f"Client disconnected from workspace {workspace_id} notifications")


@router.websocket("/agent/{agent_id}")
async def websocket_agent_status(
    websocket: WebSocket,
    agent_id: int,
    token: str = Query(...),
    session: Session = Depends(get_session),
):
    """WebSocket for real-time agent status updates."""
    # TODO: Validate token and user access to agent
    
    connection_id = f"agent_{agent_id}"
    await agent_manager.connect(websocket, connection_id)
    
    try:
        await websocket.send_json({
            "type": "connected",
            "agent_id": agent_id,
            "message": "Connected to agent status updates",
        })
        
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
            # Broadcast agent status updates
            await agent_manager.broadcast({
                "type": "agent_status",
                "agent_id": agent_id,
                "data": data,
            }, connection_id)
    
    except WebSocketDisconnect:
        agent_manager.disconnect(websocket, connection_id)
        print(f"Client disconnected from agent {agent_id}")



async def _generate_initial_greeting(
    *,
    websocket: WebSocket,
    call_log: CallLog,
    state: CallSessionState,
    session: Session,
):
    """Generate and stream the initial greeting from the agent."""
    try:
        # Construct a prompt specifically for the greeting
        messages = [
            {"role": "system", "content": "You are a helpful AI assistant. Respond with EXACTLY 5-6 words only. Be brief and welcoming."},
            {
                "role": "user",
                "content": "Say a very short greeting to start the call. Maximum 6 words.",
            },
        ]

        response = await openai_service.chat_completion(
            messages=messages,
            model=state.model,
            temperature=0.55,
            max_tokens=15,  # Reduced to enforce brevity
        )
        greeting_text = (response.get("content") or "").strip()
    except Exception as exc:
        error_msg = str(exc)
        print(f"Error generating greeting: {exc}")
        if "quota exceeded" in error_msg.lower():
            greeting_text = "Hello! Service unavailable."
        else:
            greeting_text = "Hi! How can I help?"

    if not greeting_text:
        greeting_text = "Hello!"

    assistant_message_id = uuid4().hex
    state.append_history("assistant", greeting_text, message_id=assistant_message_id)
    call_log.transcript = state.history
    session.add(call_log)
    session.commit()

    await websocket.send_json({
        "type": "transcript",
        "role": "assistant",
        "text": greeting_text,
        "message_id": assistant_message_id,
    })
    await send_call_update(call_log.id, {"type": "transcript", "role": "assistant", "text": greeting_text})

    try:
        audio_bytes = await openai_service.text_to_speech(
            text=greeting_text,
            voice=state.voice,
            model="tts-1",
        )
        await websocket.send_json({
            "type": "audio_chunk",
            "role": "assistant",
            "data": base64.b64encode(audio_bytes).decode("utf-8"),
            "message_id": assistant_message_id,
        })
    except Exception as exc:
        error_msg = str(exc)
        if "quota exceeded" in error_msg.lower():
            await safe_websocket_send(websocket, {
                "type": "error", 
                "message": "Voice service temporarily unavailable. Please try again later."
            })
        else:
            await safe_websocket_send(websocket, {"type": "error", "message": f"TTS error: {exc}"})


async def _handle_agent_turn(
    *,
    websocket: WebSocket,
    user_text: str,
    user_message_id: str,
    call_log: CallLog,
    state: CallSessionState,
    session: Session,
):
    """Transcribe, generate reply, and stream assistant audio."""
    try:
        state.append_history("user", user_text, message_id=user_message_id)
        trimmed_history = state.history[-12:]  # cap context to reduce latency
        messages = [{"role": "system", "content": state.system_prompt}]
        for item in trimmed_history:
            messages.append({"role": item["role"], "content": item["content"]})

        response = await openai_service.chat_completion(
            messages=messages,
            model=state.model,
            temperature=0.45,
            max_tokens=160,
        )
        assistant_text = (response.get("content") or "").strip()
    except Exception as exc:
        error_msg = str(exc)
        if "quota exceeded" in error_msg.lower():
            await safe_websocket_send(websocket, {
                "type": "error", 
                "message": "AI service temporarily unavailable. Please try again later."
            })
        else:
            await safe_websocket_send(websocket, {"type": "error", "message": f"Assistant error: {exc}"})
        return

    if not assistant_text:
        assistant_text = "..."

    assistant_message_id = uuid4().hex
    state.append_history("assistant", assistant_text, message_id=assistant_message_id)
    call_log.transcript = state.history
    call_log.outcome = assistant_text  # keep latest assistant reply as outcome for quick view
    call_log.duration_seconds = int((datetime.utcnow() - call_log.started_at).total_seconds())
    session.add(call_log)
    session.commit()
    await websocket.send_json({
        "type": "transcript",
        "role": "assistant",
        "text": assistant_text,
        "message_id": assistant_message_id,
    })
    await send_call_update(call_log.id, {"type": "transcript", "role": "assistant", "text": assistant_text})

    try:
        audio_bytes = await openai_service.text_to_speech(
            text=assistant_text,
            voice=state.voice,
            model="tts-1",
        )
        await websocket.send_json({
            "type": "audio_chunk",
            "role": "assistant",
            "data": base64.b64encode(audio_bytes).decode("utf-8"),
            "message_id": assistant_message_id,
        })
    except Exception as exc:
        error_msg = str(exc)
        if "quota exceeded" in error_msg.lower():
            await safe_websocket_send(websocket, {
                "type": "error", 
                "message": "Voice service temporarily unavailable. Please try again later."
            })
        else:
            await safe_websocket_send(websocket, {"type": "error", "message": f"TTS error: {exc}"})


async def _process_audio_buffer(
    *,
    websocket: WebSocket,
    state: CallSessionState,
    call_log: CallLog,
    session: Session,
    audio_extension: str,
):
    """Transcribe buffered audio and trigger an assistant turn."""
    audio_bytes = state.pop_audio()
    if not audio_bytes or len(audio_bytes) < 2048:  # Increased minimum size
        return

    # Rate limiting: track failed attempts
    if not hasattr(state, 'stt_failures'):
        state.stt_failures = 0
    if not hasattr(state, 'last_stt_failure'):
        state.last_stt_failure = None
    
    # If we've had too many failures recently, throttle requests  
    # Reset if it's been more than 30 seconds since last failure
    if state.last_stt_failure and (datetime.utcnow() - state.last_stt_failure).total_seconds() > 30:
        state.stt_failures = 0
        state.last_stt_failure = None
        
    if state.stt_failures >= 5:  # Increased threshold
        if state.last_stt_failure and (datetime.utcnow() - state.last_stt_failure).total_seconds() < 15:  # Reduced timeout
            print(f"Rate limiting STT requests due to {state.stt_failures} recent failures")
            return

    try:
        whisper_language = (state.language or "en").split("-")[0]
        transcript = await openai_service.speech_to_text(
            audio_file=audio_bytes,
            language=whisper_language,
            file_extension=audio_extension,
        )
        user_text = (transcript.get("text") or "").strip()
        
        # Reset failure count on success
        state.stt_failures = 0
        state.last_stt_failure = None
        
    except Exception as exc:
        # Increment failure count
        state.stt_failures += 1
        state.last_stt_failure = datetime.utcnow()
        
        error_msg = str(exc)
        if "quota exceeded" in error_msg.lower():
            await safe_websocket_send(websocket, {
                "type": "error", 
                "message": "Voice service temporarily unavailable. Please try again later."
            })
        elif "invalid audio format" in error_msg.lower() or "corrupted" in error_msg.lower():
            await safe_websocket_send(websocket, {
                "type": "warning", 
                "message": "Audio quality issue detected. Please speak more clearly or check your microphone."
            })
        else:
            await safe_websocket_send(websocket, {"type": "error", "message": f"STT error: {exc}"})
        return

    if not user_text:
        return

    user_message_id = uuid4().hex
    await websocket.send_json({
        "type": "transcript",
        "role": "user",
        "text": user_text,
        "message_id": user_message_id,
    })
    await _handle_agent_turn(
        websocket=websocket,
        user_text=user_text,
        user_message_id=user_message_id,
        call_log=call_log,
        state=state,
        session=session,
    )


# Helper function to send notifications (can be called from other parts of the app)
async def send_notification(workspace_id: int, notification: dict):
    """Send notification to all connected clients in workspace."""
    connection_id = f"workspace_{workspace_id}"
    await notification_manager.broadcast({
        "type": "notification",
        "data": notification,
    }, connection_id)


async def send_call_update(call_id: int, update: dict):
    """Send call update to all connected clients."""
    connection_id = f"call_{call_id}"
    await call_manager.broadcast({
        "type": "call_update",
        "data": update,
    }, connection_id)


async def send_agent_update(agent_id: int, update: dict):
    """Send agent update to all connected clients."""
    connection_id = f"agent_{agent_id}"
    await agent_manager.broadcast({
        "type": "agent_update",
        "data": update,
    }, connection_id)
