from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pathlib import Path
import uuid

from app.db import get_session
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token_type,
)
from app.core.deps import get_current_active_user
from app.models.user import User, UserCreate, UserLogin, UserRead, Token, TokenRefresh, UserUpdate
from app.models.workspace import Workspace, WorkspaceMembership
from app.models.agent import Agent

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    session: Session = Depends(get_session),
):
    """Register a new user."""
    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        avatar_url=user_data.avatar_url,
        phone=user_data.phone,
        timezone=user_data.timezone,
        language=user_data.language,
        company=user_data.company,
        job_title=user_data.job_title,
        location=user_data.location,
        bio=user_data.bio,
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create default workspace for user
    workspace = Workspace(
        name=f"{user.name}'s Workspace",
        slug=f"{user.email.split('@')[0]}-workspace",
    )
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    
    # Add user as owner of the workspace
    membership = WorkspaceMembership(
        workspace_id=workspace.id,
        user_id=user.id,
        role="owner",
        status="active",
        joined_at=datetime.utcnow(),
    )
    session.add(membership)
    session.commit()

    # Create a ready-to-use demo agent so new users can talk to the system immediately
    demo_agent = Agent(
        workspace_id=workspace.id,
        name="VoiceAI Demo Agent",
        description="Starter agent that can answer general questions and demo calls.",
        agent_type="sales",
        status="active",
        voice="Nova",
        language="en-US",
        model="gpt-4",
        script_summary="Greet callers, collect context, and propose next steps or a meeting.",
        goal="Help callers quickly understand capabilities and schedule a meeting.",
        deployment_channels=["phone", "chat"],
        voice_settings={"tone": "friendly", "pace": "steady"},
        llm_settings={"temperature": 0.5, "top_p": 0.9},
        capabilities={"languages": ["English"], "tasks": ["faq", "scheduling"]},
        personality={"traits": ["helpful", "concise", "professional"]},
    )
    session.add(demo_agent)
    session.commit()
    
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Login user and return access token."""
    # Find user
    user = session.exec(
        select(User).where(User.email == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    session.add(user)
    session.commit()
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    session: Session = Depends(get_session),
):
    """Refresh access token using refresh token."""
    payload = decode_token(token_data.refresh_token)
    verify_token_type(payload, "refresh")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = session.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user",
        )
    
    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(access_token=access_token, refresh_token=new_refresh_token)


@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
):
    """Get current user information."""
    return current_user


@router.put("/me", response_model=UserRead)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Update current user information."""
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user (client should discard tokens)."""
    return {"message": "Successfully logged out"}


@router.post("/avatar", response_model=UserRead)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Upload and set the current user's avatar image.
    Stores file under backend/static/avatars and updates avatar_url.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    # Limit to ~5MB
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    project_root = Path(__file__).resolve().parents[2]
    static_dir = project_root / "static"
    avatars_dir = static_dir / "avatars"
    avatars_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "avatar").suffix or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = avatars_dir / filename
    with open(filepath, "wb") as f:
        f.write(content)

    # Build URL served by StaticFiles
    avatar_url = f"/static/avatars/{filename}"

    current_user.avatar_url = avatar_url
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user
