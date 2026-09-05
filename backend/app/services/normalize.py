from __future__ import annotations

import hashlib
import re
from typing import Any

from pydantic import ValidationError

from app.models.quote import Quote

_DURATION_H = re.compile(r"(\d+)\s*h", re.IGNORECASE)
_DURATION_M = re.compile(r"(\d+)\s*m", re.IGNORECASE)
_PRICE_CHARS = re.compile(r"[^\d.]")


def parse_price_inr(price: Any) -> int | None:
    if isinstance(price, bool):
        return None
    if isinstance(price, (int, float)) and price >= 0:
        return int(price)
    text = _PRICE_CHARS.sub("", str(price or ""))
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def parse_duration_minutes(duration: Any) -> int:
    if isinstance(duration, bool):
        return 0
    if isinstance(duration, (int, float)) and duration >= 0:
        return int(duration)
    text = str(duration or "")
    hours = _DURATION_H.search(text)
    minutes = _DURATION_M.search(text)
    return (int(hours.group(1)) if hours else 0) * 60 + (int(minutes.group(1)) if minutes else 0)


def _stable_id(parts: list[str]) -> str:
    digest = hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()[:12]
    return f"Q-{digest}"


def _as_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def normalize_raw_quote(raw: dict[str, Any]) -> Quote | None:
    source = _as_text(raw.get("source"))
    destination = _as_text(raw.get("destination"))
    departure_time = _as_text(raw.get("departure_time"))
    price = _as_text(raw.get("price"))
    price_inr = parse_price_inr(raw.get("price"))

    if not source or not destination or not departure_time or not price or price_inr is None:
        return None

    duration = _as_text(raw.get("duration"))
    travel_date = _as_text(raw.get("date"))
    scraped_on = _as_text(raw.get("today") or raw.get("collected_at"))
    airline = _as_text(raw.get("airline") or raw.get("airline_name")) or None

    quote_id = _as_text(raw.get("id")) or _stable_id(
        [
            source,
            destination,
            travel_date,
            departure_time,
            _as_text(raw.get("arrival_time")),
            price,
            airline or "",
            _as_text(raw.get("plane_number")),
        ]
    )

    payload = {
        "id": quote_id,
        "departure_time": departure_time,
        "arrival_time": _as_text(raw.get("arrival_time")),
        "duration": duration,
        "duration_minutes": parse_duration_minutes(duration),
        "price": price,
        "price_inr": price_inr,
        "source": source,
        "destination": destination,
        "collected_at": scraped_on or None,
        "travel_date": travel_date or None,
        "airline": airline,
    }

    try:
        return Quote.model_validate(payload)
    except ValidationError:
        return None


def normalize_quotes(raw_rows: list[dict[str, Any]]) -> list[Quote]:
    quotes: list[Quote] = []
    seen: set[str] = set()
    for row in raw_rows:
        quote = normalize_raw_quote(row)
        if quote is None or quote.id in seen:
            continue
        seen.add(quote.id)
        quotes.append(quote)
    return quotes
