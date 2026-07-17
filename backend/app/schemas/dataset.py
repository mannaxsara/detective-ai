"""
Dataset Pydantic schemas.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ColumnProfile(BaseModel):
    """Statistical profile for a single column."""

    name: str
    dtype: str
    classification: str  # numeric | categorical | datetime | boolean | text
    unique_count: int
    null_count: int
    null_percentage: float
    min: Any | None = None
    max: Any | None = None
    mean: float | None = None
    std: float | None = None
    median: float | None = None
    mode: Any | None = None
    top_values: list[dict[str, Any]] | None = None


class DatasetProfileResponse(BaseModel):
    """Comprehensive profiling result for a dataset."""

    row_count: int
    column_count: int
    memory_usage_bytes: int
    duplicate_row_count: int
    constant_columns: list[str]
    columns: list[ColumnProfile]
    health_score: float
    data_types_summary: dict[str, int]


class DatasetResponse(BaseModel):
    """Dataset metadata returned to the client."""

    id: int
    slug: str | None = None
    name: str
    original_filename: str
    file_type: str
    file_size: int
    row_count: int | None = None
    column_count: int | None = None
    status: str
    health_score: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DatasetListResponse(BaseModel):
    """Paginated list of datasets."""

    datasets: list[DatasetResponse]
    total: int


class DatasetPreviewResponse(BaseModel):
    """Preview of the first N rows as a list of row dicts."""

    columns: list[str]
    rows: list[dict[str, Any]]
    total_rows: int
