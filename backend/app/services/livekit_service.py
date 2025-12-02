from __future__ import annotations

import json
import time
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import uuid4

from jose import jwt

from app.core.config import settings


class LiveKitService:
    """Lightweight helper to mint LiveKit access tokens for callers/agents/monitors."""

    def __init__(self):
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self.url = settings.LIVEKIT_URL
        # Default TTL keeps sessions short-lived for safety
        self.default_ttl_seconds = 60 * 60

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_secret and self.url)

    def build_room_name(self, workspace_id: int, call_id: int) -> str:
        return f"ws-{workspace_id}-call-{call_id}"

    def _build_grants(
        self,
        *,
        room: str,
        can_publish: bool = True,
        can_subscribe: bool = True,
        can_publish_data: bool = True,
    ) -> Dict[str, Any]:
        return {
            "roomJoin": True,
            "room": room,
            "canPublish": can_publish,
            "canSubscribe": can_subscribe,
            "canPublishData": can_publish_data,
        }

    def create_token(
        self,
        *,
        room: str,
        identity: str,
        name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        can_publish: bool = True,
        can_subscribe: bool = True,
        ttl_seconds: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Create a signed LiveKit access token without needing the LiveKit SDK."""
        if not self.is_configured():
            raise RuntimeError("LiveKit is not configured")

        issued_at = int(time.time())
        ttl = ttl_seconds or self.default_ttl_seconds
        expires_at = issued_at + ttl

        payload = {
            "iss": self.api_key,
            "sub": identity,
            "name": name or identity,
            "iat": issued_at,
            "exp": expires_at,
            "video": self._build_grants(
                room=room,
                can_publish=can_publish,
                can_subscribe=can_subscribe,
            ),
        }

        if metadata:
            try:
                payload["metadata"] = json.dumps(metadata)
            except Exception:
                # Fallback to a minimal metadata string when json serialization fails
                payload["metadata"] = json.dumps({"note": "metadata_not_serializable"})

        token = jwt.encode(payload, self.api_secret, algorithm="HS256")
        return {
            "token": token,
            "identity": identity,
            "expires_at": datetime.utcfromtimestamp(expires_at),
        }

    def build_call_bundle(
        self,
        *,
        workspace_id: int,
        call_id: int,
        agent_id: Optional[int],
        agent_name: str,
        caller_label: Optional[str] = None,
        room: Optional[str] = None,
        ttl_seconds: Optional[int] = None,
    ) -> Optional[Dict[str, Any]]:
        """Return a LiveKit token bundle so agents and supervisors can join/monitor."""
        if not self.is_configured():
            return None

        room_name = room or self.build_room_name(workspace_id, call_id)
        ttl = ttl_seconds or self.default_ttl_seconds
        metadata = {
            "call_id": call_id,
            "workspace_id": workspace_id,
            "agent_id": agent_id,
            "caller": caller_label,
        }

        agent_identity = f"agent-{agent_id or 'live'}-{call_id}"
        monitor_identity = f"monitor-{uuid4().hex[:12]}"

        agent_token = self.create_token(
            room=room_name,
            identity=agent_identity,
            name=agent_name,
            metadata={**metadata, "role": "agent"},
            ttl_seconds=ttl,
        )
        monitor_token = self.create_token(
            room=room_name,
            identity=monitor_identity,
            name="Supervisor",
            metadata={**metadata, "role": "monitor"},
            can_publish=False,
            can_subscribe=True,
            ttl_seconds=ttl,
        )

        return {
            "url": self.url,
            "room": room_name,
            "agent_identity": agent_identity,
            "agent_token": agent_token["token"],
            "monitor_identity": monitor_identity,
            "monitor_token": monitor_token["token"],
            "expires_at": min(agent_token["expires_at"], monitor_token["expires_at"]),
        }


livekit_service = LiveKitService()
