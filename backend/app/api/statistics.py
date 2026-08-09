"""
Statistics and anomalies API routes.
Runs statistical hypothesis tests and detects multivariate / univariate outliers.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.analysis import AnomalyItem, CorrelationResult, StatisticalTest
from app.services.anomaly_service import detect_anomalies
from app.services.statistics_service import compute_correlations, run_statistics

router = APIRouter(prefix="/analysis", tags=["statistics"])

@router.get("/{analysis_id}/statistics", response_model=list[StatisticalTest])
async def get_analysis_statistics(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[StatisticalTest]:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Run stats if not already cached
    if not analysis.statistics:
        ds_repo = DatasetRepository(db)
        dataset = await ds_repo.get_by_id(analysis.dataset_id)
        if dataset:
            import os
            if os.path.exists(dataset.file_path):
                try:
                    stats_list = run_statistics(dataset.file_path, dataset.file_type)
                    analysis = await repo.update_by_id(
                        analysis.id,
                        statistics=[s.model_dump() for s in stats_list]
                    )
                except Exception:
                    pass

    return [StatisticalTest.model_validate(s) for s in (analysis.statistics or [])]


@router.get("/{analysis_id}/correlations", response_model=CorrelationResult)
async def get_analysis_correlations(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CorrelationResult:
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

    import os
    if os.path.exists(dataset.file_path):
        try:
            return compute_correlations(dataset.file_path, dataset.file_type)
        except Exception:
            pass

    return CorrelationResult(columns=[], matrix=[])

@router.get("/{analysis_id}/anomalies", response_model=list[AnomalyItem])
async def get_analysis_anomalies(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AnomalyItem]:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Run anomaly detection if not already cached
    if not analysis.anomalies:
        ds_repo = DatasetRepository(db)
        dataset = await ds_repo.get_by_id(analysis.dataset_id)
        if dataset:
            import os
            if os.path.exists(dataset.file_path):
                try:
                    anom_list = detect_anomalies(dataset.file_path, dataset.file_type)
                    analysis = await repo.update_by_id(
                        analysis.id,
                        anomalies=[a.model_dump() for a in anom_list]
                    )
                except Exception:
                    pass

    return [AnomalyItem.model_validate(a) for a in (analysis.anomalies or [])]
