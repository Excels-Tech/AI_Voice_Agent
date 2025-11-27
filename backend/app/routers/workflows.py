from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.workflow import Workflow, WorkflowCreate, WorkflowRead

router = APIRouter()


@router.get("", response_model=List[WorkflowRead])
async def list_workflows(
    workspace_id: int = Query(...),
    status: str = Query(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List workflows."""
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
    
    query = select(Workflow).where(Workflow.workspace_id == workspace_id)
    
    if status:
        query = query.where(Workflow.status == status)
    
    workflows = session.exec(query).all()
    return workflows


@router.post("", response_model=WorkflowRead, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: WorkflowCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create a new workflow."""
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workflow_data.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    workflow = Workflow(**workflow_data.dict())
    session.add(workflow)
    session.commit()
    session.refresh(workflow)
    
    return workflow


@router.get("/{workflow_id}", response_model=WorkflowRead)
async def get_workflow(
    workflow_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get workflow details."""
    workflow = session.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workflow.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Delete workflow."""
    workflow = session.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workflow.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    session.delete(workflow)
    session.commit()
    
    return None


@router.get("/templates/list")
async def list_workflow_templates():
    """List workflow templates."""
    templates = [
        {
            "id": "demo-scheduling",
            "name": "Demo Scheduling Automation",
            "description": "Automatically schedule demos after positive sales calls",
            "trigger": {"type": "call.completed", "conditions": {"sentiment": "positive"}},
            "steps": [
                {"type": "check_sentiment", "threshold": "positive"},
                {"type": "create_calendar_event", "integration": "google-calendar"},
                {"type": "send_email", "template": "demo-confirmation"},
                {"type": "notify_slack", "channel": "#sales"},
            ],
        },
        {
            "id": "support-escalation",
            "name": "Support Ticket Escalation",
            "description": "Escalate negative support calls to team leads",
            "trigger": {"type": "call.completed", "conditions": {"sentiment": "negative", "agent_type": "support"}},
            "steps": [
                {"type": "create_ticket", "integration": "zendesk", "priority": "high"},
                {"type": "notify_team", "channel": "#support-escalations"},
                {"type": "send_email", "to": "support-lead@company.com"},
            ],
        },
        {
            "id": "crm-sync",
            "name": "CRM Contact Sync",
            "description": "Update CRM with call details and outcomes",
            "trigger": {"type": "call.ended"},
            "steps": [
                {"type": "update_crm_contact", "integration": "hubspot"},
                {"type": "log_call_activity", "integration": "hubspot"},
                {"type": "update_deal_stage", "conditions": {"outcome": "demo_scheduled"}},
            ],
        },
    ]
    
    return {"templates": templates}