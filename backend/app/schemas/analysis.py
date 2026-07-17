"""
Analysis-result Pydantic schemas.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ChartConfig(BaseModel):
    """ECharts-compatible chart configuration."""

    chart_type: str
    title: str
    description: str
    config: dict[str, Any]


class KPICard(BaseModel):
    """A key performance indicator card."""

    name: str
    value: Any
    formatted_value: str
    trend: str  # up | down | stable
    change_percentage: float | None = None
    previous_value: Any | None = None
    icon: str


class InsightItem(BaseModel):
    """A single discovered insight."""

    category: str
    description: str
    confidence_score: float
    priority: str  # high | medium | low
    supporting_data: dict[str, Any] | None = None


class StatisticalTest(BaseModel):
    """Result of a single statistical test."""

    test_name: str
    description: str
    statistic: float
    p_value: float
    interpretation: str
    significant: bool


class AnomalyItem(BaseModel):
    """A detected anomaly."""

    entity_type: str  # customer | transaction | product | date | row
    entity_id: str
    description: str
    severity: str  # critical | warning | info
    detection_method: str
    reason: str
    affected_columns: list[str] | None = None


class ForecastResult(BaseModel):
    """Time-series forecast output."""

    dates: list[str]
    values: list[float]
    lower_bound: list[float]
    upper_bound: list[float]
    metric_name: str
    periods: int
    components: dict[str, Any] | None = None


class AnalysisResponse(BaseModel):
    """Full analysis result envelope."""

    id: int
    slug: str | None = None
    dataset_id: int
    user_id: int
    analysis_type: str
    status: str
    results: dict[str, Any] | None = None
    insights: list[InsightItem] | None = None
    charts: list[ChartConfig] | None = None
    kpis: list[KPICard] | None = None
    statistics: list[StatisticalTest] | None = None
    anomalies: list[AnomalyItem] | None = None
    forecast: dict[str, Any] | None = None
    cleaning_suggestions: list[dict[str, Any]] | None = None
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class AnalysisListItem(BaseModel):
    """Lightweight analysis item for history lists."""

    id: int
    slug: str | None = None
    dataset_id: int
    dataset_name: str | None = None
    analysis_type: str
    status: str
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class AnalysisHistoryResponse(BaseModel):
    """Paginated analysis history."""

    analyses: list[AnalysisListItem]
    total: int


class AnalysisTriggerRequest(BaseModel):
    """Payload to trigger a new analysis."""

    dataset_id: str | int

