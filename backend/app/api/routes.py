from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_quotes
from app.models.aggregations import RouteListResponse, RouteQuoteListResponse, RouteTrendResponse
from app.models.quote import Quote
from app.services.aggregations import (
    aggregate_routes,
    paginate,
    parse_route_id,
    quotes_for_route,
    trend_by_collected_at,
)

router = APIRouter()
MAX_PAGE_SIZE = 100


@router.get("/routes", response_model=RouteListResponse)
def list_routes(quotes: list[Quote] = Depends(get_quotes)) -> RouteListResponse:
    items = aggregate_routes(quotes)
    return RouteListResponse(items=items, total=len(items))


@router.get("/routes/{route_id}/quotes", response_model=RouteQuoteListResponse)
def list_route_quotes(
    route_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=MAX_PAGE_SIZE),
    quotes: list[Quote] = Depends(get_quotes),
) -> RouteQuoteListResponse:
    parsed = parse_route_id(route_id)
    if parsed is None:
        raise HTTPException(status_code=422, detail="route_id must be ORIGIN-DESTINATION IATA codes")
    origin, destination = parsed
    matched = quotes_for_route(quotes, origin, destination)
    if not matched:
        raise HTTPException(status_code=404, detail="Route not found")
    return RouteQuoteListResponse(
        route_id=f"{origin}-{destination}",
        items=paginate(matched, page, page_size),
        page=page,
        page_size=page_size,
        total=len(matched),
    )


@router.get("/routes/{route_id}/trend", response_model=RouteTrendResponse)
def list_route_trend(
    route_id: str,
    quotes: list[Quote] = Depends(get_quotes),
) -> RouteTrendResponse:
    parsed = parse_route_id(route_id)
    if parsed is None:
        raise HTTPException(status_code=422, detail="route_id must be ORIGIN-DESTINATION IATA codes")
    origin, destination = parsed
    matched = quotes_for_route(quotes, origin, destination)
    if not matched:
        raise HTTPException(status_code=404, detail="Route not found")
    return RouteTrendResponse(
        route_id=f"{origin}-{destination}",
        items=trend_by_collected_at(matched),
    )
