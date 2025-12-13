import base64
import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlmodel import Session, select, SQLModel

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.agent import Agent, AgentCreate, AgentUpdate, AgentRead
from app.models.call import CallLog
from app.services.language import resolve_language_code
from app.services.openai_service import openai_service

router = APIRouter()


class AgentChatRequest(SQLModel):
    message: str
    history: Optional[List[dict]] = None
    temperature: float = 0.6
    max_tokens: int = 400


class AgentChatResponse(SQLModel):
    reply: str
    usage: Optional[dict] = None


class AgentVoiceChatResponse(SQLModel):
    transcript: str
    reply: str
    audio: Optional[str] = None
    usage: Optional[dict] = None

@router.get("", response_model=List[AgentRead])
async def list_agents(
    workspace_id: int = Query(...),
    status: Optional[str] = Query(None),
    agent_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List all agents in workspace with optional filters."""
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to workspace",
        )
    
    # Build query
    query = select(Agent).where(Agent.workspace_id == workspace_id)
    
    if status:
        query = query.where(Agent.status == status)
    if agent_type:
        query = query.where(Agent.agent_type == agent_type)
    
    agents = session.exec(query).all()
    return agents


@router.post("", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create a new agent."""
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent_data.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to workspace",
        )
    
    # Create agent
    agent = Agent(**agent_data.dict())
    session.add(agent)
    session.commit()
    session.refresh(agent)
    
    return agent


@router.get("/{agent_id}", response_model=AgentRead)
async def get_agent(
    agent_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get agent details."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return agent


@router.put("/{agent_id}", response_model=AgentRead)
async def update_agent(
    agent_id: int,
    agent_update: AgentUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Update agent."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Update fields
    update_data = agent_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agent, field, value)
    
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    session.commit()
    session.refresh(agent)
    
    return agent


@router.post("/{agent_id}/chat", response_model=AgentChatResponse)
async def chat_with_agent(
    agent_id: int,
    payload: AgentChatRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Chat with an agent using OpenAI."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    system_prompts = [
        f"You are {agent.name}, a {agent.agent_type} AI voice agent.",
    ]
    if agent.goal:
        system_prompts.append(f"Primary Goal: {agent.goal}")
    if agent.script_summary:
        system_prompts.append(f"Script Summary: {agent.script_summary}")
    if agent.capabilities:
        system_prompts.append(f"Capabilities: {agent.capabilities}")
    if agent.personality:
        system_prompts.append(f"Personality: {agent.personality}")
    system_prompts.append(
        "First-turn rule: if this is the first reply in the conversation, greet the user, "
        f"introduce yourself as {agent.name} the {agent.agent_type} agent, briefly state how you can help, "
        "and ask a concise opening question suited to the current mode (voice/chat). "
        "After the first turn, avoid repeating your name unless asked."
    )

    messages = [
        {"role": "system", "content": "\n".join(system_prompts)},
    ]
    if payload.history:
        messages.extend(payload.history)
    messages.append({"role": "user", "content": payload.message})

    response = await openai_service.chat_completion(
        messages=messages,
        model=agent.model or "gpt-4o-mini",
        temperature=min(payload.temperature, 0.8),
        max_tokens=min(payload.max_tokens, 320),
    )

    return AgentChatResponse(reply=response["content"], usage=response.get("usage"))


@router.post("/{agent_id}/voice-chat", response_model=AgentVoiceChatResponse)
async def voice_chat_with_agent(
    agent_id: int,
    file: UploadFile = File(...),
    history: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Voice entrypoint: accepts recorded audio, transcribes, chats, and returns TTS audio."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()

    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    whisper_language = resolve_language_code(agent.language).split("-")[0]

    audio_bytes = await file.read()
    extension = ".webm"
    if file.filename and "." in file.filename:
        extension = f".{file.filename.split('.')[-1]}"

    transcription = await openai_service.speech_to_text(
        audio_file=audio_bytes,
        language=whisper_language or "en",
        file_extension=extension,
    )

    user_text = transcription.get("text", "").strip() or "..."

    history_messages: List[dict] = []
    if history:
        try:
            history_messages = json.loads(history)
        except json.JSONDecodeError:
            history_messages = []

    system_prompts = [
        f"You are {agent.name}, a {agent.agent_type} AI voice agent.",
    ]
    if agent.goal:
        system_prompts.append(f"Primary Goal: {agent.goal}")
    if agent.script_summary:
        system_prompts.append(f"Script Summary: {agent.script_summary}")
    if agent.capabilities:
        system_prompts.append(f"Capabilities: {agent.capabilities}")
    if agent.personality:
        system_prompts.append(f"Personality: {agent.personality}")
    system_prompts.append(
        "First-turn rule: on the first spoken reply, greet the caller, introduce yourself as "
        f"{agent.name} the {agent.agent_type} agent, state how you can help, and ask a succinct, relevant question. "
        "Do not repeat the introduction after the first turn unless the caller asks."
    )

    messages = [{"role": "system", "content": "\n".join(system_prompts)}]
    if history_messages:
        messages.extend(history_messages)
    messages.append({"role": "user", "content": user_text})

    response = await openai_service.chat_completion(
        messages=messages,
        model=agent.model or "gpt-4o-mini",
        temperature=0.45,
        max_tokens=260,
    )

    audio_bytes = await openai_service.text_to_speech(
        text=response["content"],
        voice=agent.voice or "nova",
        model="tts-1",
    )
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    return AgentVoiceChatResponse(
        transcript=user_text,
        reply=response["content"],
        audio=audio_base64,
        usage=response.get("usage"),
    )


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Delete agent."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    # Verify workspace access (admin or owner)
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership or membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires admin access",
        )
    
    session.delete(agent)
    session.commit()
    
    return None


@router.post("/{agent_id}/deploy")
async def deploy_agent(
    agent_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Deploy/activate agent."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    agent.status = "active"
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    session.commit()
    
    return {"message": "Agent deployed successfully", "agent_id": agent.id, "status": "active"}


@router.post("/{agent_id}/pause")
async def pause_agent(
    agent_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Pause agent."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    agent.status = "paused"
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    session.commit()
    
    return {"message": "Agent paused successfully", "agent_id": agent.id, "status": "paused"}


@router.post("/{agent_id}/clone", response_model=AgentRead)
async def clone_agent(
    agent_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Clone an existing agent."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Clone agent
    cloned = Agent(
        workspace_id=agent.workspace_id,
        name=f"{agent.name} (Copy)",
        description=agent.description,
        agent_type=agent.agent_type,
        status="draft",
        voice=agent.voice,
        language=agent.language,
        model=agent.model,
        script_summary=agent.script_summary,
        goal=agent.goal,
        deployment_channels=agent.deployment_channels,
        voice_settings=agent.voice_settings,
        llm_settings=agent.llm_settings,
        capabilities=agent.capabilities,
        personality=agent.personality,
        concurrency_limit=agent.concurrency_limit,
    )
    
    session.add(cloned)
    session.commit()
    session.refresh(cloned)
    
    return cloned


@router.get("/{agent_id}/analytics")
async def get_agent_analytics(
    agent_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get agent analytics."""
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == agent.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Get call statistics
    calls = session.exec(
        select(CallLog).where(CallLog.agent_id == agent_id)
    ).all()
    
    total_calls = len(calls)
    completed_calls = len([c for c in calls if c.status == "completed"])
    total_duration = sum([c.duration_seconds for c in calls])
    avg_duration = total_duration / total_calls if total_calls > 0 else 0
    
    sentiment_counts = {
        "positive": len([c for c in calls if c.sentiment == "positive"]),
        "neutral": len([c for c in calls if c.sentiment == "neutral"]),
        "negative": len([c for c in calls if c.sentiment == "negative"]),
    }
    
    return {
        "agent_id": agent.id,
        "agent_name": agent.name,
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "average_duration_seconds": int(avg_duration),
        "sentiment_distribution": sentiment_counts,
        "overall_sentiment_score": agent.sentiment_score,
    }
