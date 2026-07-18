"""
Datasets API routes.
Handles uploading, listing, profiling, and previewing datasets.
"""

from __future__ import annotations

import os
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
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
) -> DatasetResponse:
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
    
    # Run or return profiling information
    try:
        profile = await profile_dataset(dataset.file_path, dataset.file_type)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profiling failed: {str(e)}")

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
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

    from app.services.profiling_service import _load_dataframe
    try:
        df = _load_dataframe(dataset.file_path, dataset.file_type)
        preview_df = df.head(100)
        
        # Convert df to lists
        columns = preview_df.columns
        rows = [row for row in preview_df.to_dicts()]
        
        return DatasetPreviewResponse(
            columns=columns,
            rows=rows,
            total_rows=df.height,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load preview: {str(e)}")

@router.get("/{dataset_id}/download")
async def download_dataset_file(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    from app.core.slug import decode_id
    resolved_id = decode_id(dataset_id)
    if resolved_id is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    repo = DatasetRepository(db)
    dataset = await repo.get_by_id(resolved_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    if not os.path.exists(dataset.file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found on disk")
        
    # Get media type based on file type
    media_type = "application/octet-stream"
    if dataset.file_type == "csv":
        media_type = "text/csv"
    elif dataset.file_type in ("xlsx", "xls"):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif dataset.file_type == "json":
        media_type = "application/json"
    elif dataset.file_type == "parquet":
        media_type = "application/octet-stream"
        
    return FileResponse(
        path=dataset.file_path,
        media_type=media_type,
        filename=os.path.basename(dataset.file_path),
    )

