"""
Data-cleaning service – detect quality issues and apply fixes.

Uses Polars for all data manipulation.  Each detected issue receives a unique
``fix_id`` so the frontend can cherry-pick which fixes to apply.
"""

from __future__ import annotations

import hashlib
import math
import os
import uuid
from pathlib import Path
from typing import Any

import polars as pl

from app.schemas.cleaning import CleaningApplyResponse, CleaningSuggestion

# Re-use loader from profiling
from app.services.profiling_service import _load_dataframe


# ── Helpers ───────────────────────────────────────────────────────────────────


def _fix_id(prefix: str, col: str = "") -> str:
    """Deterministic but unique fix identifier."""
    raw = f"{prefix}:{col}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def _pct(part: int, whole: int) -> float:
    return round((part / whole) * 100, 2) if whole > 0 else 0.0


# ── Detection functions ──────────────────────────────────────────────────────


def _detect_missing(df: pl.DataFrame) -> list[CleaningSuggestion]:
    suggestions: list[CleaningSuggestion] = []
    total = df.height
    for col in df.columns:
        nc = df[col].null_count()
        if nc > 0:
            pct = _pct(nc, total)
            dtype = df[col].dtype
            if dtype.is_numeric():
                fix = "Impute with median value"
            elif dtype.is_temporal():
                fix = "Fill with forward-fill or drop rows"
            else:
                fix = "Impute with mode (most frequent) or drop rows"
            suggestions.append(
                CleaningSuggestion(
                    issue_type="missing_values",
                    severity="warning" if pct < 20 else "critical",
                    column=col,
                    description=f"Column '{col}' has {pct}% missing values ({nc:,} rows).",
                    affected_count=nc,
                    affected_percentage=pct,
                    suggested_fix=fix,
                    fix_id=_fix_id("missing", col),
                )
            )
    return suggestions


def _detect_duplicates(df: pl.DataFrame) -> list[CleaningSuggestion]:
    dup_count = df.height - df.unique().height
    if dup_count <= 0:
        return []
    return [
        CleaningSuggestion(
            issue_type="duplicates",
            severity="warning" if dup_count < df.height * 0.1 else "critical",
            column=None,
            description=f"There are {dup_count:,} duplicate rows.",
            affected_count=dup_count,
            affected_percentage=_pct(dup_count, df.height),
            suggested_fix="Remove duplicate rows",
            fix_id=_fix_id("duplicates"),
        )
    ]


def _detect_outliers(df: pl.DataFrame) -> list[CleaningSuggestion]:
    suggestions: list[CleaningSuggestion] = []
    for col in df.columns:
        if not df[col].dtype.is_numeric():
            continue
        series = df[col].drop_nulls().cast(pl.Float64)
        if len(series) < 10:
            continue
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        if q1 is None or q3 is None:
            continue
        iqr = q3 - q1
        if iqr == 0:
            continue
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outlier_count = int(series.filter((series < lower) | (series > upper)).len())
        if outlier_count > 0:
            suggestions.append(
                CleaningSuggestion(
                    issue_type="outliers",
                    severity="info" if outlier_count < 10 else "warning",
                    column=col,
                    description=f"Column '{col}' contains {outlier_count} outliers (IQR method).",
                    affected_count=outlier_count,
                    affected_percentage=_pct(outlier_count, df.height),
                    suggested_fix=f"Cap values at [{lower:.2f}, {upper:.2f}] or remove outlier rows",
                    fix_id=_fix_id("outliers", col),
                )
            )
    return suggestions


def _detect_type_issues(df: pl.DataFrame) -> list[CleaningSuggestion]:
    suggestions: list[CleaningSuggestion] = []
    for col in df.columns:
        if df[col].dtype != pl.Utf8:
            continue
        non_null = df[col].drop_nulls()
        if len(non_null) == 0:
            continue
        sample = non_null.head(min(200, len(non_null)))

        # Check if string column looks like dates
        date_parse_count = 0
        for val in sample.to_list():
            v = str(val).strip()
            if any(sep in v for sep in ["-", "/", "."]) and any(c.isdigit() for c in v) and len(v) >= 8:
                date_parse_count += 1
        if date_parse_count > len(sample) * 0.7:
            suggestions.append(
                CleaningSuggestion(
                    issue_type="incorrect_type",
                    severity="info",
                    column=col,
                    description=f"Column '{col}' is stored as string but appears to contain dates.",
                    affected_count=len(non_null),
                    affected_percentage=_pct(len(non_null), df.height),
                    suggested_fix="Convert to datetime type",
                    fix_id=_fix_id("type_date", col),
                )
            )
            continue

        # Check if string column looks numeric
        numeric_count = 0
        for val in sample.to_list():
            v = str(val).strip().replace(",", "").replace("$", "").replace("€", "").replace("£", "")
            try:
                float(v)
                numeric_count += 1
            except ValueError:
                pass
        if numeric_count > len(sample) * 0.8:
            suggestions.append(
                CleaningSuggestion(
                    issue_type="incorrect_type",
                    severity="info",
                    column=col,
                    description=f"Column '{col}' is stored as string but appears to contain numeric values.",
                    affected_count=len(non_null),
                    affected_percentage=_pct(len(non_null), df.height),
                    suggested_fix="Convert to numeric type",
                    fix_id=_fix_id("type_numeric", col),
                )
            )
    return suggestions


def _detect_mixed_categories(df: pl.DataFrame) -> list[CleaningSuggestion]:
    suggestions: list[CleaningSuggestion] = []
    for col in df.columns:
        if df[col].dtype != pl.Utf8:
            continue
        non_null = df[col].drop_nulls()
        if len(non_null) == 0 or non_null.n_unique() > 200:
            continue
        unique_vals = non_null.unique().to_list()
        lowered = [str(v).strip().lower() for v in unique_vals]
        if len(set(lowered)) < len(unique_vals):
            diff = len(unique_vals) - len(set(lowered))
            suggestions.append(
                CleaningSuggestion(
                    issue_type="mixed_categories",
                    severity="info",
                    column=col,
                    description=f"Column '{col}' has mixed-case categories ({diff} case variants detected).",
                    affected_count=diff,
                    affected_percentage=_pct(diff, len(unique_vals)),
                    suggested_fix="Standardize to title case",
                    fix_id=_fix_id("mixed_case", col),
                )
            )
    return suggestions


def _detect_whitespace(df: pl.DataFrame) -> list[CleaningSuggestion]:
    suggestions: list[CleaningSuggestion] = []
    for col in df.columns:
        if df[col].dtype != pl.Utf8:
            continue
        non_null = df[col].drop_nulls()
        if len(non_null) == 0:
            continue
        trimmed = non_null.str.strip_chars()
        ws_count = int((non_null != trimmed).sum())
        if ws_count > 0:
            suggestions.append(
                CleaningSuggestion(
                    issue_type="whitespace",
                    severity="info",
                    column=col,
                    description=f"Column '{col}' has {ws_count:,} values with leading/trailing whitespace.",
                    affected_count=ws_count,
                    affected_percentage=_pct(ws_count, df.height),
                    suggested_fix="Trim leading and trailing whitespace",
                    fix_id=_fix_id("whitespace", col),
                )
            )
    return suggestions


def _detect_negative_quantities(df: pl.DataFrame) -> list[CleaningSuggestion]:
    suggestions: list[CleaningSuggestion] = []
    quantity_keywords = {"quantity", "qty", "count", "stock", "inventory", "units"}
    for col in df.columns:
        if not df[col].dtype.is_numeric():
            continue
        if not any(kw in col.lower() for kw in quantity_keywords):
            continue
        neg_count = int(df.filter(pl.col(col) < 0).height)
        if neg_count > 0:
            suggestions.append(
                CleaningSuggestion(
                    issue_type="negative_quantity",
                    severity="warning",
                    column=col,
                    description=f"Column '{col}' has {neg_count} negative values.",
                    affected_count=neg_count,
                    affected_percentage=_pct(neg_count, df.height),
                    suggested_fix="Take absolute value or remove rows with negative values",
                    fix_id=_fix_id("negative", col),
                )
            )
    return suggestions


def _detect_invalid_dates(df: pl.DataFrame) -> list[CleaningSuggestion]:
    suggestions: list[CleaningSuggestion] = []
    for col in df.columns:
        if df[col].dtype != pl.Utf8:
            continue
        non_null = df[col].drop_nulls()
        if len(non_null) == 0:
            continue
        # Only check columns that look date-like based on name
        date_keywords = {"date", "time", "day", "month", "year", "dt", "timestamp"}
        if not any(kw in col.lower() for kw in date_keywords):
            continue
        # Try parsing
        try:
            parsed = non_null.str.to_datetime(strict=False)
            unparsed = int(parsed.null_count()) - int(non_null.null_count())
            if unparsed > 0:
                suggestions.append(
                    CleaningSuggestion(
                        issue_type="invalid_dates",
                        severity="warning",
                        column=col,
                        description=f"Column '{col}' has {unparsed} unparseable date values.",
                        affected_count=unparsed,
                        affected_percentage=_pct(unparsed, df.height),
                        suggested_fix="Parse valid dates and remove unparseable rows",
                        fix_id=_fix_id("invalid_date", col),
                    )
                )
        except Exception:
            pass
    return suggestions


# ── Public API ────────────────────────────────────────────────────────────────


async def get_cleaning_suggestions(
    file_path: str, file_type: str
) -> list[CleaningSuggestion]:
    """Analyse the dataset and return all detected quality issues."""
    df = _load_dataframe(file_path, file_type)
    suggestions: list[CleaningSuggestion] = []
    suggestions.extend(_detect_missing(df))
    suggestions.extend(_detect_duplicates(df))
    suggestions.extend(_detect_outliers(df))
    suggestions.extend(_detect_type_issues(df))
    suggestions.extend(_detect_mixed_categories(df))
    suggestions.extend(_detect_whitespace(df))
    suggestions.extend(_detect_negative_quantities(df))
    suggestions.extend(_detect_invalid_dates(df))
    return suggestions


async def apply_fix(
    file_path: str, file_type: str, fix_id: str
) -> tuple[pl.DataFrame, str]:
    """Apply a single fix identified by *fix_id* to the dataset.

    Returns the cleaned DataFrame and a description of what was done.
    """
    df = _load_dataframe(file_path, file_type)
    suggestions = await get_cleaning_suggestions(file_path, file_type)
    suggestion = next((s for s in suggestions if s.fix_id == fix_id), None)
    if suggestion is None:
        return df, "Fix ID not found – no changes applied."

    col = suggestion.column
    action = ""

    if suggestion.issue_type == "missing_values" and col:
        if df[col].dtype.is_numeric():
            median_val = df[col].median()
            df = df.with_columns(pl.col(col).fill_null(median_val))
            action = f"Filled missing values in '{col}' with median ({median_val})"
        else:
            mode_vals = df[col].drop_nulls().mode()
            fill_val = mode_vals[0] if len(mode_vals) > 0 else ""
            df = df.with_columns(pl.col(col).fill_null(fill_val))
            action = f"Filled missing values in '{col}' with mode ({fill_val})"

    elif suggestion.issue_type == "duplicates":
        before = df.height
        df = df.unique()
        action = f"Removed {before - df.height} duplicate rows"

    elif suggestion.issue_type == "outliers" and col:
        series = df[col].drop_nulls().cast(pl.Float64)
        q1 = series.quantile(0.25) or 0
        q3 = series.quantile(0.75) or 0
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        df = df.with_columns(pl.col(col).clip(lower, upper))
        action = f"Capped outliers in '{col}' to [{lower:.2f}, {upper:.2f}]"

    elif suggestion.issue_type == "incorrect_type" and col:
        if "date" in suggestion.description.lower():
            try:
                df = df.with_columns(pl.col(col).str.to_datetime(strict=False))
                action = f"Converted '{col}' from string to datetime"
            except Exception:
                action = f"Failed to convert '{col}' to datetime"
        else:
            try:
                df = df.with_columns(
                    pl.col(col)
                    .str.replace_all(r"[$,€£]", "")
                    .cast(pl.Float64, strict=False)
                )
                action = f"Converted '{col}' from string to numeric"
            except Exception:
                action = f"Failed to convert '{col}' to numeric"

    elif suggestion.issue_type == "mixed_categories" and col:
        df = df.with_columns(pl.col(col).str.strip_chars().str.to_titlecase())
        action = f"Standardized '{col}' to title case"

    elif suggestion.issue_type == "whitespace" and col:
        df = df.with_columns(pl.col(col).str.strip_chars())
        action = f"Trimmed whitespace in '{col}'"

    elif suggestion.issue_type == "negative_quantity" and col:
        df = df.with_columns(pl.col(col).abs())
        action = f"Converted negative values in '{col}' to absolute values"

    elif suggestion.issue_type == "invalid_dates" and col:
        df = df.with_columns(pl.col(col).str.to_datetime(strict=False))
        df = df.filter(pl.col(col).is_not_null())
        action = f"Parsed valid dates in '{col}' and dropped unparseable rows"

    else:
        action = "No action taken for this fix type"

    return df, action


async def apply_fixes(
    file_path: str, file_type: str, fix_ids: list[str]
) -> CleaningApplyResponse:
    """Apply multiple fixes sequentially and save the cleaned file.

    The original file is overwritten with the cleaned data.
    """
    df = _load_dataframe(file_path, file_type)
    applied: list[str] = []
    skipped: list[str] = []

    for fid in fix_ids:
        try:
            df_new, action = await apply_fix(file_path, file_type, fid)
            if "not found" in action.lower() or "no action" in action.lower():
                skipped.append(fid)
            else:
                df = df_new
                applied.append(fid)
        except Exception:
            skipped.append(fid)

    # Save cleaned data back
    p = Path(file_path)
    if file_type == "csv":
        df.write_csv(p)
    elif file_type in ("xlsx", "xls"):
        df.write_excel(p)
    elif file_type == "json":
        df.write_json(p)
    elif file_type == "parquet":
        df.write_parquet(p)

    return CleaningApplyResponse(
        applied=applied,
        skipped=skipped,
        new_row_count=df.height,
        new_column_count=df.width,
        message=f"Applied {len(applied)} fix(es), skipped {len(skipped)}.",
    )


class CleaningService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def detect_issues(self, file_path: str, file_type: str) -> list[CleaningSuggestion]:
        from app.services.cleaning_service import get_cleaning_suggestions
        return await get_cleaning_suggestions(file_path, file_type)

    async def apply_fixes(self, file_path: str, file_type: str, fix_ids: list[str]) -> CleaningApplyResponse:
        return await apply_fixes(file_path, file_type, fix_ids)

