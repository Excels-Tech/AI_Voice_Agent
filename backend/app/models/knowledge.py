from typing import Optional, Dict, Any
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Column, JSON


class KnowledgeAssetBase(SQLModel):
    """Base knowledge asset model."""
    filename: str
    file_type: str = "pdf"  # pdf, docx, txt, csv
    size_bytes: int = 0


class KnowledgeAsset(KnowledgeAssetBase, table=True):
    """Knowledge asset database model."""
    __tablename__ = "knowledge_assets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspaces.id", index=True)
    agent_id: Optional[int] = Field(default=None, foreign_key="agents.id", index=True)
    
    file_url: Optional[str] = None
    source_type: str = "upload"  # upload, url, integration
    status: str = "processing"  # processing, processed, failed
    chunk_count: int = 0
    asset_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    agent: Optional["Agent"] = Relationship(back_populates="knowledge_assets")


class KnowledgeAssetCreate(KnowledgeAssetBase):
    """Schema for creating a knowledge asset."""
    workspace_id: int
    agent_id: Optional[int] = None
    file_url: Optional[str] = None
    source_type: str = "upload"


class KnowledgeAssetUpdate(SQLModel):
    """Schema for updating a knowledge asset."""
    status: Optional[str] = None
    chunk_count: Optional[int] = None
    asset_metadata: Optional[Dict[str, Any]] = None


class KnowledgeAssetRead(KnowledgeAssetBase):
    """Schema for reading a knowledge asset."""
    id: int
    workspace_id: int
    agent_id: Optional[int]
    file_url: Optional[str]
    source_type: str
    status: str
    chunk_count: int
    asset_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime