from fastapi import Depends

from app.db.config import database_url_configured
from app.models.quote import Quote
from app.services.quotes import load_quotes
from app.storage.base import QuoteStore
from app.storage.json_store import JsonQuoteStore
from app.storage.postgres_store import PostgresQuoteStore


def get_quote_store() -> QuoteStore:
    if database_url_configured():
        return PostgresQuoteStore()
    return JsonQuoteStore()


def get_quotes(store: QuoteStore = Depends(get_quote_store)) -> list[Quote]:
    return load_quotes(store)
