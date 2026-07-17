"""
Dataset repository with user-scoped queries.
"""

from typing import Sequence

from sqlalchemy import func as sa_func
from sqlalchemy import select

from app.models.dataset import Dataset
from app.repositories.base_repository import BaseRepository


class DatasetRepository(BaseRepository[Dataset]):
    """Data-access layer for the ``datasets`` table."""

    model = Dataset

    async def get_by_user_id(
        self, user_id: int, *, skip: int = 0, limit: int = 100
    ) -> Sequence[Dataset]:
        """Return all datasets belonging to a user (paginated)."""
        stmt = (
            select(Dataset)
            .where(Dataset.user_id == user_id)
            .order_by(Dataset.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count_by_user_id(self, user_id: int) -> int:
        """Count datasets belonging to a user."""
        stmt = (
            select(sa_func.count())
            .select_from(Dataset)
            .where(Dataset.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def get_by_user_id_paginated(
        self, user_id: int, skip: int = 0, limit: int = 20
    ) -> tuple[Sequence[Dataset], int]:
        """Return a page of datasets and the total count."""
        datasets = await self.get_by_user_id(user_id, skip=skip, limit=limit)
        total = await self.count_by_user_id(user_id)
        return datasets, total
