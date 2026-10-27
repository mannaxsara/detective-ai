"""
Async SQLAlchemy engine, session factory, and declarative base.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

import re

is_sqlite = "sqlite" in settings.DATABASE_URL
engine_kwargs = {}
db_url = settings.DATABASE_URL
connect_args: dict[str, object] = {}

if not is_sqlite:
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 5,
        "pool_pre_ping": True,
        "pool_recycle": 300,
    })
    if "asyncpg" in db_url or "supabase" in db_url:
        connect_args["prepared_statement_cache_size"] = 0
    if "sslmode=" in db_url:
        db_url = re.sub(r"[?&]sslmode=[^&]+", "", db_url)
        connect_args["ssl"] = "require"
    if connect_args:
        engine_kwargs["connect_args"] = connect_args

engine = create_async_engine(
    db_url,
    echo=False,
    **engine_kwargs
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session.

    The session is automatically closed when the request finishes.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
