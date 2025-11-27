from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.call import (
    CallLog,
    CallLogCreate,
    CallLogUpdate,
    CallLogRead,
    CallInitiate,
    CallSessionCreate,
    CallSessionResponse,
)
from app.models.agent import Agent
from app.services.call_sessions import call_session_manager
from app.services.language import resolve_language_code

router = APIRouter()


@router.get("", response_model=List[CallLogRead])
async def list_calls(
    workspace_id: int = Query(...),
    agent_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    direction: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List call logs with filters and pagination."""
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to workspace",
        )
    
    # Build query
    query = select(CallLog).where(CallLog.workspace_id == workspace_id)
    
    if agent_id:
        query = query.where(CallLog.agent_id == agent_id)
    if status:
        query = query.where(CallLog.status == status)
    if direction:
        query = query.where(CallLog.direction == direction)
    
    # Order by most recent first
    query = query.order_by(CallLog.started_at.desc())
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    calls = session.exec(query).all()
    return calls


@router.post("", response_model=CallLogRead, status_code=status.HTTP_201_CREATED)
async def initiate_call(
    call_data: CallInitiate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Initiate an outbound call."""
    # Get agent and verify workspace access
    agent = session.get(Agent, call_data.agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Create call log
    call_log = CallLog(
        workspace_id=agent.workspace_id,
        agent_id=agent.id,
        caller_number=call_data.phone_number,
        direction="outbound",
        status="queued",
        started_at=datetime.utcnow(),
    )
    
    session.add(call_log)
    agent.total_calls = (agent.total_calls or 0) + 1
    session.add(agent)
    session.commit()
    session.refresh(call_log)
    
    # TODO: Integrate with Twilio to initiate actual call
    # from app.services.twilio_service import initiate_call
    # twilio_sid = initiate_call(call_data.phone_number, agent.phone_number)
    # call_log.twilio_call_sid = twilio_sid
    # session.add(call_log)
    # session.commit()

    return call_log


@router.post("/sessions/live", response_model=CallSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_live_call_session(
    call_data: CallSessionCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create a live voice session that streams audio over WebSocket."""
    agent = session.get(Agent, call_data.agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    call_log = CallLog(
        workspace_id=agent.workspace_id,
        agent_id=agent.id,
        caller_name=call_data.caller_name or current_user.name,
        caller_number=call_data.caller_number,
        direction="inbound",
        status="in-progress",
        started_at=datetime.utcnow(),
    )
    session.add(call_log)
    # Keep a lightweight counter so UI cards can reflect activity immediately
    agent.total_calls = (agent.total_calls or 0) + 1
    session.add(agent)
    session.commit()
    session.refresh(call_log)

    system_prompts = [f"You are {agent.name}, a {agent.agent_type} AI voice agent."]
    if agent.goal:
        system_prompts.append(f"Primary Goal: {agent.goal}")
    if agent.script_summary:
        system_prompts.append(f"Script Summary: {agent.script_summary}")
    if agent.capabilities:
        system_prompts.append(f"Capabilities: {agent.capabilities}")
    if agent.personality:
        system_prompts.append(f"Personality: {agent.personality}")
    system_prompts.append(
        "First-turn rule: on the very first response, greet the caller, introduce yourself by name and role, "
        "explain how you can help, and ask a brief opening question appropriate for a live call. "
        "After that, avoid repeating the introduction unless asked."
    )

    resolved_language = resolve_language_code(call_data.language or agent.language)
    session_state = call_session_manager.create_session(
        call_id=call_log.id,
        agent_id=agent.id,
        workspace_id=agent.workspace_id,
        language=resolved_language,
        voice=agent.voice or "nova",
        model=agent.model or "gpt-4o-mini",
        system_prompt="\n".join(system_prompts),
        metadata={
            "agent_name": agent.name,
            "agent_type": agent.agent_type,
            "workspace_id": agent.workspace_id,
            "call_id": call_log.id,
        },
    )

    expires_at = session_state.created_at + call_session_manager.default_ttl
    return CallSessionResponse(
        session_id=session_state.id,
        session_token=session_state.token,
        call_id=call_log.id,
        agent_id=agent.id,
        workspace_id=agent.workspace_id,
        websocket_path=f"/ws/calls/live/{session_state.id}",
        expires_at=expires_at,
    )


@router.get("/{call_id}", response_model=CallLogRead)
async def get_call(
    call_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get call details."""
    call = session.get(CallLog, call_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == call.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return call


@router.put("/{call_id}", response_model=CallLogRead)
async def update_call(
    call_id: int,
    call_update: CallLogUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Update call log."""
    call = session.get(CallLog, call_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == call.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Update fields
    update_data = call_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(call, field, value)
    
    session.add(call)
    session.commit()
    session.refresh(call)
    
    return call


@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_call(
    call_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Delete call log."""
    call = session.get(CallLog, call_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found",
        )
    
    # Verify workspace access (admin or owner)
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == call.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership or membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires admin access",
        )
    
    session.delete(call)
    session.commit()
    
    return None


@router.get("/{call_id}/transcript")
async def get_call_transcript(
    call_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get call transcript."""
    call = session.get(CallLog, call_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == call.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return {
        "call_id": call.id,
        "transcript": call.transcript,
        "summary": call.summary,
        "duration_seconds": call.duration_seconds,
    }


@router.get("/{call_id}/recording")
async def get_call_recording(
    call_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get call recording URL."""
    call = session.get(CallLog, call_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == call.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if not call.recording_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not available",
        )
    
    return {
        "call_id": call.id,
        "recording_url": call.recording_url,
        "duration_seconds": call.duration_seconds,
    }


@router.get("/stats/overview")
async def get_call_stats(
    workspace_id: int = Query(...),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get call statistics overview."""
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get calls in date range
    calls = session.exec(
        select(CallLog).where(
            CallLog.workspace_id == workspace_id,
            CallLog.started_at >= start_date,
            CallLog.started_at <= end_date,
        )
    ).all()
    
    total_calls = len(calls)
    completed_calls = len([c for c in calls if c.status == "completed"])
    total_duration = sum([c.duration_seconds for c in calls])
    avg_duration = total_duration / total_calls if total_calls > 0 else 0
    
    # Calculate sentiment distribution
    sentiment_counts = {
        "positive": len([c for c in calls if c.sentiment == "positive"]),
        "neutral": len([c for c in calls if c.sentiment == "neutral"]),
        "negative": len([c for c in calls if c.sentiment == "negative"]),
    }
    
    # Direction breakdown
    inbound_calls = len([c for c in calls if c.direction == "inbound"])
    outbound_calls = len([c for c in calls if c.direction == "outbound"])
    
    return {
        "period_days": days,
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "inbound_calls": inbound_calls,
        "outbound_calls": outbound_calls,
        "total_duration_seconds": total_duration,
        "average_duration_seconds": int(avg_duration),
        "sentiment_distribution": sentiment_counts,
    }


@router.post("/webhook/twilio")
async def twilio_webhook(
    # Twilio sends form data
    session: Session = Depends(get_session),
):
    """Handle Twilio webhook for call events."""
    # TODO: Implement Twilio webhook handling
    # Parse Twilio request, validate signature
    # Update call status, recording URL, etc.
    
    return {"status": "received"}
