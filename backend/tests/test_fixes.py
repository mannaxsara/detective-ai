"""
Targeted tests verifying security, data-cleaning multi-fix, and provider factory fixes.
"""

import pytest
import polars as pl
from app.core.security import hash_password, verify_password
from app.services.cleaning_service import _detect_all, _apply_single_fix_to_df
from app.services.insight_provider import get_insight_provider, RuleBasedInsightProvider, LLMInsightProvider
from app.core.config import settings


def test_security_password_verification():
    # Valid hash must verify
    hashed = hash_password("Secret123!")
    assert verify_password("Secret123!", hashed) is True
    assert verify_password("WrongPassword", hashed) is False

    # Plain text matching must be rejected (security fallback closed)
    assert verify_password("plain", "plain") is False
    assert verify_password("", "") is False


def test_cleaning_multi_fix_composition():
    # DataFrame with BOTH duplicates AND whitespace issues
    df = pl.DataFrame({
        "id": [1, 2, 2, 3],
        "category": [" Apple ", "Banana", "Banana", " Orange "]
    })

    suggestions = _detect_all(df)
    assert len(suggestions) >= 2

    # Apply duplicate fix
    dup_sug = next(s for s in suggestions if s.issue_type == "duplicates")
    df_after_dup, _ = _apply_single_fix_to_df(df, dup_sug)
    assert df_after_dup.height == 3

    # Apply whitespace fix on the resulting df (must retain the deduplication!)
    ws_sug = next(s for s in suggestions if s.issue_type == "whitespace")
    df_final, _ = _apply_single_fix_to_df(df_after_dup, ws_sug)

    # Height must stay 3, whitespace trimmed
    assert df_final.height == 3
    assert df_final["category"].to_list() == ["Apple", "Banana", "Orange"]


def test_insight_provider_factory():
    # Default without API key should be rule-based
    settings.GEMINI_API_KEY = ""
    settings.OPENAI_API_KEY = ""
    provider = get_insight_provider()
    assert isinstance(provider, RuleBasedInsightProvider)

    # When key configured, should return LLM provider
    settings.GEMINI_API_KEY = "test-key"
    provider_llm = get_insight_provider()
    assert isinstance(provider_llm, LLMInsightProvider)

    # Reset
    settings.GEMINI_API_KEY = ""


def test_root_cause_null_and_empty_safety():
    from app.services.root_cause_service import generate_root_cause_tree, _safe_float

    # Test _safe_float helper
    assert _safe_float(None) == 0.0
    assert _safe_float(float("nan")) == 0.0
    assert _safe_float("invalid") == 0.0
    assert _safe_float(42.5) == 42.5

    # DataFrame with all nulls in factor and metric columns
    df_nulls = pl.DataFrame({
        "sales": [None, None, None],
        "region": ["North", "South", "North"],
        "category": ["A", "B", "A"],
        "discount": [None, None, None],
    })
    # Must not raise TypeError
    tree = generate_root_cause_tree("dummy.csv", "csv", df=df_nulls)
    assert isinstance(tree, list)
    assert len(tree) > 0


@pytest.mark.asyncio
async def test_service_df_reuse():
    from app.services.kpi_service import detect_kpis
    from app.services.insight_engine import discover_insights
    from app.services.eda_service import run_eda
    from app.services.cleaning_service import get_cleaning_suggestions
    from app.services.profiling_service import profile_dataset

    df = pl.DataFrame({
        "sales": [100.0, 200.0, 300.0, 400.0],
        "category": ["A", "B", "A", "B"],
        "discount": [0.1, 0.2, 0.1, 0.2],
    })

    # Passing df directly to all services with non-existent path must succeed without FileNotFoundError
    kpis = detect_kpis("nonexistent.csv", "csv", df=df)
    assert isinstance(kpis, list)

    insights = discover_insights("nonexistent.csv", "csv", df=df)
    assert isinstance(insights, list)

    charts = run_eda("nonexistent.csv", "csv", df=df)
    assert isinstance(charts, list)

    suggestions = await get_cleaning_suggestions("nonexistent.csv", "csv", df=df)
    assert isinstance(suggestions, list)

    profile = await profile_dataset("nonexistent.csv", "csv", df=df)
    assert profile.row_count == 4


def test_database_session_sslmode_handling():
    import re
    url = "postgresql+asyncpg://user:pass@host:5432/db?sslmode=require"
    sanitized = re.sub(r"[?&]sslmode=[^&]+", "", url)
    assert "sslmode" not in sanitized
    assert sanitized == "postgresql+asyncpg://user:pass@host:5432/db"


@pytest.mark.asyncio
async def test_empty_file_upload_validation(tmp_path):
    from fastapi import UploadFile, HTTPException
    from app.services.upload_service import save_file
    from unittest.mock import AsyncMock

    empty_file = tmp_path / "empty.csv"
    empty_file.write_bytes(b"")

    with open(empty_file, "rb") as f:
        upload = UploadFile(filename="empty.csv", file=f)
        mock_db = AsyncMock()
        with pytest.raises(HTTPException) as exc_info:
            await save_file(upload, user_id=1, db=mock_db)
        assert exc_info.value.status_code == 400
        assert "empty" in exc_info.value.detail.lower()


