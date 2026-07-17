"""
FastAPI Router configuration.
Registers all API sub-routers.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.datasets import router as datasets_router
from app.api.cleaning import router as cleaning_router
from app.api.analysis import router as analysis_router
from app.api.statistics import router as statistics_router
from app.api.forecast import router as forecast_router
from app.api.reports import router as reports_router
from app.api.history import router as history_router
from app.api.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(datasets_router)
api_router.include_router(cleaning_router)
api_router.include_router(analysis_router)
api_router.include_router(statistics_router)
api_router.include_router(forecast_router)
api_router.include_router(reports_router)
api_router.include_router(history_router)
api_router.include_router(dashboard_router)
