from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, SQLModel

from app.core.deps import get_current_active_user
from app.db import get_session
from app.models.user import User
from app.services.vonage_service import vonage_service

router = APIRouter()


class VonageTokenRequest(SQLModel):
    ttl_seconds: int = 3600
    acl: Optional[Dict[str, Any]] = None


class VonageTokenResponse(SQLModel):
    token: str
    expires_at: datetime
    application_id: str


class VonageStatusResponse(SQLModel):
    configured: bool
    application_id: Optional[str] = None
    voice_webhook_base: Optional[str] = None
    answer_url: Optional[str] = None
    event_url: Optional[str] = None
    missing: list[str] = []


@router.get("/status", response_model=VonageStatusResponse)
async def get_vonage_status(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Return Vonage Voice configuration status for the current workspace."""
    session  # unused for now, kept for parity with other integration endpoints
    webhooks = vonage_service.webhook_urls()
    return VonageStatusResponse(
        configured=vonage_service.is_configured(),
        application_id=vonage_service.application_id or None,
        voice_webhook_base=vonage_service.voice_webhook_base or None,
        answer_url=webhooks.get("answer_url"),
        event_url=webhooks.get("event_url"),
        missing=vonage_service.missing_fields(),
    )


@router.post("/token", response_model=VonageTokenResponse)
async def mint_vonage_token(
    payload: VonageTokenRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Mint a short-lived Vonage Voice JWT for server-to-server or client usage."""
    session  # unused placeholder
    if not vonage_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vonage is not configured on the server.",
        )

    try:
        token_data = vonage_service.generate_voice_jwt(
            ttl_seconds=payload.ttl_seconds,
            acl=payload.acl,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to mint Vonage token: {exc}",
        ) from exc

    return VonageTokenResponse(
        token=token_data["token"],
        expires_at=token_data["expires_at"],
        application_id=vonage_service.application_id,
    )


@router.post("/voice/answer")
async def vonage_voice_answer(request: Request):
    """
    Basic answer webhook for Vonage inbound calls.
    Replace with custom NCCO actions when connecting to the voice agent pipeline.
    """
    # Optionally inspect request for debugging
    _ = await request.json() if request.headers.get("content-type") == "application/json" else None
    return {
        "actions": [
            {
                "action": "talk",
                "text": "Your VoiceAI agent is initializing. This is a placeholder Vonage NCCO response.",
            }
        ]
    }


@router.post("/voice/event")
async def vonage_voice_event(payload: Dict[str, Any]):
    """Ack Vonage event webhooks."""
    return {"status": "ok", "received": payload.get("status") or payload.get("uuid") or "event"}
