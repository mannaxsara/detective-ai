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
