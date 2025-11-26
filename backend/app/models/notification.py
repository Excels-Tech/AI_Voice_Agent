from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class NotificationBase(SQLModel):
    """Base notification model."""
    workspace_id: int = Field(index=True)
    user_id: Optional[int] = Field(default=None, index=True)
    type: str = "info"  # info, warning, error
    severity: str = "low"  # low, medium, high
    title: str
    message: str
    read: bool = False


class Notification(NotificationBase, table=True):
    """Notification database model."""
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    pass


class NotificationRead(NotificationBase):
    """Schema for reading a notification."""
    id: int
    created_at: datetime
    updated_at: datetime
