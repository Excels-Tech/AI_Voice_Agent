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
        allowed = {".flac", ".m4a", ".mp3", ".mp4", ".mpeg", ".mpga", ".oga", ".ogg", ".wav", ".webm"}
        if not ext:
            return default
        ext = ext.strip().lower()
        if not ext:
            return default
        if not ext.startswith("."):
            ext = f".{ext}"
        if ext not in allowed:
            return default
        return ext

    audio_extension = _normalize_extension(state.metadata.get("audio_extension"), ".webm")

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
                    audio_extension = _normalize_extension(payload.get("file_extension"), audio_extension)
                    state.metadata["audio_extension"] = audio_extension
                    state.push_audio(chunk)
                except Exception:
                    await websocket.send_json({"type": "error", "message": "Invalid audio chunk"})
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
                if not audio_bytes or len(audio_bytes) < 400:
                    await websocket.send_json({"type": "warning", "message": "No usable audio to transcribe"})
                    continue

                whisper_language = state.language.split("-")[0]
                try:
                    transcription = await openai_service.speech_to_text(
                        audio_file=audio_bytes,
                        language=whisper_language,
                        file_extension=audio_extension,
                    )
                except Exception as exc:
                    await websocket.send_json({"type": "warning", "message": f"Did not catch that ({exc})"})
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
                    await websocket.send_json({"type": "warning", "message": "Silence detected"})
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
            {"role": "system", "content": state.system_prompt},
            {
                "role": "user",
                "content": "The call has just started. Please introduce yourself and greet the user according to your instructions. Keep it brief and welcoming.",
            },
        ]

        response = await openai_service.chat_completion(
            messages=messages,
            model=state.model,
            temperature=0.55,
            max_tokens=80,
        )
        greeting_text = (response.get("content") or "").strip()
    except Exception as exc:
        print(f"Error generating greeting: {exc}")
        greeting_text = "Hello! I am ready to help you."

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
        await websocket.send_json({"type": "error", "message": f"TTS error: {exc}"})


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
        await websocket.send_json({"type": "error", "message": f"LLM error: {exc}"})
        return

    if not assistant_text:
        assistant_text = "..."

    assistant_message_id = uuid4().hex
    state.append_history("assistant", assistant_text, message_id=assistant_message_id)
    call_log.transcript = state.history
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
        await websocket.send_json({"type": "error", "message": f"TTS error: {exc}"})


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
