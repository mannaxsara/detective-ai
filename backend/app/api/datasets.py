"""
Datasets API routes.
Handles uploading, listing, profiling, and previewing datasets.
"""

from __future__ import annotations

import os
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, rate_limit_ip
from app.database.session import get_db
from app.models.user import User
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.dataset import (
    DatasetListResponse,
    DatasetPreviewResponse,
    DatasetProfileResponse,
    DatasetResponse,
)
from app.services.profiling_service import profile_dataset
from app.services.upload_service import UploadService

router = APIRouter(prefix="/datasets", tags=["datasets"])

@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _rate_limit: None = Depends(rate_limit_ip(max_requests=10, window_seconds=60)),
) -> DatasetResponse:
    repo = DatasetRepository(db)
    user_dataset_count = await repo.count_by_user_id(current_user.id)
    if user_dataset_count >= 25:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Storage quota reached (maximum 25 case files on free tier). Please delete older cases from your archive to upload new evidence.",
        )

    upload_service = UploadService(db)
    dataset = await upload_service.save_file(file, current_user.id)
    return dataset

@router.get("", response_model=DatasetListResponse)
async def list_datasets(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DatasetListResponse:
    repo = DatasetRepository(db)
    datasets, total = await repo.get_by_user_id_paginated(current_user.id, skip, limit)
    # Convert models to schemas
    items = [DatasetResponse.model_validate(d) for d in datasets]
    return DatasetListResponse(datasets=items, total=total)

@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DatasetResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return DatasetResponse.model_validate(dataset)

@router.get("/{dataset_id}/profile", response_model=DatasetProfileResponse)
async def get_dataset_profile(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DatasetProfileResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # 1. Return stored profile_data from DB if available
    if dataset.profile_data:
        try:
            return DatasetProfileResponse.model_validate(dataset.profile_data)
        except Exception:
            pass

    # 2. Try profiling from disk file if present
    from app.services.storage_service import ensure_dataset_file
    await ensure_dataset_file(dataset)
    import os
    if os.path.exists(dataset.file_path):
        try:
            profile = await profile_dataset(dataset.file_path, dataset.file_type)
            profile_dict = profile.model_dump() if hasattr(profile, "model_dump") else profile
            dataset.profile_data = profile_dict
            dataset.row_count = profile.row_count
            dataset.column_count = profile.column_count
            dataset.health_score = profile.health_score
            dataset.status = "completed"
            db.add(dataset)
            await db.commit()
            return profile
        except Exception:
            pass

    # 3. Fallback profile response from dataset table metadata
    return DatasetProfileResponse(
        row_count=dataset.row_count or 0,
        column_count=dataset.column_count or 0,
        memory_usage_bytes=dataset.file_size or 0,
        duplicate_row_count=0,
        health_score=dataset.health_score or 100.0,
        columns=[],
    )

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Remove file from disk if it exists
    if os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass

    # Remove backup from Supabase Storage if configured
    import asyncio
    from app.services.storage_service import delete_file_backup
    asyncio.create_task(delete_file_backup(f"{dataset.user_id}/{os.path.basename(dataset.file_path)}"))

    await repo.delete_by_id(resolved_id)

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
async def get_dataset_preview(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DatasetPreviewResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")

    from app.services.storage_service import ensure_dataset_file
    await ensure_dataset_file(dataset)

    from app.services.profiling_service import _load_dataframe, _safe_value
    try:
        df = _load_dataframe(dataset.file_path, dataset.file_type)
        preview_df = df.head(100)
        
        # Convert df to JSON-compliant dicts (sanitizing non-finite floats)
        columns = preview_df.columns
        rows = [{k: _safe_value(v) for k, v in row.items()} for row in preview_df.to_dicts()]
        
        return DatasetPreviewResponse(
            columns=columns,
            rows=rows,
            total_rows=df.height,
        )
    except Exception as e:
        is_dev = os.getenv("ENVIRONMENT", "development") == "development"
        detail = f"Failed to load preview: {str(e)}" if is_dev else "Failed to load dataset preview."
        raise HTTPException(status_code=500, detail=detail)

@router.get("/{dataset_id}/download", response_model=None)
async def download_dataset_file(
    dataset_id: str,
    format: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response | FileResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    from app.services.storage_service import ensure_dataset_file
    await ensure_dataset_file(dataset)

    if not os.path.exists(dataset.file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found on disk")

    requested_fmt = (format or "").lower().strip()
    original_fmt = (dataset.file_type or "csv").lower()

    # If format is omitted or matches native file, stream directly
    if not requested_fmt or requested_fmt == original_fmt:
        media_type = "application/octet-stream"
        if original_fmt == "csv":
            media_type = "text/csv"
        elif original_fmt in ("xlsx", "xls"):
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        elif original_fmt == "json":
            media_type = "application/json"
        elif original_fmt == "parquet":
            media_type = "application/octet-stream"
            
        return FileResponse(
            path=dataset.file_path,
            media_type=media_type,
            filename=dataset.original_filename or os.path.basename(dataset.file_path),
        )

    # Conversion on demand using in-memory Polars streams
    from app.services.profiling_service import _load_dataframe
    from pathlib import Path
    import io

    df = _load_dataframe(dataset.file_path, dataset.file_type)
    buf = io.BytesIO()
    if requested_fmt == "csv":
        df.write_csv(buf)
        media_type = "text/csv"
    elif requested_fmt == "json":
        df.write_json(buf)
        media_type = "application/json"
    elif requested_fmt == "parquet":
        df.write_parquet(buf)
        media_type = "application/octet-stream"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported export format '{format}'. Allowed: csv, json, parquet",
        )

    buf.seek(0)
    base_name = Path(dataset.original_filename or dataset.name).stem
    return Response(
        content=buf.getvalue(),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{base_name}_cleaned.{requested_fmt}"'},
    )

