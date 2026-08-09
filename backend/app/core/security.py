"""
Security utilities: JWT token management and password hashing.
Uses hashlib PBKDF2 (standard library) with optional pwdlib/argon2 fallback.
"""

import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from app.core.config import settings

# ── Password hashing ─────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a plain-text password using SHA-256 PBKDF2."""
    salt = os.urandom(16)
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"pbkdf2_sha256$100000${salt.hex()}${pw_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a PBKDF2 or Argon2 hash."""
    if not hashed_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
            iterations = int(parts[1])
            salt = bytes.fromhex(parts[2])
            expected_hash = bytes.fromhex(parts[3])
            computed_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
            return hmac.compare_digest(computed_hash, expected_hash)
    except Exception:
        pass

    # Try pwdlib if installed
    try:
        from pwdlib import PasswordHash
        from pwdlib.hashers.argon2 import Argon2Hasher
        return PasswordHash((Argon2Hasher(),)).verify(plain_password, hashed_password)
    except Exception:
        pass

    return plain_password == hashed_password


# ── JWT tokens ────────────────────────────────────────────────────────────────


def create_access_token(user_id: int | str, extra_claims: dict[str, Any] | None = None) -> str:
    """Create a short-lived access token.

    Args:
        user_id: The subject (user) identifier.
        extra_claims: Optional additional claims to embed in the token.

    Returns:
        Encoded JWT string.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: int | str) -> str:
    """Create a long-lived refresh token.

    Args:
        user_id: The subject (user) identifier.

    Returns:
        Encoded JWT string.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": now,
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_password_reset_token(user_id: int | str) -> str:
    """Create a password-reset token valid for 1 hour."""
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "type": "password_reset",
        "iat": now,
        "exp": now + timedelta(hours=1),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token.

    Args:
        token: Encoded JWT string.

    Returns:
        Decoded payload dictionary.

    Raises:
        jwt.ExpiredSignatureError: If the token has expired.
        jwt.InvalidTokenError: If the token is invalid.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
