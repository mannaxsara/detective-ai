"""
Data-cleaning API routes.
Returns quality issues and applies requested fixes to datasets.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.dataset_repository import DatasetRepository
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.cleaning import CleaningApplyRequest, CleaningApplyResponse, CleaningResponse
from app.services.cleaning_service import CleaningService

router = APIRouter(prefix="/datasets", tags=["cleaning"])

@router.get("/{dataset_id}/cleaning", response_model=CleaningResponse)
async def get_cleaning_suggestions(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CleaningResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    clean_service = CleaningService(db)
    try:
        suggestions = await clean_service.detect_issues(dataset.file_path, dataset.file_type)
        return CleaningResponse(
            suggestions=suggestions,
            total_issues=len(suggestions),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan dataset issues: {str(e)}")

@router.post("/{dataset_id}/cleaning/apply", response_model=CleaningApplyResponse)
async def apply_cleaning_fixes(
    dataset_id: str,
    request: CleaningApplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CleaningApplyResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")

    clean_service = CleaningService(db)
    try:
        res = await clean_service.apply_fixes(dataset.file_path, dataset.file_type, request.fix_ids)
        
        # Recalculate profile and health score on newly cleaned file
        from app.services.profiling_service import profile_dataset
        profile = await profile_dataset(dataset.file_path, dataset.file_type)

        # Update row, col count, health score, and profile data in database
        profile_dict = profile.model_dump() if hasattr(profile, "model_dump") else profile
        await repo.update_by_id(
            resolved_id,
            row_count=profile.row_count,
            column_count=profile.column_count,
            health_score=profile.health_score,
            profile_data=profile_dict,
        )

        # Clear cached statistics, anomalies, and forecasts for this dataset's analysis
        analysis_repo = AnalysisRepository(db)
        existing_analyses = await analysis_repo.get_by_dataset_id(resolved_id)
        if existing_analyses:
            for analysis in existing_analyses:
                await analysis_repo.update_by_id(
                    analysis.id,
                    statistics=None,
                    anomalies=None,
                    forecast=None,
                )

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply fixes: {str(e)}")
