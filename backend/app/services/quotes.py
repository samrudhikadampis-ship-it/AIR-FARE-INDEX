from app.models.quote import Quote
from app.services.normalize import normalize_quotes
from app.storage.base import QuoteStore


def load_quotes(store: QuoteStore) -> list[Quote]:
    return normalize_quotes(store.load_raw())
