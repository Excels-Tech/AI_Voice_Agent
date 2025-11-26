from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Column, JSON


class WebhookSubscriptionBase(SQLModel):
    """Base webhook subscription model."""
    name: str
    url: str
    events: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    active: bool = True


class WebhookSubscription(WebhookSubscriptionBase, table=True):
    """Webhook subscription database model."""
    __tablename__ = "webhook_subscriptions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    
    secret: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class WebhookSubscriptionCreate(WebhookSubscriptionBase):
    """Schema for creating a webhook subscription."""
    workspace_id: int


class WebhookSubscriptionRead(WebhookSubscriptionBase):
    """Schema for reading a webhook subscription."""
    id: int
    workspace_id: int
    created_at: datetime