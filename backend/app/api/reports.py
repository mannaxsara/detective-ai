"""
Reports API routes.
Generates and downloads PDF/DOCX business intelligence summaries.
"""

from __future__ import annotations

import os
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.report import Report
from app.models.user import User
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.dataset_repository import DatasetRepository
from app.repositories.report_repository import ReportRepository
from app.services.insight_provider import RuleBasedInsightProvider
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/analysis/{analysis_id}", status_code=status.HTTP_201_CREATED)
async def generate_report(
    analysis_id: str,
    file_format: str,  # pdf | docx
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    file_format = file_format.lower()
    if file_format not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="Invalid format. Supported formats are pdf and docx.")

    from app.core.slug import decode_id
    resolved_id = decode_id(analysis_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # 1. Fetch analysis
    analysis_repo = AnalysisRepository(db)
    analysis = await analysis_repo.get_by_id_or_dataset_id(resolved_id)
    if not analysis or analysis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # 2. Fetch dataset
    ds_repo = DatasetRepository(db)
    dataset = await ds_repo.get_by_id(analysis.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # 3. Generate summary & recommendations using InsightProvider
    ai_provider = RuleBasedInsightProvider()
    summary = await ai_provider.summarize(analysis.__dict__)
    recs = await ai_provider.recommend(analysis.insights or [])

    # 4. Generate document
    report_service = ReportService()
    try:
        if file_format == "pdf":
            file_path = report_service.generate_pdf(
                analysis_id=analysis.id,
                dataset_name=dataset.name,
                kpis=analysis.kpis or [],
                insights=analysis.insights or [],
                statistics=analysis.statistics or [],
                summary=summary,
                recommendations=recs,
            )
        else:
            file_path = report_service.generate_docx(
                analysis_id=analysis.id,
                dataset_name=dataset.name,
                kpis=analysis.kpis or [],
                insights=analysis.insights or [],
                statistics=analysis.statistics or [],
                summary=summary,
                recommendations=recs,
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")

    # 5. Save report record
    report_repo = ReportRepository(db)
    report = await report_repo.create(
        analysis_id=analysis_id,
        user_id=current_user.id,
        title=f"DetectiveAI Report for {dataset.name}",
        format=file_format,
        file_path=file_path,
        sections={"summary": summary, "recommendations": recs},
    )

    return {"message": "Report generated successfully", "report_id": report.id}

@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    repo = ReportRepository(db)
    report = await repo.get_by_id(report_id)
    if not report or report.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Report not found")

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")

    filename = os.path.basename(report.file_path)
    
    media_type = "application/pdf" if report.format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    return FileResponse(
        report.file_path,
        media_type=media_type,
        filename=filename,
    )
