from __future__ import annotations

from app.db.config import database_url_configured
from app.deps import get_quote_store
from app.storage.json_store import JsonQuoteStore
from app.storage.postgres_store import PostgresQuoteStore


def test_missing_database_url_uses_json_store(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert database_url_configured() is False
    assert isinstance(get_quote_store(), JsonQuoteStore)


def test_configured_database_url_uses_postgres_store(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://postgres:PASSWORD@localhost:5432/airfare_index")
    assert database_url_configured() is True
    assert isinstance(get_quote_store(), PostgresQuoteStore)
