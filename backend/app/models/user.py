from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from pydantic import EmailStr, field_validator
from sqlalchemy import Column, String, Text


class UserBase(SQLModel):
    """Base user model."""
    name: str = Field(index=True)
    email: EmailStr = Field(unique=True, index=True)
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    timezone: str = "UTC"
    language: str = "en-US"
    date_format: str = "YYYY-MM-DD"
    is_active: bool = True
    company: Optional[str] = None
    job_title: Optional[str] = Field(default=None, description="Display role/position")
    location: Optional[str] = None
    bio: Optional[str] = Field(default=None, sa_column=Column(Text))


class User(UserBase, table=True):
    """User database model."""
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    # Override email field for SQLAlchemy compatibility
    email: str = Field(sa_column=Column("email", String, unique=True, index=True, nullable=False))
    hashed_password: str
    role: str = "member"  # system role: member, admin, super_admin
    last_login_at: Optional[datetime] = None
    email_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    memberships: List["WorkspaceMembership"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_length_bytes(cls, v: str) -> str:
        # Bcrypt has a 72-byte limit; using bcrypt_sha256 mitigates this,
        # but we still cap to a reasonable maximum for safety.
        if len(v.encode("utf-8")) > 256:
            raise ValueError("Password too long; must be <= 256 bytes")
        return v


class UserUpdate(SQLModel):
    """Schema for updating a user."""
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    date_format: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None


class UserRead(UserBase):
    """Schema for reading a user."""
    id: int
    role: str
    email_verified: bool
    last_login_at: Optional[datetime]
    created_at: datetime


class UserLogin(SQLModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(SQLModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(SQLModel):
    """Token refresh request."""
    refresh_token: str
