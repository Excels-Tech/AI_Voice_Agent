from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select, func

from app.core.deps import get_current_active_user
from app.db import get_session
from app.models.agent import Agent
from app.models.call import CallLog
from app.models.user import User
from app.models.workspace import WorkspaceMembership

router = APIRouter()


class DashboardStats(BaseModel):
    """Summary metrics for the dashboard hero cards."""

    active_agents: int
    total_calls: int
    completed_calls: int
    inbound_calls: int
    outbound_calls: int
    minutes_used: float
    average_call_duration_seconds: int
    average_handle_time_seconds: int


class DashboardCall(BaseModel):
    """Lightweight representation of a recent call."""

    id: int
    caller_name: Optional[str]
    caller_number: Optional[str]
    agent_id: Optional[int]
    agent_name: Optional[str]
    duration_seconds: int
    status: str
    sentiment: str
    started_at: datetime


class DashboardAgent(BaseModel):
    """Agent summary for dashboard cards."""

    id: int
    name: str
    status: str
    language: str
    calls: int
    average_handle_time: Optional[int]
    sentiment_score: Optional[float]


class DashboardOverview(BaseModel):
    """Full dashboard payload for the workspace."""

    workspace_id: int
    period_days: int
    stats: DashboardStats
    recent_calls: List[DashboardCall]
    active_agents: List[DashboardAgent]
    updated_at: datetime


def _require_workspace_membership(
    session: Session, workspace_id: int, user: User
) -> WorkspaceMembership:
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


@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    workspace_id: int = Query(...),
    days: int = Query(30, ge=1, le=365),
    recent_limit: int = Query(5, ge=1, le=25),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Return aggregated stats, recent calls, and active agents for the dashboard."""
    _require_workspace_membership(session, workspace_id, current_user)

    now = datetime.utcnow()
    start_date = now - timedelta(days=days)

    # Aggregate call metrics for the period
    total_calls = session.exec(
        select(func.count())
        .select_from(CallLog)
        .where(
            CallLog.workspace_id == workspace_id,
            CallLog.started_at >= start_date,
            CallLog.started_at <= now,
        )
    ).one()

    total_duration = session.exec(
        select(func.coalesce(func.sum(CallLog.duration_seconds), 0))
        .where(
            CallLog.workspace_id == workspace_id,
            CallLog.started_at >= start_date,
            CallLog.started_at <= now,
        )
    ).one()

    completed_calls = session.exec(
        select(func.count())
        .select_from(CallLog)
        .where(
            CallLog.workspace_id == workspace_id,
            CallLog.status == "completed",
            CallLog.started_at >= start_date,
            CallLog.started_at <= now,
        )
    ).one()

    inbound_calls = session.exec(
        select(func.count())
        .select_from(CallLog)
        .where(
            CallLog.workspace_id == workspace_id,
            CallLog.direction == "inbound",
            CallLog.started_at >= start_date,
            CallLog.started_at <= now,
        )
    ).one()

    outbound_calls = session.exec(
        select(func.count())
        .select_from(CallLog)
        .where(
            CallLog.workspace_id == workspace_id,
            CallLog.direction == "outbound",
            CallLog.started_at >= start_date,
            CallLog.started_at <= now,
        )
    ).one()

    average_call_duration = int(total_duration / total_calls) if total_calls else 0

    # Agents and per-agent call counts
    agents = session.exec(
        select(Agent).where(Agent.workspace_id == workspace_id)
    ).all()
    agent_ids = [a.id for a in agents if a.id is not None]
    call_counts_by_agent: dict[int, int] = {}
    if agent_ids:
        rows = session.exec(
            select(CallLog.agent_id, func.count(CallLog.id))
            .where(
                CallLog.workspace_id == workspace_id,
                CallLog.agent_id.in_(agent_ids),
                CallLog.started_at >= start_date,
                CallLog.started_at <= now,
            )
            .group_by(CallLog.agent_id)
        ).all()
        call_counts_by_agent = {
            agent_id: count for agent_id, count in rows if agent_id is not None
        }

    handle_times = [
        a.average_handle_time for a in agents if a.average_handle_time is not None
    ]
    average_handle_time = (
        int(sum(handle_times) / len(handle_times)) if handle_times else average_call_duration
    )

    active_agents = [
        DashboardAgent(
            id=a.id,
            name=a.name,
            status=a.status,
            language=a.language,
            calls=call_counts_by_agent.get(a.id or 0, 0),
            average_handle_time=a.average_handle_time,
            sentiment_score=a.sentiment_score,
        )
        for a in agents
        if a.status == "active"
    ]
    active_agents.sort(key=lambda agent: agent.calls, reverse=True)

    agent_name_map = {a.id: a.name for a in agents if a.id is not None}
    recent_calls = session.exec(
        select(CallLog)
        .where(CallLog.workspace_id == workspace_id)
        .order_by(CallLog.started_at.desc())
        .limit(recent_limit)
    ).all()
    recent_call_payloads = [
        DashboardCall(
            id=call.id,
            caller_name=call.caller_name,
            caller_number=call.caller_number,
            agent_id=call.agent_id,
            agent_name=agent_name_map.get(call.agent_id),
            duration_seconds=call.duration_seconds,
            status=call.status,
            sentiment=call.sentiment,
            started_at=call.started_at,
        )
        for call in recent_calls
    ]

    stats = DashboardStats(
        active_agents=len(active_agents),
        total_calls=total_calls,
        completed_calls=completed_calls,
        inbound_calls=inbound_calls,
        outbound_calls=outbound_calls,
        minutes_used=round(total_duration / 60, 2),
        average_call_duration_seconds=average_call_duration,
        average_handle_time_seconds=average_handle_time,
    )

    return DashboardOverview(
        workspace_id=workspace_id,
        period_days=days,
        stats=stats,
        recent_calls=recent_call_payloads,
        active_agents=active_agents,
        updated_at=now,
    )
