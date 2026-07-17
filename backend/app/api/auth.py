"""
Authentication API routes.
Supports registration, login, token refresh, and Google OAuth callback (simulation).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    auth_service = AuthService(db)
    return await auth_service.register(request)

@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    auth_service = AuthService(db)
    return await auth_service.login(request)

@router.post("/google", response_model=TokenResponse)
async def google_login(
    request: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    auth_service = AuthService(db)
    return await auth_service.google_auth(request.token)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    refresh_token: str,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    auth_service = AuthService(db)
    return await auth_service.refresh_token(refresh_token)

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    auth_service = AuthService(db)
    msg = await auth_service.forgot_password(request.email)
    return {"message": msg}

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    auth_service = AuthService(db)
    msg = await auth_service.reset_password(request.token, request.new_password)
    return {"message": msg}

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    return current_user
