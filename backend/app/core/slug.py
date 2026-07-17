"""
Slug encryption and tokenization logic.
Obfuscates internal database integer IDs using a bitwise XOR and Base36 encoding.
"""

from __future__ import annotations

SECRET_SALT = 84729103

def encode_id(db_id: int) -> str:
    """XOR obfuscates and encodes an integer database ID into a Base36 slug."""
    obfuscated = db_id ^ SECRET_SALT
    # Base36 conversion
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    result = []
    val = obfuscated
    
    if val == 0:
        return "case_0"
        
    while val > 0:
        val, r = divmod(val, 36)
        result.append(chars[r])
        
    return "case_" + "".join(reversed(result))

def decode_id(slug: str) -> int | None:
    """Decodes a Base36 slug and resolves it back to the integer database ID."""
    if not slug:
        return None
        
    slug_str = str(slug)
    
    # Fallback to integer conversion if it's already a raw database ID
    if not slug_str.startswith("case_"):
        try:
            return int(slug_str)
        except ValueError:
            return None
            
    val_str = slug_str[5:]
    try:
        obfuscated = int(val_str, 36)
        return obfuscated ^ SECRET_SALT
    except Exception:
        return None
