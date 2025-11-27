from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.user_settings import UserSettings, UserSettingsRead, UserSettingsUpdate

router = APIRouter()


def _get_or_create_settings(session: Session, user_id: int) -> UserSettings:
    settings = session.exec(
        select(UserSettings).where(UserSettings.user_id == user_id)
    ).first()
    if settings:
        return settings
    settings = UserSettings(user_id=user_id)
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings


@router.get("/settings", response_model=UserSettingsRead)
async def get_account_settings(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Return account-level settings for the current user."""
    settings = _get_or_create_settings(session, current_user.id)
    return settings


@router.put("/settings", response_model=UserSettingsRead)
async def update_account_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Update account-level settings for the current user."""
    settings = _get_or_create_settings(session, current_user.id)

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(settings, key, value)
    settings.updated_at = datetime.utcnow()

    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings
