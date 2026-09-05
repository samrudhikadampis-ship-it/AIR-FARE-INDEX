from pydantic import BaseModel, ConfigDict, Field

from app.models.quote import Quote


class RouteSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    id: str
    from_: str = Field(alias="from")
    to: str
    fromCity: str | None = None
    toCity: str | None = None
    avgFare: int
    minFare: int
    maxFare: int
    quoteCount: int
    indexValue: float


class RouteListResponse(BaseModel):
    items: list[RouteSummary]
    total: int = Field(ge=0)


class RouteQuoteListResponse(BaseModel):
    route_id: str
    items: list[Quote]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total: int = Field(ge=0)


class TrendPoint(BaseModel):
    date: str
    index: float
    avg_fare: int
    quote_count: int = Field(ge=0)


class RouteTrendResponse(BaseModel):
    route_id: str
    items: list[TrendPoint]


class IndexSnapshot(BaseModel):
    index_value: float | None
    quote_count: int = Field(ge=0)
    as_of: str | None
    avg_fare: int | None
    baseline_fare: int
    method: str


class IndexTrendResponse(BaseModel):
    items: list[TrendPoint]


class BookingWindowBucket(BaseModel):
    window: str
    days: int
    avg_fare: int
    index_value: float
    quote_count: int = Field(ge=0)


class BookingWindowResponse(BaseModel):
    items: list[BookingWindowBucket]


class DayOfWeekBucket(BaseModel):
    day: str
    avg_fare: int
    index_value: float
    quote_count: int = Field(ge=0)


class DayOfWeekResponse(BaseModel):
    items: list[DayOfWeekBucket]


class HeatmapAirport(BaseModel):
    code: str
    city: str | None = None


class HeatmapSector(BaseModel):
    origin: str
    destination: str
    averageFare: int
    minFare: int
    maxFare: int
    quoteCount: int
    indexValue: float


class HeatmapResponse(BaseModel):
    airports: list[HeatmapAirport]
    sectors: list[HeatmapSector]


class CollectionSummary(BaseModel):
    quotes_total: int = Field(ge=0)
    routes: int = Field(ge=0)
    last_collected_at: str | None
    source: str
