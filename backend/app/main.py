"""
FastAPI entry point for DetectiveAI backend.
Configures CORS, handles global exceptions, and hooks database lifecycles.
"""

from __future__ import annotations

import os
# Safely adapt to local hardware: limit Polars thread pool to half CPU cores so user's PC stays responsive
os.environ.setdefault("POLARS_MAX_THREADS", str(max(1, (os.cpu_count() or 4) // 2)))

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
_raw_origins = settings.CORS_ORIGINS
origins: list[str] = []
if isinstance(_raw_origins, str):
    import json
    try:
        parsed = json.loads(_raw_origins)
        if isinstance(parsed, list):
            origins = [str(o).strip() for o in parsed]
        else:
            origins = [str(parsed).strip()]
    except (json.JSONDecodeError, ValueError):
        origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
elif isinstance(_raw_origins, list):
    origins = [str(o).strip() for o in _raw_origins]

# Always ensure these are included
default_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "https://projectdetective.vercel.app"]
for o in default_origins:
    if o not in origins:
        origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Enforce standard HTTP security headers on all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

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

    # Pre-warm Google & Firebase JWK keys in background to eliminate first sign-in latency
    import asyncio
    from app.services.auth_service import prewarm_jwk_clients
    asyncio.create_task(asyncio.to_thread(prewarm_jwk_clients))

@app.api_route("/", methods=["GET", "HEAD"])
async def root_path():
    """Root endpoint for Render health checks (HEAD /)."""
    return {"status": "ok", "app": "DetectiveAI Backend"}

@app.api_route("/health", methods=["GET", "HEAD"])
async def root_health_check():
    """Health endpoint for Render health checks."""
    return {"status": "ok"}

@app.api_route("/api/health", methods=["GET", "HEAD"])
async def health_check():
    """Diagnostic API health endpoint verifying database, storage, and system settings."""
    import asyncio
    from app.services.auth_service import prewarm_jwk_clients
    asyncio.create_task(asyncio.to_thread(prewarm_jwk_clients))

    db_status = "ok"
    try:
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    from app.services.storage_service import is_storage_configured
    storage_backed = is_storage_configured()

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "app": "DetectiveAI Backend",
        "database": db_status,
        "storage": "supabase_cloud" if storage_backed else "local_disk",
        "polars_threads": os.environ.get("POLARS_MAX_THREADS", "auto"),
        "cors_origins": origins,
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected errors globally without leaking internal credentials."""
    import traceback
    traceback.print_exc()
    is_dev = os.getenv("ENVIRONMENT", "development") == "development"
    detail = f"An internal server error occurred: {str(exc)}" if is_dev else "An internal server error occurred. Please retry shortly."
    return JSONResponse(
        status_code=500,
        content={"detail": detail},
    )
