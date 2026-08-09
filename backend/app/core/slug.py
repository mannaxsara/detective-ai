"""
Sequential Case ID slug formatting logic.
Encodes integer database IDs into clean sequential identifiers ("case_1", "case_2", "case_3").
"""

from __future__ import annotations


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
