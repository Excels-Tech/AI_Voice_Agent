from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.call import CallLog
from app.models.agent import Agent

router = APIRouter()


@router.get("/overview")
async def get_analytics_overview(
    workspace_id: int = Query(...),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get analytics dashboard overview."""
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
    
    # Calculate metrics
    total_calls = len(calls)
    completed_calls = len([c for c in calls if c.status == "completed"])
    total_duration = sum([c.duration_seconds for c in calls])
    avg_duration = total_duration / total_calls if total_calls > 0 else 0
    total_cost = sum([c.cost_cents for c in calls]) / 100  # Convert to dollars
    
    # Get active agents count
    active_agents = session.exec(
        select(Agent).where(
            Agent.workspace_id == workspace_id,
            Agent.status == "active",
        )
    ).all()
    
    return {
        "period_days": days,
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "total_duration_seconds": total_duration,
        "average_duration_seconds": int(avg_duration),
        "total_cost_usd": round(total_cost, 2),
        "active_agents_count": len(active_agents),
        "completion_rate": round((completed_calls / total_calls * 100) if total_calls > 0 else 0, 2),
    }


@router.get("/calls/trends")
async def get_call_trends(
    workspace_id: int = Query(...),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get call trends over time."""
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
    
    # Get calls
    calls = session.exec(
        select(CallLog).where(
            CallLog.workspace_id == workspace_id,
            CallLog.started_at >= start_date,
            CallLog.started_at <= end_date,
        )
    ).all()
    
    # Group by date
    daily_data = {}
    for call in calls:
        date_key = call.started_at.date().isoformat()
        if date_key not in daily_data:
            daily_data[date_key] = {
                "date": date_key,
                "total_calls": 0,
                "completed_calls": 0,
                "total_duration": 0,
                "inbound": 0,
                "outbound": 0,
            }
        
        daily_data[date_key]["total_calls"] += 1
        if call.status == "completed":
            daily_data[date_key]["completed_calls"] += 1
        daily_data[date_key]["total_duration"] += call.duration_seconds
        if call.direction == "inbound":
            daily_data[date_key]["inbound"] += 1
        else:
            daily_data[date_key]["outbound"] += 1
    
    # Convert to list and sort by date
    trends = sorted(daily_data.values(), key=lambda x: x["date"])
    
    return {
        "period_days": days,
        "trends": trends,
    }


@router.get("/agents/performance")
async def get_agent_performance(
    workspace_id: int = Query(...),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get agent performance metrics."""
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
    
    # Get agents
    agents = session.exec(
        select(Agent).where(Agent.workspace_id == workspace_id)
    ).all()
    
    agent_metrics = []
    for agent in agents:
        # Get calls for this agent
        calls = session.exec(
            select(CallLog).where(
                CallLog.agent_id == agent.id,
                CallLog.started_at >= start_date,
                CallLog.started_at <= end_date,
            )
        ).all()
        
        total_calls = len(calls)
        completed_calls = len([c for c in calls if c.status == "completed"])
        total_duration = sum([c.duration_seconds for c in calls])
        avg_duration = total_duration / total_calls if total_calls > 0 else 0
        
        # Calculate sentiment scores
        sentiment_scores = [c.sentiment_score for c in calls if c.sentiment_score is not None]
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        
        agent_metrics.append({
            "agent_id": agent.id,
            "agent_name": agent.name,
            "agent_type": agent.agent_type,
            "status": agent.status,
            "total_calls": total_calls,
            "completed_calls": completed_calls,
            "completion_rate": round((completed_calls / total_calls * 100) if total_calls > 0 else 0, 2),
            "average_duration_seconds": int(avg_duration),
            "average_sentiment_score": round(avg_sentiment, 2),
        })
    
    # Sort by total calls descending
    agent_metrics.sort(key=lambda x: x["total_calls"], reverse=True)
    
    return {
        "period_days": days,
        "agents": agent_metrics,
    }


@router.get("/sentiment/distribution")
async def get_sentiment_distribution(
    workspace_id: int = Query(...),
    days: int = Query(30, ge=1, le=365),
    agent_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get sentiment analysis distribution."""
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
    
    # Build query
    query = select(CallLog).where(
        CallLog.workspace_id == workspace_id,
        CallLog.started_at >= start_date,
        CallLog.started_at <= end_date,
    )
    
    if agent_id:
        query = query.where(CallLog.agent_id == agent_id)
    
    calls = session.exec(query).all()
    
    # Calculate distribution
    sentiment_counts = {
        "positive": len([c for c in calls if c.sentiment == "positive"]),
        "neutral": len([c for c in calls if c.sentiment == "neutral"]),
        "negative": len([c for c in calls if c.sentiment == "negative"]),
    }
    
    total_calls = len(calls)
    sentiment_percentages = {
        "positive": round((sentiment_counts["positive"] / total_calls * 100) if total_calls > 0 else 0, 2),
        "neutral": round((sentiment_counts["neutral"] / total_calls * 100) if total_calls > 0 else 0, 2),
        "negative": round((sentiment_counts["negative"] / total_calls * 100) if total_calls > 0 else 0, 2),
    }
    
    # Calculate average sentiment score
    sentiment_scores = [c.sentiment_score for c in calls if c.sentiment_score is not None]
    avg_sentiment_score = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
    
    return {
        "period_days": days,
        "total_calls": total_calls,
        "sentiment_counts": sentiment_counts,
        "sentiment_percentages": sentiment_percentages,
        "average_sentiment_score": round(avg_sentiment_score, 2),
    }


@router.get("/usage")
async def get_usage_stats(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get current usage statistics."""
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
    
    # Get current month calls
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    calls = session.exec(
        select(CallLog).where(
            CallLog.workspace_id == workspace_id,
            CallLog.started_at >= month_start,
        )
    ).all()
    
    total_minutes = sum([c.duration_seconds for c in calls]) / 60
    total_calls_count = len(calls)
    
    # Get active agents
    active_agents = session.exec(
        select(Agent).where(
            Agent.workspace_id == workspace_id,
            Agent.status == "active",
        )
    ).all()
    
    # Plan limits (hardcoded for now, should come from subscription)
    plan_limits = {
        "minutes": 5000,
        "agents": 10,
        "calls": 10000,
    }
    
    return {
        "current_period": {
            "start": month_start.isoformat(),
            "end": now.isoformat(),
        },
        "usage": {
            "minutes_used": round(total_minutes, 2),
            "minutes_limit": plan_limits["minutes"],
            "minutes_percentage": round((total_minutes / plan_limits["minutes"] * 100), 2),
            "calls_count": total_calls_count,
            "calls_limit": plan_limits["calls"],
            "active_agents": len(active_agents),
            "agents_limit": plan_limits["agents"],
        },
    }


@router.post("/export")
async def export_analytics(
    workspace_id: int = Query(...),
    format: str = Query("csv", regex="^(csv|json)$"),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Export analytics data."""
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
    
    # TODO: Generate export file
    # For now, return a placeholder
    
    return {
        "message": "Export will be generated and sent to your email",
        "format": format,
        "days": days,
    }