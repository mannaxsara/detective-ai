"""
File upload service – validation, streaming to disk, dataset record creation.
"""

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.dataset import Dataset
from app.repositories.dataset_repository import DatasetRepository

ALLOWED_EXTENSIONS: set[str] = {"csv", "xlsx", "xls", "json", "parquet"}
CHUNK_SIZE: int = 1_048_576  # 1 MB


def _extension(filename: str) -> str:
    """Return the lower-cased file extension without the dot."""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


async def validate_file(file: UploadFile) -> str:
    """Validate the uploaded file type and size.

    Args:
        file: The FastAPI ``UploadFile`` object.

    Returns:
        The detected file extension.

    Raises:
        HTTPException 400: If the file type is unsupported or the file is too large.
    """
    filename = file.filename or ""
    ext = _extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '.{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Check Content-Length header first (fast path)
    if file.size is not None and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
        )

    return ext


async def save_file(
    file: UploadFile, user_id: int, db: AsyncSession
) -> Dataset:
    """Stream the uploaded file to disk and create a Dataset record.

    Args:
        file: The FastAPI ``UploadFile`` object (already validated).
        user_id: ID of the owning user.
        db: Async database session.

    Returns:
        The newly created ``Dataset`` ORM instance.
    """
    ext = await validate_file(file)
    original_filename = file.filename or f"upload.{ext}"

    # Build a unique on-disk path
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    user_dir = Path(settings.UPLOAD_DIR) / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    dest = user_dir / unique_name

    # Stream to disk in chunks, tracking total bytes
    total_bytes = 0
    with open(dest, "wb") as f:
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > settings.MAX_UPLOAD_SIZE:
                f.close()
                os.remove(dest)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
                )
            f.write(chunk)

    # Derive a human-readable dataset name
    dataset_name = Path(original_filename).stem.replace("_", " ").replace("-", " ").title()

    repo = DatasetRepository(db)
    dataset = await repo.create(
        user_id=user_id,
        name=dataset_name,
        original_filename=original_filename,
        file_path=str(dest),
        file_type=ext,
        file_size=total_bytes,
        status="uploaded",
    )
    return dataset


class UploadService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def save_file(self, file: UploadFile, user_id: int) -> Dataset:
        return await save_file(file, user_id, self.db)

