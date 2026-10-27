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
    # 1. Default without API key should be rule-based
    settings.GEMINI_API_KEY = ""
    settings.OPENAI_API_KEY = ""
    settings.AI_BASE_URL = ""
    provider = get_insight_provider()
    assert isinstance(provider, RuleBasedInsightProvider)

    # 2. When Gemini key configured, should return LLM provider
    settings.GEMINI_API_KEY = "test-key"
    provider_llm = get_insight_provider()
    assert isinstance(provider_llm, LLMInsightProvider)
    assert provider_llm.provider == "gemini"

    # 3. Local Ollama provider should activate without API key
    provider_ollama = get_insight_provider(provider="ollama", model="llama3.2")
    assert isinstance(provider_ollama, LLMInsightProvider)
    assert provider_ollama.provider == "ollama"
    assert provider_ollama.model == "llama3.2"

    # 4. Custom OpenAI-compatible provider with base_url
    provider_custom = get_insight_provider(provider="custom", base_url="https://api.groq.com/openai/v1", api_key="test-key")
    assert isinstance(provider_custom, LLMInsightProvider)
    assert provider_custom.base_url == "https://api.groq.com/openai/v1"

    # 5. Key auto-detection tests
    p_gemini_auto = get_insight_provider(api_key="AIzaSyTestKey123")
    assert isinstance(p_gemini_auto, LLMInsightProvider)
    assert p_gemini_auto.provider == "gemini"

    p_groq_auto = get_insight_provider(api_key="gsk_TestGroqKey456")
    assert isinstance(p_groq_auto, LLMInsightProvider)
    assert p_groq_auto.provider == "custom"
    assert "groq.com" in p_groq_auto.base_url

    p_or_auto = get_insight_provider(api_key="sk-or-TestOpenRouter789")
    assert isinstance(p_or_auto, LLMInsightProvider)
    assert p_or_auto.provider == "custom"
    assert "openrouter.ai" in p_or_auto.base_url

    p_openai_auto = get_insight_provider(api_key="sk-proj-TestOpenAI000")
    assert isinstance(p_openai_auto, LLMInsightProvider)
    assert p_openai_auto.provider == "openai"

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


def test_anomaly_null_nan_safety():
    from app.services.anomaly_service import detect_anomalies
    import numpy as np

    # DataFrame with 20 rows, some with nulls, one huge outlier
    sales = [10.0] * 19 + [10000.0]
    sales[5] = None
    df = pl.DataFrame({
        "sales": sales,
        "quantity": [1, 2, None, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 100],
    })

    anomalies = detect_anomalies("dummy.csv", "csv", df=df)
    assert isinstance(anomalies, list)
    for a in anomalies:
        if a.confidence_score is not None:
            assert np.isfinite(a.confidence_score)
        if a.z_score is not None:
            assert np.isfinite(a.z_score)
        if a.value is not None:
            assert np.isfinite(a.value)


def test_kpi_null_nan_safety():
    from app.services.kpi_service import detect_kpis
    # DataFrame where revenue column has all None
    df = pl.DataFrame({
        "revenue": [None, None, None, None],
        "date": ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"],
    })
    kpis = detect_kpis("dummy.csv", "csv", df=df)
    assert isinstance(kpis, list)


@pytest.mark.asyncio
async def test_cleaning_safe_write_fallback(tmp_path):
    from app.services.cleaning_service import apply_fixes

    # Create dummy csv file
    test_file = tmp_path / "test_data.csv"
    df = pl.DataFrame({"a": [1, 1, 2], "b": ["x", "x", "y"]})
    df.write_csv(test_file)

    # Call apply_fixes with empty fix_ids to test safe write path
    res = await apply_fixes(str(test_file), "csv", [])
    assert res.new_row_count == 3
    assert test_file.exists()


def test_report_pdf_and_docx_none_statistics(tmp_path):
    from app.services.report_service import ReportService
    import os

    rs = ReportService()
    stats = [{"test_name": "Shapiro-Wilk", "statistic": None, "p_value": None, "significant": False}]
    
    # Test PDF generation with None statistics
    pdf_path = rs.generate_pdf(
        analysis_id=1001,
        dataset_name="TestDataset",
        kpis=[],
        insights=[],
        statistics=stats,
        summary="Test executive summary",
        recommendations=["Test recommendation"],
        dataset_info={"row_count": 100, "column_count": 5, "health_score": 95, "file_type": "csv"},
        anomalies=[],
    )
    assert os.path.exists(pdf_path)
    os.remove(pdf_path)

    # Test DOCX generation with None statistics
    docx_path = rs.generate_docx(
        analysis_id=1001,
        dataset_name="TestDataset",
        kpis=[],
        insights=[],
        statistics=stats,
        summary="Test executive summary",
        recommendations=["Test recommendation"],
        dataset_info={"row_count": 100, "column_count": 5, "health_score": 95, "file_type": "csv"},
        anomalies=[],
    )
    assert os.path.exists(docx_path)
    os.remove(docx_path)


def test_anomaly_dbscan_empty_noise():
    from app.services.anomaly_service import detect_anomalies
    # Clean uniform data with 25 rows (no noise in DBSCAN)
    df = pl.DataFrame({
        "x": [10.0] * 25,
        "y": [20.0] * 25,
    })
    anomalies = detect_anomalies("dummy.csv", "csv", df=df)
    assert isinstance(anomalies, list)


def test_csv_encoding_and_delimiter_resilience(tmp_path):
    from app.services.profiling_service import _load_dataframe

    # 1. Non-UTF8 Latin1 CSV with accents
    latin1_file = tmp_path / "latin1.csv"
    latin1_file.write_bytes("name,amount\nCafé,12.5\nNaïve,15.0\n".encode("latin1"))
    df_latin1 = _load_dataframe(str(latin1_file), "csv")
    assert df_latin1.height == 2
    assert df_latin1.width == 2

    # 2. Semicolon delimited CSV
    semi_file = tmp_path / "semi.csv"
    semi_file.write_text("id;region;sales\n1;North;500\n2;South;300\n", encoding="utf-8")
    df_semi = _load_dataframe(str(semi_file), "csv")
    assert df_semi.height == 2
    assert df_semi.width == 3
    assert "sales" in df_semi.columns

    # 3. Pipe-delimited CSV with BOM and untrimmed headers
    pipe_file = tmp_path / "pipe.csv"
    pipe_content = "\ufeff  user_id |  department  | budget \n101|Engineering|95000\n102|Marketing|62000\n"
    pipe_file.write_text(pipe_content, encoding="utf-8")
    df_pipe = _load_dataframe(str(pipe_file), "csv")
    assert df_pipe.height == 2
    assert df_pipe.width == 3
    assert df_pipe.columns == ["user_id", "department", "budget"]


def test_eda_empty_dataframe_guard():
    from app.services.eda_service import generate_charts
    empty_df = pl.DataFrame({"a": [], "b": []})
    charts = generate_charts("dummy.csv", "csv", df=empty_df)
    assert charts == []


@pytest.mark.asyncio
async def test_rate_limit_ip():
    from unittest.mock import Mock
    from fastapi import HTTPException
    from app.core.dependencies import rate_limit_ip

    limiter = rate_limit_ip(max_requests=2, window_seconds=10)
    mock_req = Mock()
    mock_req.headers = {"x-forwarded-for": "203.0.113.195"}
    mock_req.client = None

    # First two requests should pass
    await limiter(mock_req)
    await limiter(mock_req)

    # Third request must raise HTTP 429
    with pytest.raises(HTTPException) as exc_info:
        await limiter(mock_req)
    assert exc_info.value.status_code == 429









