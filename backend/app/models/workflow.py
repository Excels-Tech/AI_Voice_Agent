from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Column, JSON


class WorkflowBase(SQLModel):
    """Base workflow model."""
    workspace_id: int = Field(index=True)
    name: str
    status: str = "active"  # active, paused, archived
    trigger: str
    steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))


class Workflow(WorkflowBase, table=True):
    """Workflow database model."""
    __tablename__ = "workflows"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class WorkflowCreate(WorkflowBase):
    """Schema for creating a workflow."""
    pass


class WorkflowRead(WorkflowBase):
    """Schema for reading a workflow."""
    id: int
    created_at: datetime
    updated_at: datetime
