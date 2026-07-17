"""
Dataset ORM model.
"""

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Dataset(Base):
    """An uploaded data file belonging to a user."""

    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    file_path: Mapped[str] = mapped_column(String(2048), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    row_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    column_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="uploaded", nullable=False
    )
    health_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    profile_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(back_populates="datasets")  # noqa: F821
    analyses: Mapped[list["Analysis"]] = relationship(  # noqa: F821
        back_populates="dataset", cascade="all, delete-orphan", lazy="selectin"
    )

    @property
    def slug(self) -> str:
        from app.core.slug import encode_id
        return encode_id(self.id)

    def __repr__(self) -> str:
        return f"<Dataset id={self.id} name={self.name!r}>"
