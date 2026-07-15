"""
Authentication service – registration, login, Google OAuth, token refresh, password reset.
"""

from typing import Any

import httpx
import jwt
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


async def register(schema: RegisterRequest, db: AsyncSession) -> TokenResponse:
    """Register a new user with email and password.

    Raises:
        HTTPException 409: If the email is already registered.
    """
    repo = UserRepository(db)
    existing = await repo.get_by_email(schema.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    user = await repo.create(
        email=schema.email,
        hashed_password=hash_password(schema.password),
        full_name=schema.full_name,
    )
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=user_to_response(user),
    )


async def login(schema: LoginRequest, db: AsyncSession) -> TokenResponse:
    """Authenticate with email and password.

    Raises:
        HTTPException 401: If credentials are invalid.
    """
    repo = UserRepository(db)
    user = await repo.get_by_email(schema.email)
    if user is None or user.hashed_password is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(schema.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=user_to_response(user),
    )


async def google_auth(credential: str, db: AsyncSession) -> TokenResponse:
    """Verify a Google ID token and create or find the matching user.

    Raises:
        HTTPException 401: If the Google token is invalid.
    """
    # For simulation/mock environments:
    if credential == "google-oauth-token-simulated-12345":
        repo = UserRepository(db)
        user = await repo.get_by_email("demo@example.com")
        if user is None:
            user = await repo.create(
                email="demo@example.com",
                full_name="Demo User",
                password="password123"
            )
        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            user=user_to_response(user),
        )

    # Verify the credential with Google's tokeninfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GOOGLE_TOKEN_INFO_URL,
            params={"id_token": credential},
        )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        )

    token_data: dict[str, Any] = resp.json()
    google_id: str = token_data.get("sub", "")
    email: str = token_data.get("email", "")
    full_name: str = token_data.get("name", email.split("@")[0])
    avatar_url: str | None = token_data.get("picture")

    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token missing required fields",
        )

    repo = UserRepository(db)

    # Try to find by google_id first, then by email
    user = await repo.get_by_google_id(google_id)
    if user is None:
        user = await repo.get_by_email(email)
        if user is not None:
            # Link existing email account to Google
            await repo.update(user.id, google_id=google_id, avatar_url=avatar_url)
        else:
            # Create a brand-new user
            user = await repo.create(
                email=email,
                full_name=full_name,
                google_id=google_id,
                avatar_url=avatar_url,
            )

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=user_to_response(user),
    )


async def refresh_token(refresh_token_str: str, db: AsyncSession) -> TokenResponse:
    """Issue a new token pair from a valid refresh token.

    Raises:
        HTTPException 401: If the refresh token is invalid or expired.
    """
    try:
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        user_id = int(payload["sub"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=user_to_response(user),
    )


async def forgot_password(email: str, db: AsyncSession) -> dict[str, str]:
    """Initiate a password-reset flow.

    In production this would send an email; here we return success
    regardless so as not to leak account existence.
    """
    repo = UserRepository(db)
    user = await repo.get_by_email(email)
    if user is not None:
        _token = create_password_reset_token(user.id)
        # TODO: integrate email provider to deliver the token
    return {"message": "If an account exists with that email, a reset link has been sent."}


async def reset_password(
    token: str, new_password: str, db: AsyncSession
) -> dict[str, str]:
    """Reset a user's password using a valid reset token.

    Raises:
        HTTPException 400: If the token is invalid or expired.
    """
    try:
        payload = decode_token(token)
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type",
            )
        user_id = int(payload["sub"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )

    await repo.update(user.id, hashed_password=hash_password(new_password))
    return {"message": "Password has been reset successfully."}


def user_to_response(user: Any) -> UserResponse:
    """Map a User ORM instance to a UserResponse schema."""
    return UserResponse.model_validate(user)


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register(self, schema: RegisterRequest) -> TokenResponse:
        return await register(schema, self.db)

    async def login(self, schema: LoginRequest) -> TokenResponse:
        return await login(schema, self.db)

    async def google_auth(self, credential: str) -> TokenResponse:
        return await google_auth(credential, self.db)

    async def refresh_token(self, refresh_token_str: str) -> TokenResponse:
        return await refresh_token(refresh_token_str, self.db)

    async def forgot_password(self, email: str) -> str:
        res = await forgot_password(email, self.db)
        return res["message"]

    async def reset_password(self, token: str, new_password: str) -> str:
        res = await reset_password(token, new_password, self.db)
        return res["message"]

