from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Column, JSON


class MeetingBase(SQLModel):
    """Base meeting model."""
    title: str
    platform: str = "zoom"  # zoom, meet, teams, webex
    meeting_url: Optional[str] = None
    scheduled_for: datetime


class Meeting(MeetingBase, table=True):
    """Meeting database model."""
    __tablename__ = "meetings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    agent_id: Optional[int] = Field(default=None, foreign_key="agents.id", index=True)
    
    meeting_id: Optional[str] = None
    status: str = "scheduled"  # scheduled, in-progress, completed, cancelled
    duration_seconds: Optional[int] = None
    
    participants: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    transcript: Optional[str] = None
    summary: Optional[str] = None
    action_items: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recording_url: Optional[str] = None
    transcript_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MeetingCreate(MeetingBase):
    """Schema for creating a meeting."""
    workspace_id: int
    agent_id: Optional[int] = None


class MeetingUpdate(SQLModel):
    """Schema for updating a meeting."""
    title: Optional[str] = None
    status: Optional[str] = None
    meeting_url: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    summary: Optional[str] = None
    action_items: Optional[List[str]] = None


class MeetingRead(MeetingBase):
    """Schema for reading a meeting."""
    id: int
    workspace_id: int
    agent_id: Optional[int]
    meeting_id: Optional[str]
    status: str
    duration_seconds: Optional[int]
    participants: List[Dict[str, Any]]
    transcript: Optional[str]
    summary: Optional[str]
    action_items: List[str]
    recording_url: Optional[str]
    created_at: datetime