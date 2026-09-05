from fastapi import APIRouter, Depends, Query

from app.deps import get_quote_store
from app.models.quote import QuoteListResponse
from app.services.aggregations import paginate
from app.services.quotes import load_quotes
from app.storage.base import QuoteStore

router = APIRouter()

MAX_PAGE_SIZE = 100


@router.get("/quotes", response_model=QuoteListResponse)
def list_quotes(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=MAX_PAGE_SIZE),
    store: QuoteStore = Depends(get_quote_store),
) -> QuoteListResponse:
    quotes = load_quotes(store)
    return QuoteListResponse(
        items=paginate(quotes, page, page_size),
        page=page,
        page_size=page_size,
        total=len(quotes),
    )
