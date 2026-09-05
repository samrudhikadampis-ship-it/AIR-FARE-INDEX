from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def default_json_path() -> Path:
    # backend/app/storage/json_store.py → backend/scraper/fast_flights_data.json
    backend_root = Path(__file__).resolve().parents[2]
    return backend_root / "scraper" / "fast_flights_data.json"


class JsonQuoteStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or default_json_path()

    def load_raw(self) -> list[dict[str, Any]]:
        if not self.path.is_file():
            return []

        with self.path.open(encoding="utf-8") as handle:
            payload = json.load(handle)

        if not isinstance(payload, list):
            raise ValueError("Quote store must contain a JSON array")

        return [row for row in payload if isinstance(row, dict)]
