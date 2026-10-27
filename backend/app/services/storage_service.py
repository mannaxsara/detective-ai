"""
Storage service for DetectiveAI.
Provides local disk storage with optional seamless Supabase Storage backup/restore.
Zero additional dependencies: utilizes project's existing httpx client.
"""

from __future__ import annotations

import os
from pathlib import Path
import httpx

from app.core.config import settings


async def upload_file_backup(local_path: str, remote_filename: str, content_type: str = "application/octet-stream") -> str | None:
    """Upload a file to Supabase Storage if configured."""
    if not (settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY):
        return None

    bucket = settings.SUPABASE_STORAGE_BUCKET
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{remote_filename}"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            with open(local_path, "rb") as f:
                content = f.read()
            res = await client.post(url, content=content, headers=headers)
            if res.status_code in (200, 201):
                return f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket}/{remote_filename}"
    except Exception:
        pass
    return None


async def ensure_file_local(local_path: str, remote_filename: str) -> bool:
    """Ensure file exists locally on disk; if missing, restores from Supabase Storage."""
    if os.path.exists(local_path):
        return True

    if not (settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY):
        return False

    bucket = settings.SUPABASE_STORAGE_BUCKET
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{remote_filename}"
    headers = {"Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                p = Path(local_path)
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_bytes(res.content)
                return True
    except Exception:
        pass
    return False


async def ensure_dataset_file(dataset: object) -> bool:
    """Ensure dataset file exists locally; if missing, restores from Supabase Storage."""
    if not dataset or not getattr(dataset, "file_path", None):
        return False
    if os.path.exists(dataset.file_path):
        return True
    filename = f"{dataset.user_id}/{os.path.basename(dataset.file_path)}"
    return await ensure_file_local(dataset.file_path, filename)


async def delete_file_backup(remote_filename: str) -> bool:
    """Delete a backup file from Supabase Storage."""
    if not (settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY):
        return False

    bucket = settings.SUPABASE_STORAGE_BUCKET
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{remote_filename}"
    headers = {"Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.delete(url, headers=headers)
            return res.status_code in (200, 204)
    except Exception:
        pass
    return False

