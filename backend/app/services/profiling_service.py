"""
Data-profiling service using Polars.

Computes column-level statistics, data-quality metrics, and an overall
health score for an uploaded dataset.
"""

from __future__ import annotations

import math
from pathlib import Path
from typing import Any

import polars as pl

from app.schemas.dataset import ColumnProfile, DatasetProfileResponse


# ── File loading helpers ──────────────────────────────────────────────────────


def _load_dataframe(file_path: str, file_type: str) -> pl.DataFrame:
    """Load a file into a Polars DataFrame."""
    p = Path(file_path)
    if file_type == "csv":
        return pl.read_csv(p, infer_schema_length=10_000, try_parse_dates=True)
    if file_type in ("xlsx", "xls"):
        return pl.read_excel(p)
    if file_type == "json":
        return pl.read_json(p)
    if file_type == "parquet":
        return pl.read_parquet(p)
    raise ValueError(f"Unsupported file type: {file_type}")


def _classify_dtype(dtype: pl.DataType) -> str:
    """Map a Polars dtype to a human-readable classification."""
    if dtype.is_numeric():
        return "numeric"
    if dtype.is_temporal():
        return "datetime"
    if dtype == pl.Boolean:
        return "boolean"
    return "categorical"


def _safe_float(value: Any) -> float | None:
    """Convert a value to float, returning None for non-finite or missing."""
    if value is None:
        return None
    try:
        f = float(value)
        return f if math.isfinite(f) else None
    except (TypeError, ValueError):
        return None


def _safe_value(value: Any) -> Any:
    """Make a value JSON-serialisable."""
    if value is None:
        return None
    if isinstance(value, float) and not math.isfinite(value):
        return None
    return value


# ── Column profiling ─────────────────────────────────────────────────────────


def _profile_column(df: pl.DataFrame, col: str) -> ColumnProfile:
    """Compute statistics for a single column."""
    series = df[col]
    dtype = series.dtype
    classification = _classify_dtype(dtype)
    total = len(series)
    null_count = series.null_count()
    null_pct = round((null_count / total) * 100, 2) if total > 0 else 0.0
    unique_count = series.n_unique()

    col_min: Any = None
    col_max: Any = None
    col_mean: float | None = None
    col_std: float | None = None
    col_median: float | None = None
    col_mode: Any = None
    top_values: list[dict[str, Any]] | None = None

    if classification == "numeric":
        non_null = series.drop_nulls()
        if len(non_null) > 0:
            col_min = _safe_value(non_null.min())
            col_max = _safe_value(non_null.max())
            col_mean = _safe_float(non_null.mean())
            col_std = _safe_float(non_null.std())
            col_median = _safe_float(non_null.median())
            mode_result = non_null.mode()
            col_mode = _safe_value(mode_result[0]) if len(mode_result) > 0 else None
    elif classification == "datetime":
        non_null = series.drop_nulls()
        if len(non_null) > 0:
            col_min = str(non_null.min())
            col_max = str(non_null.max())
    else:
        # Categorical / text
        non_null = series.drop_nulls().cast(pl.Utf8)
        if len(non_null) > 0:
            vc = non_null.value_counts().sort("count", descending=True).head(10)
            top_values = [
                {"value": str(row[col]), "count": int(row["count"])}
                for row in vc.iter_rows(named=True)
            ]
            mode_result = non_null.mode()
            col_mode = str(mode_result[0]) if len(mode_result) > 0 else None

    return ColumnProfile(
        name=col,
        dtype=str(dtype),
        classification=classification,
        unique_count=unique_count,
        null_count=null_count,
        null_percentage=null_pct,
        min=col_min,
        max=col_max,
        mean=col_mean,
        std=col_std,
        median=col_median,
        mode=col_mode,
        top_values=top_values,
    )


# ── Health score ──────────────────────────────────────────────────────────────


def _compute_health_score(
    df: pl.DataFrame, column_profiles: list[ColumnProfile]
) -> float:
    """Weighted composite health score from 0–100.

    Weights:
        Completeness  (% non-null)           0.30
        Uniqueness    (no excessive dupes)    0.20
        Type consistency                      0.20
        Value validity                        0.15
        Schema quality                        0.15
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    if total_rows == 0 or total_cols == 0:
        return 0.0

    # 1. Completeness – average non-null percentage across columns
    completeness_scores = [
        (1 - cp.null_count / total_rows) * 100 for cp in column_profiles
    ]
    completeness = sum(completeness_scores) / len(completeness_scores)

    # 2. Uniqueness – penalise if >50 % of rows are exact duplicates
    dup_count = total_rows - df.unique().height
    dup_ratio = dup_count / total_rows
    uniqueness = max(0.0, (1 - dup_ratio * 2)) * 100  # 50 % dupes → 0

    # 3. Type consistency – % of columns whose detected type is consistent
    consistent = 0
    for cp in column_profiles:
        if cp.classification != "categorical":
            consistent += 1
        else:
            # If a "categorical" column has many unique values relative to rows
            # it might actually be an ID or text field → still okay
            consistent += 1
    type_consistency = (consistent / total_cols) * 100

    # 4. Value validity – penalise columns with >20 % nulls
    valid_cols = sum(1 for cp in column_profiles if cp.null_percentage <= 20)
    value_validity = (valid_cols / total_cols) * 100

    # 5. Schema quality – penalise constant columns and fully-null columns
    good_cols = sum(
        1
        for cp in column_profiles
        if cp.unique_count > 1 and cp.null_percentage < 100
    )
    schema_quality = (good_cols / total_cols) * 100

    score = (
        completeness * 0.30
        + uniqueness * 0.20
        + type_consistency * 0.20
        + value_validity * 0.15
        + schema_quality * 0.15
    )
    return round(min(max(score, 0), 100), 1)


# ── Public API ────────────────────────────────────────────────────────────────


async def profile_dataset(
    file_path: str, file_type: str
) -> DatasetProfileResponse:
    """Run a full profile on the dataset at *file_path*.

    This is intentionally CPU-bound; for very large files consider
    running inside ``asyncio.to_thread``.
    """
    df = _load_dataframe(file_path, file_type)
    total_rows = df.height
    total_cols = df.width

    column_profiles = [_profile_column(df, col) for col in df.columns]

    # Duplicate rows
    dup_count = total_rows - df.unique().height

    # Constant columns
    constant_cols = [cp.name for cp in column_profiles if cp.unique_count <= 1]

    # Memory usage (estimate)
    memory_bytes = df.estimated_size("b")

    # Data-type summary
    type_summary: dict[str, int] = {}
    for cp in column_profiles:
        type_summary[cp.classification] = type_summary.get(cp.classification, 0) + 1

    health = _compute_health_score(df, column_profiles)

    return DatasetProfileResponse(
        row_count=total_rows,
        column_count=total_cols,
        memory_usage_bytes=memory_bytes,
        duplicate_row_count=dup_count,
        constant_columns=constant_cols,
        columns=column_profiles,
        health_score=health,
        data_types_summary=type_summary,
    )
