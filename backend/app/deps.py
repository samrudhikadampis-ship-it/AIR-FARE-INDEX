from fastapi import Depends

from app.models.quote import Quote
from app.services.quotes import load_quotes
from app.storage.base import QuoteStore
from app.storage.json_store import JsonQuoteStore


def get_quote_store() -> QuoteStore:
    return JsonQuoteStore()


def get_quotes(store: QuoteStore = Depends(get_quote_store)) -> list[Quote]:
    return load_quotes(store)
