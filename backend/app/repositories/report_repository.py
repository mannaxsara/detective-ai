"""
Report repository with user and analysis scoped queries.
"""

from typing import Sequence

from sqlalchemy import select

from app.models.report import Report
from app.repositories.base_repository import BaseRepository


class ReportRepository(BaseRepository[Report]):
    """Data-access layer for the ``reports`` table."""

    model = Report

    async def get_by_user_id(
        self, user_id: int, *, skip: int = 0, limit: int = 50
    ) -> Sequence[Report]:
        """Return reports belonging to a user."""
        stmt = (
            select(Report)
            .where(Report.user_id == user_id)
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_analysis_id(self, analysis_id: int) -> Sequence[Report]:
        """Return reports generated from a specific analysis."""
        stmt = (
            select(Report)
            .where(Report.analysis_id == analysis_id)
            .order_by(Report.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
