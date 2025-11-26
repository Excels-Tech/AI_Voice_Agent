from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel


class Subscription(SQLModel, table=True):
    """Subscription model tracking workspace plan and status."""
    __tablename__ = "subscriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(index=True)
    plan: str = "professional"  # starter, professional, enterprise
    status: str = "active"  # active, past_due, canceled
    current_period_start: datetime = Field(default_factory=datetime.utcnow)
    current_period_end: datetime = Field(default_factory=datetime.utcnow)
    cancel_at_period_end: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Invoice(SQLModel, table=True):
    """Billing invoice record."""
    __tablename__ = "invoices"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(index=True)
    billed_to_user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    invoice_number: str
    period_start: datetime
    period_end: datetime
    amount_cents: int
    currency: str = "usd"
    status: str = "paid"  # draft, open, paid, void
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InvoiceRead(SQLModel):
    """Schema for reading an invoice."""
    id: int
    workspace_id: int
    billed_to_user_id: Optional[int]
    invoice_number: str
    period_start: datetime
    period_end: datetime
    amount_cents: int
    currency: str
    status: str
    description: Optional[str]
    pdf_url: Optional[str]
    created_at: datetime


class UsageStat(SQLModel, table=True):
    """Usage statistics for billing and analytics."""
    __tablename__ = "usage_stats"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(index=True)
    metric: str
    value: float
    period: str = "monthly"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UsageStatRead(SQLModel):
    """Schema for reading usage stats."""
    id: int
    workspace_id: int
    metric: str
    value: float
    period: str
    created_at: datetime


class InvoiceCreate(SQLModel):
    """Schema for creating an invoice."""
    period_start: datetime
    period_end: datetime
    amount_cents: int
    currency: str = "usd"
    status: str = "open"
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    billed_to_user_id: Optional[int] = None
    invoice_number: Optional[str] = None


class UsageStatCreate(SQLModel):
    """Schema for recording usage."""
    metric: str
    value: float
    period: str = "monthly"


class PaymentMethod(SQLModel, table=True):
    """Stored payment methods per workspace."""
    __tablename__ = "payment_methods"

    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(index=True)
    brand: str
    last4: str
    exp_month: int
    exp_year: int
    cardholder_name: Optional[str] = None
    billing_email: Optional[str] = None
    provider: str = "stripe"  # stripe, braintree, etc.
    provider_method_id: Optional[str] = None  # e.g., payment method token
    is_default: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PaymentMethodRead(SQLModel):
    """Schema for reading payment method."""
    id: int
    workspace_id: int
    brand: str
    last4: str
    exp_month: int
    exp_year: int
    cardholder_name: Optional[str]
    billing_email: Optional[str]
    provider: str
    provider_method_id: Optional[str]
    is_default: bool
    created_at: datetime
    updated_at: datetime


class PaymentMethodUpdate(SQLModel):
    """Schema for creating/updating a payment method."""
    brand: str
    last4: str
    exp_month: int
    exp_year: int
    cardholder_name: Optional[str] = None
    billing_email: Optional[str] = None
    provider: str = "stripe"
    provider_method_id: Optional[str] = None
    is_default: bool = True
