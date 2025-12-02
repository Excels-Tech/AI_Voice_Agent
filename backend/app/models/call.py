from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Column, JSON


class CallLogBase(SQLModel):
    """Base call log model."""
    caller_name: Optional[str] = None
    caller_number: Optional[str] = None
    direction: str = "inbound"  # inbound, outbound
    status: str = "queued"  # queued, in-progress, completed, failed, missed, voicemail


class CallLog(CallLogBase, table=True):
    """Call log database model."""
    __tablename__ = "call_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    agent_id: Optional[int] = Field(default=None, foreign_key="agents.id", index=True)
    
    duration_seconds: int = 0
    sentiment: str = "neutral"  # positive, neutral, negative
    sentiment_score: Optional[float] = None
    
    transcript: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recording_url: Optional[str] = None
    summary: Optional[str] = None
    outcome: Optional[str] = None
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    cost_cents: int = 0
    twilio_call_sid: Optional[str] = Field(default=None, unique=True, index=True)
    
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    agent: Optional["Agent"] = Relationship(back_populates="calls")


class CallLogCreate(CallLogBase):
    """Schema for creating a call log."""
    workspace_id: int
    agent_id: Optional[int] = None


class CallLogUpdate(SQLModel):
    """Schema for updating a call log."""
    caller_name: Optional[str] = None
    status: Optional[str] = None
    duration_seconds: Optional[int] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    transcript: Optional[List[Dict[str, Any]]] = None
    recording_url: Optional[str] = None
    summary: Optional[str] = None
    outcome: Optional[str] = None
    tags: Optional[List[str]] = None
    ended_at: Optional[datetime] = None


class CallLogRead(CallLogBase):
    """Schema for reading a call log."""
    id: int
    workspace_id: int
    agent_id: Optional[int]
    duration_seconds: int
    sentiment: str
    sentiment_score: Optional[float]
    transcript: List[Dict[str, Any]]
    recording_url: Optional[str]
    summary: Optional[str]
    outcome: Optional[str]
    tags: List[str]
    cost_cents: int
    twilio_call_sid: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    created_at: datetime


class CallInitiate(SQLModel):
    """Schema for initiating an outbound call."""
    agent_id: int
    phone_number: str
    caller_id: Optional[str] = None


class CallSessionCreate(SQLModel):
    """Schema for creating a live voice session."""
    agent_id: int
    caller_name: Optional[str] = None
    caller_number: Optional[str] = None
    language: Optional[str] = None


class LiveKitDetails(SQLModel):
    """Lightweight LiveKit credential payload for clients."""
    url: str
    room: str
    agent_identity: Optional[str] = None
    agent_token: Optional[str] = None
    monitor_identity: Optional[str] = None
    monitor_token: Optional[str] = None
    expires_at: datetime


class CallSessionResponse(SQLModel):
    """Response payload after creating a live session."""
    session_id: str
    session_token: str
    call_id: int
    agent_id: int
    workspace_id: int
    websocket_path: str
    expires_at: datetime
    livekit: Optional[LiveKitDetails] = None
