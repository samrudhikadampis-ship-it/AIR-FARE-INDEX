from fastapi import APIRouter, Depends, Query

from app.deps import get_quote_store
from app.models.quote import Quote, QuoteListResponse
from app.services.aggregations import paginate
from app.services.quotes import load_quotes
from app.storage.base import QuoteStore

router = APIRouter()

MAX_PAGE_SIZE = 100


def _filter_quotes(
    quotes: list[Quote],
    origin: str | None,
    destination: str | None,
    q: str | None,
) -> list[Quote]:
    rows = quotes
    if origin and origin.strip():
        code = origin.strip().upper()
        rows = [item for item in rows if item.source.upper() == code]
    if destination and destination.strip():
        code = destination.strip().upper()
        rows = [item for item in rows if item.destination.upper() == code]
    if q and q.strip():
        needle = q.strip().lower()
        rows = [
            item
            for item in rows
            if needle
            in " ".join(
                [
                    item.id,
                    item.source,
                    item.destination,
                    item.departure_time,
                    item.arrival_time,
                    item.price,
                    item.airline or "",
                ]
            ).lower()
        ]
    return rows


@router.get("/quotes", response_model=QuoteListResponse)
def list_quotes(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=MAX_PAGE_SIZE),
    origin: str | None = Query(None),
    destination: str | None = Query(None),
    q: str | None = Query(None),
    store: QuoteStore = Depends(get_quote_store),
) -> QuoteListResponse:
    quotes = _filter_quotes(load_quotes(store), origin, destination, q)
    return QuoteListResponse(
        items=paginate(quotes, page, page_size),
        page=page,
        page_size=page_size,
        total=len(quotes),
    )
