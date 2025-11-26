from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.core.deps import get_current_active_user, require_workspace_role
from app.models.user import User
from app.models.workspace import (
    Workspace,
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceRead,
    WorkspaceMembership,
    MemberInvite,
    MemberRead,
)

router = APIRouter()


@router.get("/", response_model=List[WorkspaceRead])
async def list_workspaces(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List all workspaces for current user."""
    memberships = session.exec(
        select(WorkspaceMembership)
        .where(WorkspaceMembership.user_id == current_user.id)
        .where(WorkspaceMembership.status == "active")
    ).all()
    
    workspaces = []
    for membership in memberships:
        workspace = session.get(Workspace, membership.workspace_id)
        if workspace:
            workspaces.append(workspace)
    
    return workspaces


@router.post("/", response_model=WorkspaceRead, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create a new workspace."""
    # Check if slug is unique
    existing = session.exec(
        select(Workspace).where(Workspace.slug == workspace_data.slug)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workspace slug already exists",
        )
    
    # Create workspace
    workspace = Workspace(**workspace_data.dict())
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    
    # Add creator as owner
    membership = WorkspaceMembership(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role="owner",
        status="active",
        joined_at=datetime.utcnow(),
    )
    session.add(membership)
    session.commit()
    
    return workspace


@router.get("/{workspace_id}", response_model=WorkspaceRead)
async def get_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get workspace details."""
    # Verify access
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
    
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )
    
    return workspace


@router.put("/{workspace_id}", response_model=WorkspaceRead)
async def update_workspace(
    workspace_id: int,
    workspace_update: WorkspaceUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Update workspace."""
    # Verify admin access
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
    
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )
    
    # Update fields
    update_data = workspace_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workspace, field, value)
    
    workspace.updated_at = datetime.utcnow()
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    
    return workspace


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Delete workspace (owner only)."""
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership or membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workspace owner can delete",
        )
    
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )
    
    session.delete(workspace)
    session.commit()
    
    return None


@router.get("/{workspace_id}/members", response_model=List[MemberRead])
async def list_members(
    workspace_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List workspace members."""
    # Verify access
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
    
    memberships = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id
        )
    ).all()
    
    members = []
    for m in memberships:
        user = session.get(User, m.user_id)
        if user:
            members.append({
                "id": m.id,
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "role": m.role,
                "status": m.status,
                "joined_at": m.joined_at,
            })
    
    return members


@router.post("/{workspace_id}/invite", status_code=status.HTTP_201_CREATED)
async def invite_member(
    workspace_id: int,
    invite_data: MemberInvite,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Invite member to workspace."""
    # Verify admin access
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
    
    # Check if user exists
    user = session.exec(
        select(User).where(User.email == invite_data.email)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if already a member
    existing = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == user.id,
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member",
        )
    
    # Create membership
    new_membership = WorkspaceMembership(
        workspace_id=workspace_id,
        user_id=user.id,
        role=invite_data.role,
        status="invited",
        invited_by=current_user.id,
    )
    session.add(new_membership)
    session.commit()
    
    return {"message": "Invitation sent", "email": invite_data.email}


@router.delete("/{workspace_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    workspace_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Remove member from workspace."""
    # Verify admin access
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
    
    # Find member to remove
    member = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == user_id,
        )
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )
    
    # Can't remove workspace owner
    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove workspace owner",
        )
    
    session.delete(member)
    session.commit()
    
    return None