"""
Sequential Case ID slug formatting logic.
Encodes integer database IDs into clean sequential identifiers ("case_1", "case_2", "case_3").
"""

from __future__ import annotations

import hashlib
import hmac


def encode_id(db_id: int) -> str:
    """Encodes an integer database ID into a clean sequential case identifier (e.g. 'case_1')."""
    return f"case_{db_id}"


def decode_id(slug: str | int) -> int | None:
    """Decodes a sequential case identifier (e.g. 'case_1' or '1') back to an integer database ID."""
    if slug is None:
        return None
    s = str(slug).strip()
    if s.startswith("case_"):
        s = s[5:]
    try:
        return int(s)
    except (ValueError, TypeError):
        return None


def encode_share_token(db_id: int) -> str:
    """Encodes an integer database ID into an unguessable signed share token."""
    from app.core.config import settings
    secret = (getattr(settings, "SECRET_KEY", "") or "default-secret").encode()
    sig = hmac.new(secret, f"share:{db_id}".encode(), hashlib.sha256).hexdigest()[:12]
    return f"case_{db_id}_{sig}"


def decode_share_token(token: str | int) -> int | None:
    """Decodes and cryptographically verifies an unguessable share token. Prevents IDOR enumeration."""
    if token is None:
        return None
    s = str(token).strip()
    if not s.startswith("case_"):
        return None
    parts = s.split("_")
    if len(parts) != 3:
        return None
    try:
        db_id = int(parts[1])
    except (ValueError, TypeError):
        return None
    from app.core.config import settings
    secret = (getattr(settings, "SECRET_KEY", "") or "default-secret").encode()
    expected_sig = hmac.new(secret, f"share:{db_id}".encode(), hashlib.sha256).hexdigest()[:12]
    if hmac.compare_digest(parts[2], expected_sig):
        return db_id
    return None
