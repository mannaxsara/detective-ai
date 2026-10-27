"""
FastAPI dependencies for authentication and authorization.
"""

import time
from collections import defaultdict
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=True)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Decode the JWT access token and return the corresponding user.

    Raises:
        HTTPException 401: If the token is invalid, expired, or the user is not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id_str: str | None = payload.get("sub")
        token_type: str | None = payload.get("type")
        if user_id_str is None or token_type != "access":
            raise credentials_exception
        user_id = int(user_id_str)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError):
        raise credentials_exception

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensure the authenticated user account is active.

    Raises:
        HTTPException 403: If the user account is deactivated.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    return current_user


# In-memory sliding window IP attempt tracking
_ip_request_history: dict[str, list[float]] = defaultdict(list)


def rate_limit_ip(max_requests: int = 10, window_seconds: int = 60):
    """Zero-dependency in-memory sliding-window IP rate limiter."""
    async def dependency(request: Request):
        forwarded = request.headers.get("x-forwarded-for")
        ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
        
        now = time.time()
        # Periodic pruning to prevent memory bloat on free tier instances
        if len(_ip_request_history) > 1000:
            for k in list(_ip_request_history.keys()):
                if not _ip_request_history[k] or (now - _ip_request_history[k][-1] > window_seconds):
                    _ip_request_history.pop(k, None)

        timestamps = _ip_request_history[ip]
        # Prune older entries outside current window
        _ip_request_history[ip] = [t for t in timestamps if now - t < window_seconds]
        
        if len(_ip_request_history[ip]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {max_requests} attempts per {window_seconds} seconds. Please wait before retrying.",
            )
        _ip_request_history[ip].append(now)
    return dependency

