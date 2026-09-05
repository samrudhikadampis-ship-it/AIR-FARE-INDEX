from __future__ import annotations

from collections import defaultdict
from datetime import date

from app.constants import (
    AIRPORT_CITIES,
    BOOKING_WINDOW_DAYS,
    INDEX_BASELINE_FARE,
    SCRAPER_SOURCE,
    WEEKDAY_NAMES,
)
from app.models.aggregations import (
    BookingWindowBucket,
    CollectionSummary,
    DayOfWeekBucket,
    HeatmapAirport,
    HeatmapResponse,
    HeatmapSector,
    IndexSnapshot,
    RouteSummary,
    TrendPoint,
)
from app.models.quote import Quote

INDEX_METHOD = "mean(price_inr) / 6000 * 100"


def parse_iso_date(value: str | None) -> date | None:
    if not value:
        return None
    text = value.strip()[:10]
    try:
        return date.fromisoformat(text)
    except ValueError:
        return None


def fare_index(avg_fare: float) -> float:
    return round((avg_fare / INDEX_BASELINE_FARE) * 100, 1)


def _mean_fare(quotes: list[Quote]) -> float | None:
    if not quotes:
        return None
    return sum(q.price_inr for q in quotes) / len(quotes)


def route_id_for(origin: str, destination: str) -> str:
    return f"{origin.strip().upper()}-{destination.strip().upper()}"


def parse_route_id(route_id: str) -> tuple[str, str] | None:
    parts = route_id.strip().upper().split("-")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        return None
    return parts[0], parts[1]


def quotes_for_route(quotes: list[Quote], origin: str, destination: str) -> list[Quote]:
    origin = origin.upper()
    destination = destination.upper()
    return [
        q
        for q in quotes
        if q.source.upper() == origin and q.destination.upper() == destination
    ]


def _route_summary(origin: str, destination: str, rows: list[Quote]) -> RouteSummary | None:
    avg = _mean_fare(rows)
    if avg is None:
        return None
    prices = [q.price_inr for q in rows]
    payload = {
        "id": route_id_for(origin, destination),
        "from": origin,
        "to": destination,
        "avgFare": round(avg),
        "minFare": min(prices),
        "maxFare": max(prices),
        "quoteCount": len(rows),
        "indexValue": fare_index(avg),
    }
    from_city = AIRPORT_CITIES.get(origin)
    to_city = AIRPORT_CITIES.get(destination)
    if from_city:
        payload["fromCity"] = from_city
    if to_city:
        payload["toCity"] = to_city
    return RouteSummary.model_validate(payload)


def aggregate_routes(quotes: list[Quote]) -> list[RouteSummary]:
    groups: dict[tuple[str, str], list[Quote]] = defaultdict(list)
    for quote in quotes:
        origin = quote.source.strip().upper()
        dest = quote.destination.strip().upper()
        if not origin or not dest:
            continue
        groups[(origin, dest)].append(quote)

    routes: list[RouteSummary] = []
    for (origin, dest), rows in groups.items():
        summary = _route_summary(origin, dest, rows)
        if summary is not None:
            routes.append(summary)
    routes.sort(key=lambda row: (row.from_, row.to))
    return routes


def trend_by_collected_at(quotes: list[Quote]) -> list[TrendPoint]:
    groups: dict[str, list[Quote]] = defaultdict(list)
    for quote in quotes:
        collected = parse_iso_date(quote.collected_at)
        if collected is None:
            continue
        groups[collected.isoformat()].append(quote)

    points: list[TrendPoint] = []
    for day in sorted(groups):
        avg = _mean_fare(groups[day])
        if avg is None:
            continue
        points.append(
            TrendPoint(
                date=day,
                index=fare_index(avg),
                avg_fare=round(avg),
                quote_count=len(groups[day]),
            )
        )
    return points


def index_snapshot(quotes: list[Quote]) -> IndexSnapshot:
    avg = _mean_fare(quotes)
    as_of_dates = [parse_iso_date(q.collected_at) for q in quotes]
    dated = [d for d in as_of_dates if d is not None]
    as_of = max(dated).isoformat() if dated else None
    return IndexSnapshot(
        index_value=None if avg is None else fare_index(avg),
        quote_count=len(quotes),
        as_of=as_of,
        avg_fare=None if avg is None else round(avg),
        baseline_fare=INDEX_BASELINE_FARE,
        method=INDEX_METHOD,
    )


def booking_windows(quotes: list[Quote]) -> list[BookingWindowBucket]:
    buckets: dict[int, list[Quote]] = {days: [] for days in BOOKING_WINDOW_DAYS}
    for quote in quotes:
        travel = parse_iso_date(quote.travel_date)
        collected = parse_iso_date(quote.collected_at)
        if travel is None or collected is None:
            continue
        delta = (travel - collected).days
        if delta in buckets:
            buckets[delta].append(quote)

    items: list[BookingWindowBucket] = []
    for days in BOOKING_WINDOW_DAYS:
        rows = buckets[days]
        avg = _mean_fare(rows)
        if avg is None:
            continue
        items.append(
            BookingWindowBucket(
                window=f"T+{days}",
                days=days,
                avg_fare=round(avg),
                index_value=fare_index(avg),
                quote_count=len(rows),
            )
        )
    return items


def day_of_week(quotes: list[Quote]) -> list[DayOfWeekBucket]:
    groups: dict[int, list[Quote]] = defaultdict(list)
    for quote in quotes:
        travel = parse_iso_date(quote.travel_date)
        if travel is None:
            continue
        groups[travel.weekday()].append(quote)

    items: list[DayOfWeekBucket] = []
    for weekday in range(7):
        rows = groups.get(weekday, [])
        avg = _mean_fare(rows)
        if avg is None:
            continue
        items.append(
            DayOfWeekBucket(
                day=WEEKDAY_NAMES[weekday],
                avg_fare=round(avg),
                index_value=fare_index(avg),
                quote_count=len(rows),
            )
        )
    return items


def heatmap_sectors(quotes: list[Quote]) -> HeatmapResponse:
    routes = aggregate_routes(quotes)
    codes: set[str] = set()
    for route in routes:
        codes.add(route.from_)
        codes.add(route.to)

    airports = [
        HeatmapAirport(code=code, city=AIRPORT_CITIES.get(code))
        for code in sorted(codes)
    ]
    sectors = [
        HeatmapSector(
            origin=route.from_,
            destination=route.to,
            averageFare=route.avgFare,
            minFare=route.minFare,
            maxFare=route.maxFare,
            quoteCount=route.quoteCount,
            indexValue=route.indexValue,
        )
        for route in routes
    ]
    return HeatmapResponse(airports=airports, sectors=sectors)


def collection_summary(quotes: list[Quote]) -> CollectionSummary:
    dated = [parse_iso_date(q.collected_at) for q in quotes]
    known = [d for d in dated if d is not None]
    route_keys = {
        (q.source.strip().upper(), q.destination.strip().upper())
        for q in quotes
        if q.source.strip() and q.destination.strip()
    }
    return CollectionSummary(
        quotes_total=len(quotes),
        routes=len(route_keys),
        last_collected_at=max(known).isoformat() if known else None,
        source=SCRAPER_SOURCE,
    )


def paginate(items: list, page: int, page_size: int) -> list:
    start = (page - 1) * page_size
    return items[start : start + page_size]
