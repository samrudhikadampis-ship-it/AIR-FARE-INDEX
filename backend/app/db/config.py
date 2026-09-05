from __future__ import annotations

import os

DEFAULT_DATABASE_URL = "postgresql+psycopg://postgres:PASSWORD@localhost:5432/airfare_index"


def database_url_configured() -> bool:
    return bool(os.environ.get("DATABASE_URL", "").strip())


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL).strip()
    if url.startswith("postgresql://") and "+psycopg" not in url and "+psycopg2" not in url:
        url = "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url
