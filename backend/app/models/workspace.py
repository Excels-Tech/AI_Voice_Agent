from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Column, JSON
from pydantic import EmailStr


class WorkspaceBase(SQLModel):
    """Base workspace model."""
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    industry: Optional[str] = None
    timezone: str = "UTC"
    language: str = "en-US"
    voice: str = "Nova"
    logo_url: Optional[str] = None


class Workspace(WorkspaceBase, table=True):
    """Workspace database model."""
    __tablename__ = "workspaces"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    plan: str = "professional"  # starter, professional, enterprise
    inbound_number: Optional[str] = None
    outbound_caller_id: Optional[str] = None
    branding: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    memberships: List["WorkspaceMembership"] = Relationship(back_populates="workspace")
    agents: List["Agent"] = Relationship(back_populates="workspace")


class WorkspaceCreate(WorkspaceBase):
    """Schema for creating a workspace."""
    pass


class WorkspaceUpdate(SQLModel):
    """Schema for updating a workspace."""
    name: Optional[str] = None
    industry: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    voice: Optional[str] = None
    logo_url: Optional[str] = None
    inbound_number: Optional[str] = None
    outbound_caller_id: Optional[str] = None
    branding: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None


class WorkspaceRead(WorkspaceBase):
    """Schema for reading a workspace."""
    id: int
    plan: str
    inbound_number: Optional[str]
    outbound_caller_id: Optional[str]
    branding: Dict[str, Any]
    settings: Dict[str, Any]
    is_active: bool
    created_at: datetime


class WorkspaceMembership(SQLModel, table=True):
    """Workspace membership model."""
    __tablename__ = "workspace_memberships"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: str = "member"  # owner, admin, member
    status: str = "active"  # active, invited, suspended
    invited_by: Optional[int] = None
    joined_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    workspace: Optional[Workspace] = Relationship(back_populates="memberships")
    user: Optional["User"] = Relationship(back_populates="memberships")


class MemberInvite(SQLModel):
    """Schema for inviting a member."""
    email: EmailStr
    role: str = "member"


class MemberRead(SQLModel):
    """Schema for reading a member."""
    id: int
    user_id: int
    name: str
    email: str
    avatar_url: Optional[str]
    role: str
    status: str
    joined_at: Optional[datetime]