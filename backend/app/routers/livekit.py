from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, SQLModel, select

from app.core.deps import get_current_active_user
from app.db import get_session
from app.models.agent import Agent
from app.models.call import CallLog, CallLogRead, LiveKitDetails
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.services.livekit_service import livekit_service

router = APIRouter()


class LiveKitTokenRequest(SQLModel):
    room: str
    identity: Optional[str] = None
    name: Optional[str] = None
    workspace_id: Optional[int] = None
    agent_id: Optional[int] = None
    ttl_seconds: int = 3600
    can_publish: bool = False
    can_subscribe: bool = True
    metadata: Optional[Dict[str, Any]] = None


class LiveKitTokenResponse(SQLModel):
    url: str
    room: str
    identity: str
    token: str
    expires_at: datetime


class LiveKitCallPreviewRequest(SQLModel):
    agent_id: int
    direction: str = "outbound"
    to_number: Optional[str] = None
    from_number: Optional[str] = None
    caller_name: Optional[str] = None
    ttl_seconds: int = 3600


class LiveKitCallPreviewResponse(SQLModel):
    call: CallLogRead
    livekit: Optional[LiveKitDetails] = None
    batch_id: Optional[str] = None


class AutoDialLead(SQLModel):
    phone_number: str
    caller_name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AutoDialRequest(SQLModel):
    agent_id: int
    leads: List[AutoDialLead]
    direction: str = "outbound"
    ttl_seconds: int = 3600


class AutoDialResponse(SQLModel):
    batch_id: str
    workspace_id: int
    agent_id: int
    calls: List[LiveKitCallPreviewResponse]


def _assert_workspace_access(session: Session, workspace_id: int, user: User):
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to workspace",
        )
    return membership


@router.post("/token", response_model=LiveKitTokenResponse)
async def mint_livekit_token(
    payload: LiveKitTokenRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Return a LiveKit access token for the requested room."""
    if not livekit_service.is_configured():
        raise HTTPException(status_code=400, detail="LiveKit is not configured on the server.")

    # Optional workspace validation
    if payload.workspace_id:
        _assert_workspace_access(session, payload.workspace_id, current_user)

    identity = payload.identity or f"user-{current_user.id}"
    try:
        token_data = livekit_service.create_token(
            room=payload.room,
            identity=identity,
            name=payload.name or current_user.name or identity,
            metadata=payload.metadata,
            can_publish=payload.can_publish,
            can_subscribe=payload.can_subscribe,
            ttl_seconds=payload.ttl_seconds,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to mint LiveKit token: {exc}") from exc

    return LiveKitTokenResponse(
        url=livekit_service.url,
        room=payload.room,
        identity=token_data["identity"],
        token=token_data["token"],
        expires_at=token_data["expires_at"],
    )


@router.post("/calls/preview", response_model=LiveKitCallPreviewResponse)
async def create_livekit_call_preview(
    payload: LiveKitCallPreviewRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create a call log entry and return LiveKit credentials for monitoring/testing."""
    if not livekit_service.is_configured():
        raise HTTPException(status_code=400, detail="LiveKit is not configured on the server.")

    agent = session.get(Agent, payload.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    _assert_workspace_access(session, agent.workspace_id, current_user)

    call_log = CallLog(
        workspace_id=agent.workspace_id,
        agent_id=agent.id,
        caller_name=payload.caller_name or current_user.name,
        caller_number=payload.to_number or payload.from_number,
        direction=payload.direction,
        status="in-progress",
        started_at=datetime.utcnow(),
    )
    session.add(call_log)
    agent.total_calls = (agent.total_calls or 0) + 1
    session.add(agent)
    session.commit()
    session.refresh(call_log)

    livekit_bundle = livekit_service.build_call_bundle(
        workspace_id=agent.workspace_id,
        call_id=call_log.id,
        agent_id=agent.id,
        agent_name=agent.name,
        caller_label=payload.caller_name or payload.to_number or "preview",
        ttl_seconds=payload.ttl_seconds,
    )

    return LiveKitCallPreviewResponse(
        call=CallLogRead.model_validate(call_log, from_attributes=True),
        livekit=livekit_bundle,
    )


@router.post("/calls/auto-dialer", response_model=AutoDialResponse)
async def create_auto_dialer_batch(
    payload: AutoDialRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Queue multiple outbound calls and return LiveKit credentials for each one."""
    if not livekit_service.is_configured():
        raise HTTPException(status_code=400, detail="LiveKit is not configured on the server.")
    if not payload.leads:
        raise HTTPException(status_code=400, detail="No leads provided.")

    agent = session.get(Agent, payload.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    _assert_workspace_access(session, agent.workspace_id, current_user)
    batch_id = uuid4().hex
    responses: List[LiveKitCallPreviewResponse] = []

    for lead in payload.leads:
        call_log = CallLog(
            workspace_id=agent.workspace_id,
            agent_id=agent.id,
            caller_name=lead.caller_name or "Auto-dial lead",
            caller_number=lead.phone_number,
            direction=payload.direction,
            status="queued",
            started_at=datetime.utcnow(),
        )
        session.add(call_log)
        session.commit()
        session.refresh(call_log)

        livekit_bundle = livekit_service.build_call_bundle(
            workspace_id=agent.workspace_id,
            call_id=call_log.id,
            agent_id=agent.id,
            agent_name=agent.name,
            caller_label=lead.caller_name or lead.phone_number,
            ttl_seconds=payload.ttl_seconds,
        )

        responses.append(
            LiveKitCallPreviewResponse(
                call=CallLogRead.model_validate(call_log, from_attributes=True),
                livekit=livekit_bundle,
                batch_id=batch_id,
            )
        )

    # Keep agent counter in sync
    agent.total_calls = (agent.total_calls or 0) + len(payload.leads)
    session.add(agent)
    session.commit()

    return AutoDialResponse(
        batch_id=batch_id,
        workspace_id=agent.workspace_id,
        agent_id=agent.id,
        calls=responses,
    )
