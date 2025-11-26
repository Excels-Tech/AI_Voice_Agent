from __future__ import annotations

import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import uuid4


@dataclass
class CallSessionState:
    """Lightweight runtime state for an active voice call."""

    id: str
    token: str
    call_id: int
    agent_id: int
    workspace_id: int
    language: str
    voice: str
    model: str
    system_prompt: str
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_active: datetime = field(default_factory=datetime.utcnow)
    history: List[Dict[str, str]] = field(default_factory=list)
    audio_buffer: bytearray = field(default_factory=bytearray)
    metadata: Dict[str, Optional[str]] = field(default_factory=dict)

    def touch(self):
        self.last_active = datetime.utcnow()

    def append_history(self, role: str, content: str, message_id: Optional[str] = None):
        self.history.append(
            {
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
                "id": message_id,
            }
        )
        self.touch()

    def push_audio(self, chunk: bytes):
        self.audio_buffer.extend(chunk)
        self.touch()

    def pop_audio(self) -> bytes:
        payload = bytes(self.audio_buffer)
        self.audio_buffer.clear()
        self.touch()
        return payload


class CallSessionManager:
    """In-memory tracker for live call sessions."""

    def __init__(self):
        self.sessions: Dict[str, CallSessionState] = {}
        self.default_ttl = timedelta(hours=1)

    def create_session(
        self,
        *,
        call_id: int,
        agent_id: int,
        workspace_id: int,
        language: str,
        voice: str,
        model: str,
        system_prompt: str,
        metadata: Optional[Dict[str, Optional[str]]] = None,
    ) -> CallSessionState:
        session_id = uuid4().hex
        token = secrets.token_urlsafe(24)
        state = CallSessionState(
            id=session_id,
            token=token,
            call_id=call_id,
            agent_id=agent_id,
            workspace_id=workspace_id,
            language=language,
            voice=voice,
            model=model,
            system_prompt=system_prompt,
            metadata=metadata or {},
        )
        self.sessions[session_id] = state
        return state

    def get_session(self, session_id: str) -> Optional[CallSessionState]:
        state = self.sessions.get(session_id)
        if not state:
            return None
        # Drop expired sessions
        if datetime.utcnow() - state.last_active > self.default_ttl:
            self.sessions.pop(session_id, None)
            return None
        return state

    def remove_session(self, session_id: str):
        self.sessions.pop(session_id, None)


call_session_manager = CallSessionManager()
