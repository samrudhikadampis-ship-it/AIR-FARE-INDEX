from fastapi import APIRouter, Depends

from app.deps import get_quotes
from app.models.aggregations import CollectionSummary
from app.models.quote import Quote
from app.services.aggregations import collection_summary

router = APIRouter()


@router.get("/collection/summary", response_model=CollectionSummary)
def get_collection_summary(quotes: list[Quote] = Depends(get_quotes)) -> CollectionSummary:
    return collection_summary(quotes)
