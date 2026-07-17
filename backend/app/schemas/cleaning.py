"""
Data-cleaning Pydantic schemas.
"""

from pydantic import BaseModel


class CleaningSuggestion(BaseModel):
    """A single data-quality issue with a suggested fix."""

    issue_type: str
    severity: str  # critical | warning | info
    column: str | None = None
    description: str
    affected_count: int
    affected_percentage: float
    suggested_fix: str
    fix_id: str


class CleaningResponse(BaseModel):
    """Collection of cleaning suggestions for a dataset."""

    suggestions: list[CleaningSuggestion]
    total_issues: int


class CleaningApplyRequest(BaseModel):
    """Request to apply specific fixes by their IDs."""

    fix_ids: list[str]


class CleaningApplyResponse(BaseModel):
    """Result after applying cleaning fixes."""

    applied: list[str]
    skipped: list[str]
    new_row_count: int
    new_column_count: int
    message: str
