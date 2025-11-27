from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.integration import Integration, IntegrationCreate, IntegrationRead

router = APIRouter()


@router.get("", response_model=List[dict])
async def list_available_integrations():
    """List all available integrations catalog."""
    integrations_catalog = [
        {
            "provider": "zoom",
            "name": "Zoom",
            "category": "meeting",
            "description": "Join and record Zoom meetings with AI agents",
            "icon": "https://cdn.voiceai.app/icons/zoom.png",
            "features": ["Meeting bot", "Live transcription", "Q&A"],
        },
        {
            "provider": "google-meet",
            "name": "Google Meet",
            "category": "meeting",
            "description": "Participate in Google Meet calls",
            "icon": "https://cdn.voiceai.app/icons/meet.png",
            "features": ["Meeting bot", "Live transcription"],
        },
        {
            "provider": "microsoft-teams",
            "name": "Microsoft Teams",
            "category": "meeting",
            "description": "Join Teams meetings with AI",
            "icon": "https://cdn.voiceai.app/icons/teams.png",
            "features": ["Meeting bot", "Action items"],
        },
        {
            "provider": "hubspot",
            "name": "HubSpot",
            "category": "crm",
            "description": "Sync contacts and log calls to HubSpot",
            "icon": "https://cdn.voiceai.app/icons/hubspot.png",
            "features": ["Contact sync", "Call logging", "Deal updates"],
        },
        {
            "provider": "salesforce",
            "name": "Salesforce",
            "category": "crm",
            "description": "Integrate with Salesforce CRM",
            "icon": "https://cdn.voiceai.app/icons/salesforce.png",
            "features": ["Lead management", "Call logging"],
        },
        {
            "provider": "slack",
            "name": "Slack",
            "category": "communication",
            "description": "Send notifications to Slack channels",
            "icon": "https://cdn.voiceai.app/icons/slack.png",
            "features": ["Notifications", "Alerts", "Team updates"],
        },
        {
            "provider": "google-calendar",
            "name": "Google Calendar",
            "category": "calendar",
            "description": "Schedule and manage calendar events",
            "icon": "https://cdn.voiceai.app/icons/calendar.png",
            "features": ["Event scheduling", "Meeting sync"],
        },
        {
            "provider": "zapier",
            "name": "Zapier",
            "category": "automation",
            "description": "Connect to 5000+ apps via Zapier",
            "icon": "https://cdn.voiceai.app/icons/zapier.png",
            "features": ["Workflow automation", "Custom triggers"],
        },
        {
            "provider": "twilio",
            "name": "Twilio",
            "category": "telephony",
            "description": "Phone number and SMS capabilities",
            "icon": "https://cdn.voiceai.app/icons/twilio.png",
            "features": ["Phone numbers", "SMS", "Voice calls"],
        },
        {
            "provider": "sendgrid",
            "name": "SendGrid",
            "category": "email",
            "description": "Send automated emails",
            "icon": "https://cdn.voiceai.app/icons/sendgrid.png",
            "features": ["Email sending", "Templates"],
        },
    ]
    
    return integrations_catalog


@router.get("/connected", response_model=List[IntegrationRead])
async def list_connected_integrations(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List connected integrations for workspace."""
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
    
    integrations = session.exec(
        select(Integration).where(Integration.workspace_id == workspace_id)
    ).all()
    
    return integrations


@router.post("/{provider}/connect", response_model=IntegrationRead)
async def connect_integration(
    provider: str,
    workspace_id: int = Query(...),
    credentials: dict = {},
    settings: dict = {},
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Connect an integration to workspace."""
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership or membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires admin access",
        )
    
    # Check if already connected
    existing = session.exec(
        select(Integration).where(
            Integration.workspace_id == workspace_id,
            Integration.provider == provider,
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integration already connected",
        )
    
    # Create integration
    integration = Integration(
        workspace_id=workspace_id,
        provider=provider,
        name=provider.replace("-", " ").title(),
        category="automation",  # Should be determined by provider
        status="connected",
        credentials=credentials,
        settings=settings,
        last_sync_at=datetime.utcnow(),
    )
    
    session.add(integration)
    session.commit()
    session.refresh(integration)
    
    return integration


@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_integration(
    provider: str,
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Disconnect an integration."""
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership or membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires admin access",
        )
    
    integration = session.exec(
        select(Integration).where(
            Integration.workspace_id == workspace_id,
            Integration.provider == provider,
        )
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found",
        )
    
    session.delete(integration)
    session.commit()
    
    return None


@router.get("/{provider}/status")
async def get_integration_status(
    provider: str,
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get integration status."""
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
    
    integration = session.exec(
        select(Integration).where(
            Integration.workspace_id == workspace_id,
            Integration.provider == provider,
        )
    ).first()
    
    if not integration:
        return {
            "provider": provider,
            "connected": False,
            "status": "disconnected",
        }
    
    return {
        "provider": provider,
        "connected": True,
        "status": integration.status,
        "last_sync_at": integration.last_sync_at,
        "settings": integration.settings,
    }


@router.post("/{provider}/sync")
async def sync_integration(
    provider: str,
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Manually trigger integration sync."""
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
    
    integration = session.exec(
        select(Integration).where(
            Integration.workspace_id == workspace_id,
            Integration.provider == provider,
        )
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found",
        )
    
    # Update last sync time
    integration.last_sync_at = datetime.utcnow()
    session.add(integration)
    session.commit()
    
    # TODO: Trigger actual sync
    
    return {
        "message": "Sync initiated",
        "provider": provider,
        "last_sync_at": integration.last_sync_at,
    }


@router.post("/webhook/{provider}")
async def integration_webhook(
    provider: str,
    session: Session = Depends(get_session),
):
    """Receive webhooks from integration providers."""
    # TODO: Implement webhook handling for each provider
    # Validate webhook signature
    # Process webhook payload
    
    return {"status": "received", "provider": provider}