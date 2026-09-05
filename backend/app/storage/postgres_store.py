from __future__ import annotations

import logging
from datetime import date, datetime, time
from typing import Any, Callable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.engine import get_session_factory
from app.db.models import Airline, FareObservation, Route

logger = logging.getLogger("airfare.storage")


def format_clock(value: time | None) -> str:
    if value is None:
        return ""
    return value.strftime("%H:%M")


def format_duration(minutes: int | None) -> str:
    if minutes is None or minutes <= 0:
        return ""
    hours, remaining = divmod(int(minutes), 60)
    if remaining:
        return f"{hours}h {remaining}m"
    return f"{hours}h"


class PostgresQuoteStore:
    """Read-side QuoteStore backed by fare_observations."""

    def __init__(self, session_factory: Callable[[], Session] | None = None) -> None:
        self._session_factory = session_factory

    def load_raw(self) -> list[dict[str, Any]]:
        factory = self._session_factory or get_session_factory()
        session = factory()
        try:
            stmt = (
                select(FareObservation, Route, Airline)
                .join(Route, FareObservation.route_id == Route.id)
                .outerjoin(Airline, FareObservation.airline_id == Airline.id)
                .order_by(FareObservation.id)
            )
            rows = session.execute(stmt).all()
            return [self._to_raw(observation, route, airline) for observation, route, airline in rows]
        except Exception:
            logger.exception("Failed to load quotes from PostgreSQL")
            raise
        finally:
            session.close()

    def _to_raw(self, observation: FareObservation, route: Route, airline: Airline | None) -> dict[str, Any]:
        airline_name = None
        if airline is not None and airline.name:
            airline_name = airline.name
        elif observation.raw_airline_name:
            airline_name = observation.raw_airline_name

        collected = _as_iso_date(observation.collected_on) or _as_iso_date(observation.collected_at)
        travel = _as_iso_date(observation.travel_date)
        duration = format_duration(observation.duration_minutes)
        price = str(observation.price_inr)
        return {
            "id": f"Q-{observation.id}",
            "source": route.origin_iata,
            "destination": route.dest_iata,
            "departure_time": format_clock(observation.departure_time),
            "arrival_time": format_clock(observation.arrival_time),
            "duration": duration,
            "price": price,
            "price_inr": observation.price_inr,
            "date": travel,
            "today": collected,
            "collected_at": collected,
            "airline": airline_name,
            "airline_name": airline_name,
            "plane_number": observation.raw_flight_number,
        }


def _as_iso_date(value: date | datetime | None) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.date().isoformat()
    return value.isoformat()
