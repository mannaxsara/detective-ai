"""
FastAPI entry point for DetectiveAI backend.
Configures CORS, handles global exceptions, and hooks database lifecycles.
"""

from __future__ import annotations

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.core.config import settings
from app.database.session import engine, Base

app = FastAPI(
    title="DetectiveAI API",
    description="Autonomous Business Intelligence & Data Analyst Assistant",
    version="1.0.0",
)

# CORS configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    import json
    try:
        origins = json.loads(origins)
    except Exception:
        if "," in origins:
            origins = [o.strip() for o in origins.split(",")]
        else:
            origins = [origins]
if not origins:
    origins = ["http://localhost:3000", "https://projectdetective.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global router registration
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def on_startup() -> None:
    """Create database tables and folders on startup."""
    # Ensure upload directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "reports"), exist_ok=True)
    
    # In production, we'd use Alembic migrations, but for simple/local startup:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo user
    from app.database.session import async_session_factory
    from app.models.user import User
    from app.core.security import hash_password
    from sqlalchemy import select

    async with async_session_factory() as session:
        try:
            result = await session.execute(select(User).where(User.email == "demo@example.com"))
            user = result.scalar_one_or_none()
            if not user:
                demo_user = User(
                    email="demo@example.com",
                    hashed_password=hash_password("password123"),
                    full_name="Demo User",
                    is_active=True
                )
                session.add(demo_user)
                await session.commit()
                print("Demo user seeded successfully.")
            else:
                print("Demo user already exists.")
        except Exception as e:
            await session.rollback()
            print(f"Error seeding demo user: {e}")

@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Simple API health endpoint."""
    return {"status": "ok", "app": "DetectiveAI Backend"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected errors globally."""
    # Log the details (in production, log using a structured logger)
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"An internal server error occurred: {str(exc)}"},
    )
