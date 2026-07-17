"""
History and Search API routes.
Enables listing, searching, and reloading previous dataset analyses.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.analysis import AnalysisHistoryResponse, AnalysisListItem

router = APIRouter(prefix="/history", tags=["history"])

@router.get("", response_model=AnalysisHistoryResponse)
async def list_history(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalysisHistoryResponse:
    repo = AnalysisRepository(db)
    analyses = await repo.get_by_user_id(current_user.id, skip=skip, limit=limit)
    total = await repo.count_by_user_id(current_user.id)
    
    ds_repo = DatasetRepository(db)
    items: list[AnalysisListItem] = []
    
    for a in analyses:
        dataset = await ds_repo.get_by_id(a.dataset_id)
        ds_name = dataset.name if dataset else None
        ds_slug = dataset.slug if dataset else None
        
        items.append(
            AnalysisListItem(
                id=a.id,
                slug=ds_slug,
                dataset_id=a.dataset_id,
                dataset_name=ds_name,
                analysis_type=a.analysis_type,
                status=a.status,
                created_at=a.created_at,
                completed_at=a.completed_at,
            )
        )
    return AnalysisHistoryResponse(analyses=items, total=total)

@router.get("/search", response_model=AnalysisHistoryResponse)
async def search_history(
    q: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalysisHistoryResponse:
    repo = AnalysisRepository(db)
    analyses, total = await repo.search_by_user(current_user.id, q)
    
    ds_repo = DatasetRepository(db)
    items: list[AnalysisListItem] = []
    
    for a in analyses:
        dataset = await ds_repo.get_by_id(a.dataset_id)
        ds_name = dataset.name if dataset else None
        ds_slug = dataset.slug if dataset else None
        
        items.append(
            AnalysisListItem(
                id=a.id,
                slug=ds_slug,
                dataset_id=a.dataset_id,
                dataset_name=ds_name,
                analysis_type=a.analysis_type,
                status=a.status,
                created_at=a.created_at,
                completed_at=a.completed_at,
            )
        )
    return AnalysisHistoryResponse(analyses=items, total=len(items))
