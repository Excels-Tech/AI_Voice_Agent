from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class UserSettings(SQLModel, table=True):
    """Per-user account/settings preferences."""
    __tablename__ = "user_settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    theme: str = "light"  # light | dark | system
    email_notifications: bool = True
    sms_notifications: bool = False
    call_notifications: bool = True
    marketing_emails: bool = True
    weekly_reports: bool = True
    auto_save: bool = True
    sound_effects: bool = True
    compact_mode: bool = False
    call_recording_policy: str = "always"  # always | ask | never
    data_retention_days: int = 90  # 30,90,365, -1 (forever)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserSettingsRead(SQLModel):
    id: int
    user_id: int
    theme: str
    email_notifications: bool
    sms_notifications: bool
    call_notifications: bool
    marketing_emails: bool
    weekly_reports: bool
    auto_save: bool
    sound_effects: bool
    compact_mode: bool
    call_recording_policy: str
    data_retention_days: int
    created_at: datetime
    updated_at: datetime


class UserSettingsUpdate(SQLModel):
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    call_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    weekly_reports: Optional[bool] = None
    auto_save: Optional[bool] = None
    sound_effects: Optional[bool] = None
    compact_mode: Optional[bool] = None
    call_recording_policy: Optional[str] = None
    data_retention_days: Optional[int] = None
