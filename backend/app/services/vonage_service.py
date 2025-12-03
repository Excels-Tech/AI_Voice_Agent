from __future__ import annotations

import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4

from jose import jwt

from app.core.config import PROJECT_ROOT, settings


class VonageService:
    """Helper for Vonage Voice: JWT minting and webhook helpers."""

    def __init__(self):
        self.api_key = settings.VONAGE_API_KEY
        self.api_secret = settings.VONAGE_API_SECRET
        self.application_id = settings.VONAGE_APPLICATION_ID
        self.private_key_path = settings.VONAGE_PRIVATE_KEY_PATH
        self.private_key_raw = settings.VONAGE_PRIVATE_KEY
        self.voice_webhook_base = settings.VONAGE_VOICE_WEBHOOK_BASE
        self.default_ttl_seconds = 60 * 60
        self._cached_private_key: Optional[str] = None

    @property
    def default_acl(self) -> Dict[str, Any]:
        # Standard Vonage Voice/Conversations ACL (keeps scopes minimal)
        return {
            "paths": {
                "/v1/users/**": {},
                "/v1/conversations/**": {},
                "/v1/sessions/**": {},
                "/v1/knocking/**": {},
            }
        }

    def is_configured(self) -> bool:
        return bool(self.application_id and (self.private_key_raw or self.private_key_path))

    def _load_private_key(self) -> str:
        if self._cached_private_key:
            return self._cached_private_key

        if self.private_key_raw:
            # Handle both literal PEM and \n-delimited env strings
            key = self.private_key_raw.replace("\\n", "\n").strip()
            if "BEGIN PRIVATE KEY" not in key:
                raise RuntimeError("VONAGE_PRIVATE_KEY does not look like a valid PEM")
            self._cached_private_key = key
            return key

        if not self.private_key_path:
            raise RuntimeError("VONAGE_PRIVATE_KEY or VONAGE_PRIVATE_KEY_PATH is required")

        candidate = Path(self.private_key_path).expanduser()
        if not candidate.is_absolute():
            candidate = PROJECT_ROOT / candidate
        if not candidate.exists():
            raise RuntimeError(f"Vonage private key not found at {candidate}")

        self._cached_private_key = candidate.read_text().strip()
        return self._cached_private_key

    def generate_voice_jwt(self, *, ttl_seconds: Optional[int] = None, acl: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.is_configured():
            raise RuntimeError("Vonage is not configured")

        private_key = self._load_private_key()
        now = int(time.time())
        ttl = ttl_seconds or self.default_ttl_seconds
        exp = now + ttl

        payload = {
            "application_id": self.application_id,
            "iat": now,
            "exp": exp,
            "jti": uuid4().hex,
            "acl": acl or self.default_acl,
        }
        token = jwt.encode(payload, private_key, algorithm="RS256")
        return {
            "token": token,
            "expires_at": datetime.utcfromtimestamp(exp),
        }

    def webhook_urls(self) -> Dict[str, Optional[str]]:
        base = (self.voice_webhook_base or "").rstrip("/")
        if not base:
            return {"answer_url": None, "event_url": None}
        return {
            "answer_url": f"{base}/api/vonage/voice/answer",
            "event_url": f"{base}/api/vonage/voice/event",
        }

    def missing_fields(self) -> list[str]:
        missing: list[str] = []
        if not self.application_id:
            missing.append("VONAGE_APPLICATION_ID")
        if not (self.private_key_raw or self.private_key_path):
            missing.append("VONAGE_PRIVATE_KEY or VONAGE_PRIVATE_KEY_PATH")
        return missing


vonage_service = VonageService()
