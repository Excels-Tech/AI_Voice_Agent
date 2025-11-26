from typing import Optional, Dict, Any
from datetime import datetime
from sqlmodel import Field, SQLModel, Column, JSON


class IntegrationBase(SQLModel):
    """Base integration model."""
    provider: str  # hubspot, salesforce, slack, zoom, etc.
    name: str
    category: str = "automation"  # crm, communication, calendar, automation


class Integration(IntegrationBase, table=True):
    """Integration database model."""
    __tablename__ = "integrations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    
    status: str = "disconnected"  # connected, disconnected, error
    credentials: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    last_sync_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class IntegrationCreate(IntegrationBase):
    """Schema for creating an integration."""
    workspace_id: int
    credentials: Dict[str, Any] = {}
    settings: Dict[str, Any] = {}


class IntegrationRead(IntegrationBase):
    """Schema for reading an integration."""
    id: int
    workspace_id: int
    status: str
    settings: Dict[str, Any]
    last_sync_at: Optional[datetime]
    created_at: datetime