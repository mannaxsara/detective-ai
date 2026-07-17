"""
Analysis repository with dataset/user scoped queries and keyword search.
"""

from typing import Sequence

from sqlalchemy import func as sa_func
from sqlalchemy import or_, select

from app.models.analysis import Analysis
from app.models.dataset import Dataset
from app.repositories.base_repository import BaseRepository


class AnalysisRepository(BaseRepository[Analysis]):
    """Data-access layer for the ``analyses`` table."""

    model = Analysis

    async def get_by_id_or_dataset_id(self, identifier: int) -> Analysis | None:
        """Fetch an analysis by its own ID, or fallback to the latest analysis by dataset ID."""
        analysis = await self.get_by_id(identifier)
        if analysis is not None:
            return analysis
        
        analyses = await self.get_by_dataset_id(identifier)
        if analyses:
            return analyses[0]
        return None

    async def get_by_dataset_id(self, dataset_id: int) -> Sequence[Analysis]:
        """Return all analyses for a given dataset."""
        stmt = (
            select(Analysis)
            .where(Analysis.dataset_id == dataset_id)
            .order_by(Analysis.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_user_id(
        self, user_id: int, *, skip: int = 0, limit: int = 50
    ) -> Sequence[Analysis]:
        """Return analyses belonging to a user (paginated)."""
        stmt = (
            select(Analysis)
            .where(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count_by_user_id(self, user_id: int) -> int:
        """Count analyses belonging to a user."""
        stmt = (
            select(sa_func.count())
            .select_from(Analysis)
            .where(Analysis.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def search_by_user(
        self, user_id: int, query: str, *, skip: int = 0, limit: int = 50
    ) -> tuple[Sequence[Analysis], int]:
        """Search a user's analyses by keyword in analysis_type or associated dataset name."""
        pattern = f"%{query}%"
        base_filter = (
            (Analysis.user_id == user_id)
            & (
                or_(
                    Analysis.analysis_type.ilike(pattern),
                    Analysis.dataset_id.in_(
                        select(Dataset.id).where(
                            Dataset.name.ilike(pattern),
                            Dataset.user_id == user_id,
                        )
                    ),
                )
            )
        )
        count_stmt = select(sa_func.count()).select_from(Analysis).where(base_filter)
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        data_stmt = (
            select(Analysis)
            .where(base_filter)
            .order_by(Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        data_result = await self.session.execute(data_stmt)
        return data_result.scalars().all(), total
