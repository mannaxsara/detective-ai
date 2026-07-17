"""
Analysis API routes.
Triggers autonomous analyses and retrieves profiling, charts, KPIs, and insights.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.analysis import AnalysisResponse, ChartConfig, InsightItem, KPICard, AnalysisTriggerRequest
from app.services.kpi_service import detect_kpis
from app.services.insight_engine import discover_insights
from app.services.eda_service import run_eda

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/trigger", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def trigger_analysis(
    request: AnalysisTriggerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalysisResponse:
    from app.core.slug import decode_id
    resolved_dataset_id = decode_id(str(request.dataset_id))
    if resolved_dataset_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # 1. Fetch dataset
    ds_repo = DatasetRepository(db)
    dataset = await ds_repo.get_by_id(resolved_dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # 2. Compute components synchronously/in-thread for immediate UI return
    # (Fast enough for typical <= 100MB files with Polars)
    try:
        kpis = detect_kpis(dataset.file_path, dataset.file_type)
        insights = discover_insights(dataset.file_path, dataset.file_type)
        charts = run_eda(dataset.file_path, dataset.file_type)
        
        # Profile dataset and update dataset details
        from app.services.profiling_service import profile_dataset
        profile = await profile_dataset(dataset.file_path, dataset.file_type)
        dataset.row_count = profile.row_count
        dataset.column_count = profile.column_count
        dataset.health_score = profile.health_score
        dataset.status = "completed"
        db.add(dataset)
        await db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis orchestration failed: {str(e)}")

    # 3. Save Analysis record
    analysis_repo = AnalysisRepository(db)
    
    # Check if there is an existing analysis for this dataset
    existing = await analysis_repo.get_by_dataset_id(resolved_dataset_id)
    if existing:
        # Update existing
        analysis = await analysis_repo.update_by_id(
            existing[0].id,
            status="completed",
            kpis=[k.model_dump() for k in kpis],
            insights=[i.model_dump() for i in insights],
            charts=[c.model_dump() for c in charts],
            completed_at=datetime.utcnow()
        )
    else:
        # Create new
        analysis = await analysis_repo.create(
            dataset_id=resolved_dataset_id,
            user_id=current_user.id,
            analysis_type="full",
            status="completed",
            kpis=[k.model_dump() for k in kpis],
            insights=[i.model_dump() for i in insights],
            charts=[c.model_dump() for c in charts],
            completed_at=datetime.utcnow()
        )

    return AnalysisResponse.model_validate(analysis)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalysisResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    
    if not analysis:
        ds_repo = DatasetRepository(db)
        dataset = await ds_repo.get_by_id(resolved_id)
        if dataset and dataset.user_id == current_user.id:
            try:
                kpis = detect_kpis(dataset.file_path, dataset.file_type)
                insights = discover_insights(dataset.file_path, dataset.file_type)
                charts = run_eda(dataset.file_path, dataset.file_type)
                
                # Profile dataset and update dataset details
                from app.services.profiling_service import profile_dataset
                profile = await profile_dataset(dataset.file_path, dataset.file_type)
                dataset.row_count = profile.row_count
                dataset.column_count = profile.column_count
                dataset.health_score = profile.health_score
                dataset.status = "completed"
                db.add(dataset)
                await db.commit()
                
                analysis = await repo.create(
                    dataset_id=dataset.id,
                    user_id=current_user.id,
                    analysis_type="full",
                    status="completed",
                    kpis=[k.model_dump() for k in kpis],
                    insights=[i.model_dump() for i in insights],
                    charts=[c.model_dump() for c in charts],
                    completed_at=datetime.utcnow()
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to auto-generate analysis: {str(e)}")
        else:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
    elif analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return AnalysisResponse.model_validate(analysis)

@router.get("/{analysis_id}/charts", response_model=list[ChartConfig])
async def get_analysis_charts(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ChartConfig]:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    chart_data = analysis.charts or []
    return [ChartConfig.model_validate(c) for c in chart_data]

@router.get("/{analysis_id}/kpis", response_model=list[KPICard])
async def get_analysis_kpis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[KPICard]:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    kpis = analysis.kpis or []
    return [KPICard.model_validate(k) for k in kpis]

@router.get("/{analysis_id}/insights", response_model=list[InsightItem])
async def get_analysis_insights(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[InsightItem]:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    insights = analysis.insights or []
    return [InsightItem.model_validate(i) for i in insights]

@router.get("/{analysis_id}/recommendations", response_model=list[str])
async def get_analysis_recommendations(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[str]:
    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    repo = AnalysisRepository(db)
    analysis = await repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    from app.services.insight_provider import RuleBasedInsightProvider
    provider = RuleBasedInsightProvider()
    
    insights_list = [i.model_dump() if hasattr(i, "model_dump") else i for i in (analysis.insights or [])]
    recs = await provider.recommend(insights_list)
    return recs

@router.post("/{analysis_id}/chat")
async def chat_with_dataset(
    analysis_id: str,
    payload: dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
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
    
    context = {
        "kpis": [k.model_dump() if hasattr(k, "model_dump") else k for k in (analysis.kpis or [])],
        "insights": [i.model_dump() if hasattr(i, "model_dump") else i for i in (analysis.insights or [])],
        "anomalies": [a.model_dump() if hasattr(a, "model_dump") else a for a in (analysis.anomalies or [])],
        "cleaning_suggestions": analysis.cleaning_suggestions or [],
        "forecast": analysis.forecast or {},
        "row_count": dataset.row_count if dataset else 0,
        "column_count": dataset.column_count if dataset else 0,
        "health_score": dataset.health_score if dataset else 0.0,
        "profile_data": dataset.profile_data or {},
    }
    
    from app.services.insight_provider import RuleBasedInsightProvider
    provider = RuleBasedInsightProvider()
    
    reply = await provider.chat(payload.get("message", ""), context)
    return {"reply": reply}

@router.get("/{analysis_id}/root-cause")
async def get_analysis_root_cause(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
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
        
    from app.services.root_cause_service import generate_root_cause_tree
    tree = generate_root_cause_tree(dataset.file_path, dataset.file_type)
    return tree
