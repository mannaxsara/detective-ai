"""
Analysis ORM model.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Analysis(Base):
    """Results from running an automated analysis on a dataset."""

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    dataset_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    analysis_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )
    results: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    insights: Mapped[list | None] = mapped_column(JSON, nullable=True)
    charts: Mapped[list | None] = mapped_column(JSON, nullable=True)
    kpis: Mapped[list | None] = mapped_column(JSON, nullable=True)
    statistics: Mapped[list | None] = mapped_column(JSON, nullable=True)
    anomalies: Mapped[list | None] = mapped_column(JSON, nullable=True)
    forecast: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    cleaning_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────────────────
    dataset: Mapped["Dataset"] = relationship(back_populates="analyses")  # noqa: F821
    user: Mapped["User"] = relationship(back_populates="analyses")  # noqa: F821
    reports: Mapped[list["Report"]] = relationship(  # noqa: F821
        back_populates="analysis", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Analysis id={self.id} type={self.analysis_type!r} status={self.status!r}>"
