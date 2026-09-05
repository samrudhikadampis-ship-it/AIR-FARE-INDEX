from __future__ import annotations

import re
from datetime import time
from typing import Any

_FLIGHT_RE = re.compile(r"\b([A-Z0-9]{2})-?(\d{2,4})\b", re.IGNORECASE)
_STOPS_RE = re.compile(r"(\d+)\s*stop", re.IGNORECASE)

AIRLINE_NAMES_BY_IATA: dict[str, str] = {
    "6E": "IndiGo",
    "AI": "Air India",
    "IX": "Air India Express",
    "I5": "Air India Express",
    "QP": "Akasa Air",
    "SG": "SpiceJet",
    "UK": "Vistara",
    "G8": "Go First",
    "9I": "Alliance Air",
    "S5": "Star Air",
    "2T": "Fly91",
}

_NAME_TO_IATA: dict[str, str] = {
    "indigo": "6E",
    "air india express": "IX",
    "air india": "AI",
    "akasa air": "QP",
    "akasaair": "QP",
    "spicejet": "SG",
    "vistara": "UK",
    "go first": "G8",
    "goair": "G8",
    "alliance air": "9I",
    "star air": "S5",
    "fly91": "2T",
}


def parse_clock(value: Any) -> time | None:
    text = str(value or "").strip()
    if not text:
        return None
    parts = text.split(":")
    if len(parts) < 2:
        return None
    try:
        hour = int(parts[0])
        minute = int(parts[1])
        return time(hour, minute)
    except ValueError:
        return None


def parse_stops(value: Any) -> int:
    text = str(value or "").strip()
    if not text:
        return 0
    if re.search(r"non[\s-]?stop", text, re.IGNORECASE):
        return 0
    match = _STOPS_RE.search(text)
    if match:
        return int(match.group(1))
    return 0


def parse_flight_identity(plane_number: Any) -> tuple[str | None, str | None]:
    """Return (iata_code, numeric_flight_number) when the tail code is parseable."""
    text = str(plane_number or "").strip().upper()
    if not text:
        return None, None
    match = _FLIGHT_RE.search(text)
    if not match:
        return None, None
    return match.group(1).upper(), match.group(2)


def airline_iata_from_name(name: Any) -> str | None:
    text = str(name or "").strip().lower()
    if not text:
        return None
    if text in _NAME_TO_IATA:
        return _NAME_TO_IATA[text]
    for label, iata in _NAME_TO_IATA.items():
        if label in text:
            return iata
    return None


def canonical_airline_name(iata: str, raw_name: str | None = None) -> str:
    return AIRLINE_NAMES_BY_IATA.get(iata.upper()) or (raw_name or "").strip() or iata.upper()
