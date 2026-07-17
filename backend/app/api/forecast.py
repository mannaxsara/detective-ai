"""
Forecasting API routes.
Runs time-series forecasting using Facebook's Prophet.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.analysis import ForecastResult
from app.services.forecast_service import generate_forecast

router = APIRouter(prefix="/analysis", tags=["forecasting"])

@router.post("/{analysis_id}/forecast", response_model=ForecastResult)
async def run_analysis_forecast(
    analysis_id: str,
    target_col: str | None = None,
    periods: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForecastResult:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")

    ds_repo = DatasetRepository(db)
    dataset = await ds_repo.get_by_id(analysis.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    try:
        res = generate_forecast(dataset.file_path, dataset.file_type, target_col, periods)
        if not res:
            raise HTTPException(
                status_code=400,
                detail="Unable to generate forecast. Verify that your dataset has a temporal column and numeric columns."
            )
        
        # Cache standard 30-day forecast inside analysis record
        if periods == 30:
            await repo.update_by_id(
                analysis.id,
                forecast=res.model_dump()
            )

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")

@router.get("/{analysis_id}/forecast", response_model=ForecastResult)
async def get_analysis_forecast(
    analysis_id: str,
    target_col: str | None = None,
    periods: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForecastResult:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Serve cached default 30-day forecast if no custom target is selected
    if not target_col and periods == 30 and analysis.forecast:
        return ForecastResult.model_validate(analysis.forecast)

    # Otherwise, generate forecast dynamically
    ds_repo = DatasetRepository(db)
    dataset = await ds_repo.get_by_id(analysis.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    res = generate_forecast(dataset.file_path, dataset.file_type, target_col, periods)
    if not res:
        raise HTTPException(
            status_code=400,
            detail="Unable to generate forecast. Verify that your dataset has a temporal column and numeric columns."
        )

    # Save to cache if it's the default 30-day run and not already cached
    if not target_col and periods == 30 and not analysis.forecast:
        await repo.update_by_id(
            analysis.id,
            forecast=res.model_dump()
        )

    return res
