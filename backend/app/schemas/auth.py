"""
Authentication & user Pydantic schemas.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Request schemas ───────────────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    """Payload for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)


class LoginRequest(BaseModel):
    """Payload for email/password login."""

    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    """Payload for Google OAuth login (ID token credential)."""

    token: str


class ForgotPasswordRequest(BaseModel):
    """Payload to request a password-reset email."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Payload to reset a password using a reset token."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class RefreshTokenRequest(BaseModel):
    """Payload containing a refresh token."""

    refresh_token: str


# ── Response schemas ──────────────────────────────────────────────────────────


class UserResponse(BaseModel):
    """Public user profile data."""

    id: int
    email: str
    full_name: str
    avatar_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token pair returned after successful authentication."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str

