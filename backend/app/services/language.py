from __future__ import annotations

import re
from typing import Optional

LANGUAGE_CODE_PATTERN = re.compile(r"^[a-zA-Z]{2,3}(?:[-_][a-zA-Z]{2,4})?$")
LANGUAGE_ALIASES = {
    "english": "en-US",
    "english (us)": "en-US",
    "english us": "en-US",
    "english (uk)": "en-GB",
    "english uk": "en-GB",
    "british english": "en-GB",
    "spanish": "es-ES",
    "spanish (mexico)": "es-MX",
    "spanish mexico": "es-MX",
    "spanish (latin america)": "es-MX",
    "french": "fr-FR",
    "german": "de-DE",
    "italian": "it-IT",
    "portuguese": "pt-PT",
    "portuguese (brazil)": "pt-BR",
    "portuguese brazil": "pt-BR",
    "japanese": "ja-JP",
    "korean": "ko-KR",
    "chinese": "zh-CN",
    "chinese (mandarin)": "zh-CN",
    "hindi": "hi-IN",
    "dutch": "nl-NL",
    "swedish": "sv-SE",
    "norwegian": "nb-NO",
}
DEFAULT_LANGUAGE_CODE = "en-US"


def resolve_language_code(language: Optional[str], default: str = DEFAULT_LANGUAGE_CODE) -> str:
    """Return a normalized BCP-47 language code for voice services."""
    if not language:
        return default

    candidate = language.strip()
    if not candidate:
        return default

    normalized = candidate.replace("_", "-")
    if LANGUAGE_CODE_PATTERN.match(normalized):
        parts = normalized.split("-")
        if len(parts) == 1:
            return parts[0].lower()
        return f"{parts[0].lower()}-{parts[1].upper()}"

    lower_candidate = normalized.lower()
    if lower_candidate in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[lower_candidate]

    simplified = re.sub(r"\s*\([^)]*\)", "", lower_candidate).strip()
    if simplified in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[simplified]

    return default
