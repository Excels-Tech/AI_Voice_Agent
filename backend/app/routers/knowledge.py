from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlmodel import Session, select

from app.db import get_session
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.knowledge import KnowledgeAsset, KnowledgeAssetCreate, KnowledgeAssetUpdate, KnowledgeAssetRead

router = APIRouter()


@router.get("/", response_model=List[KnowledgeAssetRead])
async def list_knowledge_assets(
    workspace_id: int = Query(...),
    agent_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """List knowledge base documents."""
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
            detail="Access denied",
        )
    
    # Build query
    query = select(KnowledgeAsset).where(KnowledgeAsset.workspace_id == workspace_id)
    
    if agent_id:
        query = query.where(KnowledgeAsset.agent_id == agent_id)
    if status:
        query = query.where(KnowledgeAsset.status == status)
    
    query = query.order_by(KnowledgeAsset.created_at.desc()).offset(skip).limit(limit)
    
    assets = session.exec(query).all()
    return assets


@router.post("/upload", response_model=KnowledgeAssetRead, status_code=status.HTTP_201_CREATED)
async def upload_knowledge_asset(
    workspace_id: int = Query(...),
    agent_id: Optional[int] = Query(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Upload a knowledge base document."""
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
            detail="Access denied",
        )
    
    # Validate file type
    allowed_extensions = [".pdf", ".docx", ".txt", ".csv"]
    file_ext = "." + file.filename.split(".")[-1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}",
        )
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # TODO: Upload to S3 or storage service
    # from app.services.storage_service import upload_file
    # file_url = upload_file(content, file.filename, workspace_id)
    file_url = f"https://storage.voiceai.app/{workspace_id}/{file.filename}"
    
    # Create knowledge asset
    asset = KnowledgeAsset(
        workspace_id=workspace_id,
        agent_id=agent_id,
        filename=file.filename,
        file_type=file_ext.replace(".", ""),
        size_bytes=file_size,
        file_url=file_url,
        source_type="upload",
        status="processing",
    )
    
    session.add(asset)
    session.commit()
    session.refresh(asset)
    
    # TODO: Trigger async processing
    # from app.services.openai_service import process_document
    # process_document.delay(asset.id)
    
    return asset


@router.get("/{asset_id}", response_model=KnowledgeAssetRead)
async def get_knowledge_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Get knowledge asset details."""
    asset = session.get(KnowledgeAsset, asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == asset.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Delete knowledge asset."""
    asset = session.get(KnowledgeAsset, asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == asset.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # TODO: Delete from storage
    # from app.services.storage_service import delete_file
    # delete_file(asset.file_url)
    
    session.delete(asset)
    session.commit()
    
    return None


@router.post("/{asset_id}/process")
async def process_knowledge_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Manually trigger document processing."""
    asset = session.get(KnowledgeAsset, asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    
    # Verify workspace access
    membership = session.exec(
        select(WorkspaceMembership).where(
            WorkspaceMembership.workspace_id == asset.workspace_id,
            WorkspaceMembership.user_id == current_user.id,
            WorkspaceMembership.status == "active",
        )
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Update status
    asset.status = "processing"
    asset.updated_at = datetime.utcnow()
    session.add(asset)
    session.commit()
    
    # TODO: Trigger async processing
    # from app.services.openai_service import process_document
    # process_document.delay(asset.id)
    
    return {"message": "Processing started", "asset_id": asset.id}


@router.post("/search")
async def search_knowledge(
    workspace_id: int = Query(...),
    query: str = Query(..., min_length=1),
    agent_id: Optional[int] = Query(None),
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Semantic search in knowledge base."""
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
            detail="Access denied",
        )
    
    # TODO: Implement semantic search with OpenAI embeddings
    # from app.services.openai_service import semantic_search
    # results = semantic_search(query, workspace_id, agent_id, limit)
    
    return {
        "query": query,
        "results": [],
        "message": "Semantic search not yet implemented",
    }