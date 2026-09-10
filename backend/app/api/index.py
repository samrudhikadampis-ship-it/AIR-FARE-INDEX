from fastapi import APIRouter, Depends

from app.deps import get_quotes
from app.models.aggregations import (
    BookingWindowResponse,
    DayOfWeekResponse,
    IndexSnapshot,
    IndexTrendResponse,
)
from app.models.quote import Quote
from app.services.aggregations import booking_windows, day_of_week, index_snapshot, trend_by_collected_at

router = APIRouter()


@router.get("/index/snapshot", response_model=IndexSnapshot)
def get_index_snapshot(quotes: list[Quote] = Depends(get_quotes)) -> IndexSnapshot:
    return index_snapshot(quotes)


@router.get("/index/trend", response_model=IndexTrendResponse)
def get_index_trend(quotes: list[Quote] = Depends(get_quotes)) -> IndexTrendResponse:
    return IndexTrendResponse(items=trend_by_collected_at(quotes))


@router.get("/index/booking-windows", response_model=BookingWindowResponse)
def get_booking_windows(quotes: list[Quote] = Depends(get_quotes)) -> BookingWindowResponse:
    return BookingWindowResponse(items=booking_windows(quotes))


@router.get("/index/day-of-week", response_model=DayOfWeekResponse)
def get_day_of_week(quotes: list[Quote] = Depends(get_quotes)) -> DayOfWeekResponse:
    return DayOfWeekResponse(items=day_of_week(quotes))
