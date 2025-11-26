from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.notification import Notification, NotificationCreate, NotificationRead

router = APIRouter()


@router.get("/", response_model=List[NotificationRead])
async def list_notifications(
    workspace_id: int = Query(...),
    read: bool = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List notifications for current user in workspace."""
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
    
    # Build query - get workspace notifications and user-specific ones
    query = select(Notification).where(
        Notification.workspace_id == workspace_id,
        (Notification.user_id == current_user.id) | (Notification.user_id == None)
    )
    
    if read is not None:
        query = query.where(Notification.read == read)
    
    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    
    notifications = session.exec(query).all()
    return notifications


@router.get("/unread-count")
async def get_unread_count(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get unread notification count."""
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
    
    count = session.exec(
        select(Notification).where(
            Notification.workspace_id == workspace_id,
            (Notification.user_id == current_user.id) | (Notification.user_id == None),
            Notification.read == False,
        )
    ).all()
    
    return {"unread_count": len(count)}


@router.get("/{notification_id}", response_model=NotificationRead)
async def get_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get notification details."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == notification.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return notification


@router.put("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Mark notification as read."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == notification.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    notification.read = True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    
    return notification


@router.put("/read-all")
async def mark_all_read(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Mark all notifications as read."""
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
    
    notifications = session.exec(
        select(Notification).where(
            Notification.workspace_id == workspace_id,
            (Notification.user_id == current_user.id) | (Notification.user_id == None),
            Notification.read == False,
        )
    ).all()
    
    for notification in notifications:
        notification.read = True
        session.add(notification)
    
    session.commit()
    
    return {"message": "All notifications marked as read", "count": len(notifications)}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Delete notification."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == notification.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    session.delete(notification)
    session.commit()
    
    return None