from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Column, JSON


class AgentBase(SQLModel):
    """Base agent model."""
    name: str = Field(index=True)
    description: Optional[str] = None
    agent_type: str = "sales"  # sales, support, marketing, custom
    voice: str = "Nova"  # Nova, Alloy, Echo, Fable, Onyx, Shimmer
    language: str = "en-US"
    model: str = "gpt-4"  # gpt-4, gpt-3.5-turbo
    script_summary: Optional[str] = None
    goal: Optional[str] = None


class Agent(AgentBase, table=True):
    """Agent database model."""
    __tablename__ = "agents"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    status: str = "draft"  # draft, active, paused, archived
    phone_number: Optional[str] = None
    deployment_channels: List[str] = Field(default_factory=lambda: ["phone"], sa_column=Column(JSON))
    
    # Voice and LLM settings
    voice_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    llm_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Capabilities and metadata
    capabilities: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    personality: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    agent_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance metrics
    average_handle_time: Optional[int] = None  # seconds
    sentiment_score: Optional[float] = None
    concurrency_limit: int = 3
    total_calls: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    workspace: Optional["Workspace"] = Relationship(back_populates="agents")
    calls: List["CallLog"] = Relationship(back_populates="agent")
    knowledge_assets: List["KnowledgeAsset"] = Relationship(back_populates="agent")


class AgentCreate(AgentBase):
    """Schema for creating an agent."""
    workspace_id: int
    deployment_channels: List[str] = ["phone"]
    voice_settings: Dict[str, Any] = {}
    llm_settings: Dict[str, Any] = {}
    capabilities: Dict[str, Any] = {}
    personality: Dict[str, Any] = {}


class AgentUpdate(SQLModel):
    """Schema for updating an agent."""
    name: Optional[str] = None
    description: Optional[str] = None
    agent_type: Optional[str] = None
    status: Optional[str] = None
    voice: Optional[str] = None
    language: Optional[str] = None
    model: Optional[str] = None
    script_summary: Optional[str] = None
    goal: Optional[str] = None
    phone_number: Optional[str] = None
    deployment_channels: Optional[List[str]] = None
    voice_settings: Optional[Dict[str, Any]] = None
    llm_settings: Optional[Dict[str, Any]] = None
    capabilities: Optional[Dict[str, Any]] = None
    personality: Optional[Dict[str, Any]] = None
    concurrency_limit: Optional[int] = None


class AgentRead(AgentBase):
    """Schema for reading an agent."""
    id: int
    workspace_id: int
    status: str
    phone_number: Optional[str]
    deployment_channels: List[str]
    voice_settings: Dict[str, Any]
    llm_settings: Dict[str, Any]
    capabilities: Dict[str, Any]
    personality: Dict[str, Any]
    average_handle_time: Optional[int]
    sentiment_score: Optional[float]
    concurrency_limit: int
    total_calls: int
    created_at: datetime
    updated_at: datetime