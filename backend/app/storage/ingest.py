from __future__ import annotations

from contextlib import AbstractContextManager
from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import Any, Callable

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.constants import AIRPORT_CITIES, AIRPORT_NAMES, BOOKING_WINDOW_DAYS
from app.db.engine import get_session_factory
from app.db.models import Airline, Airport, FareObservation, Flight, Route, ScrapeRun, ScrapeSource, Search
from app.services.normalize import parse_duration_minutes, parse_price_inr
from app.storage.identity import (
    airline_iata_from_name,
    canonical_airline_name,
    parse_clock,
    parse_flight_identity,
    parse_stops,
)

RUN_STATUSES = frozenset({"running", "success", "partial", "failed"})


@dataclass(frozen=True)
class IngestSearchResult:
    search_id: int
    rows_upserted: int


class FareIngestor:
    """Write path for scrape_runs / searches / fare_observations.

    Scrapers are not wired yet; call this from a later integration step.
    """

    def __init__(self, session_factory: Callable[[], Session] | None = None) -> None:
        self._session_factory = session_factory or get_session_factory()

    def _session(self) -> AbstractContextManager[Session]:
        factory = self._session_factory
        return _session_scope(factory)

    def start_run(
        self,
        source_code: str,
        collected_on: date | None = None,
        target_windows: tuple[int, ...] | list[int] | None = None,
        started_at: datetime | None = None,
    ) -> int:
        collected = collected_on or datetime.now(timezone.utc).date()
        started = started_at or datetime.now(timezone.utc)
        windows = list(target_windows if target_windows is not None else BOOKING_WINDOW_DAYS)

        with self._session() as session:
            source = self._require_source(session, source_code)
            run = ScrapeRun(
                source_id=source.id,
                started_at=started,
                finished_at=None,
                status="running",
                collected_on=collected,
                target_windows=windows,
                rows_upserted=0,
                error_text=None,
            )
            session.add(run)
            session.flush()
            return run.id

    def ingest_search(
        self,
        scrape_run_id: int,
        origin_iata: str,
        dest_iata: str,
        travel_date: date,
        records: list[dict[str, Any]],
        *,
        passengers: int = 1,
        cabin: str = "economy",
        currency: str = "INR",
        request_metadata: dict[str, Any] | None = None,
        searched_at: datetime | None = None,
    ) -> IngestSearchResult:
        origin = origin_iata.strip().upper()
        dest = dest_iata.strip().upper()
        cabin_key = cabin.strip().lower()
        searched = searched_at or datetime.now(timezone.utc)

        with self._session() as session:
            run = session.get(ScrapeRun, scrape_run_id)
            if run is None:
                raise ValueError(f"Unknown scrape_run_id: {scrape_run_id}")

            route_id = self._ensure_route(session, origin, dest)
            delta = (travel_date - run.collected_on).days
            booking_window_days = delta if delta in BOOKING_WINDOW_DAYS else None
            search_id = self._upsert_search(
                session,
                run=run,
                route_id=route_id,
                travel_date=travel_date,
                booking_window_days=booking_window_days,
                passengers=passengers,
                cabin=cabin_key,
                currency=currency.upper(),
                searched_at=searched,
                request_metadata=request_metadata,
            )

            upserted = 0
            for record in records:
                if self._upsert_observation(
                    session,
                    run=run,
                    search_id=search_id,
                    route_id=route_id,
                    travel_date=travel_date,
                    booking_window_days=booking_window_days,
                    currency=currency.upper(),
                    collected_at=searched,
                    record=record,
                ):
                    upserted += 1

            run.rows_upserted = (run.rows_upserted or 0) + upserted
            session.flush()
            return IngestSearchResult(search_id=search_id, rows_upserted=upserted)

    def finish_run(
        self,
        scrape_run_id: int,
        status: str = "success",
        error_text: str | None = None,
        finished_at: datetime | None = None,
    ) -> None:
        if status not in RUN_STATUSES:
            raise ValueError(f"Invalid scrape run status: {status}")

        with self._session() as session:
            run = session.get(ScrapeRun, scrape_run_id)
            if run is None:
                raise ValueError(f"Unknown scrape_run_id: {scrape_run_id}")
            run.status = status
            run.finished_at = finished_at or datetime.now(timezone.utc)
            run.error_text = error_text

    def _require_source(self, session: Session, source_code: str) -> ScrapeSource:
        code = source_code.strip().upper()
        source = session.scalar(select(ScrapeSource).where(func.upper(ScrapeSource.code) == code))
        if source is None:
            raise ValueError(
                f"Unknown scrape source {source_code!r}. Seed scrape_sources before ingesting."
            )
        return source

    def _ensure_airport(self, session: Session, iata: str) -> None:
        payload = {
            "iata_code": iata,
            "city": AIRPORT_CITIES.get(iata),
            "name": AIRPORT_NAMES.get(iata),
            "country_code": "IN",
        }
        stmt = pg_insert(Airport).values(**payload).on_conflict_do_nothing(index_elements=["iata_code"])
        session.execute(stmt)

    def _ensure_route(self, session: Session, origin: str, dest: str) -> int:
        if origin == dest:
            raise ValueError("origin_iata and dest_iata must differ")
        self._ensure_airport(session, origin)
        self._ensure_airport(session, dest)
        stmt = (
            pg_insert(Route)
            .values(origin_iata=origin, dest_iata=dest)
            .on_conflict_do_nothing(index_elements=["origin_iata", "dest_iata"])
        )
        session.execute(stmt)
        route_id = session.scalar(
            select(Route.id).where(Route.origin_iata == origin, Route.dest_iata == dest)
        )
        if route_id is None:
            raise RuntimeError(f"Failed to resolve route {origin}-{dest}")
        return route_id

    def _upsert_search(
        self,
        session: Session,
        *,
        run: ScrapeRun,
        route_id: int,
        travel_date: date,
        booking_window_days: int,
        passengers: int,
        cabin: str,
        currency: str,
        searched_at: datetime,
        request_metadata: dict[str, Any] | None,
    ) -> int:
        stmt = pg_insert(Search).values(
            scrape_run_id=run.id,
            source_id=run.source_id,
            route_id=route_id,
            travel_date=travel_date,
            search_date=run.collected_on,
            booking_window_days=booking_window_days,
            passengers=passengers,
            cabin=cabin,
            currency=currency,
            searched_at=searched_at,
            request_metadata=request_metadata,
        )
        stmt = stmt.on_conflict_do_update(
            constraint="uq_searches_run_route_date_pax_cabin",
            set_={
                "searched_at": stmt.excluded.searched_at,
                "booking_window_days": stmt.excluded.booking_window_days,
                "currency": stmt.excluded.currency,
                "request_metadata": stmt.excluded.request_metadata,
            },
        ).returning(Search.id)
        return session.execute(stmt).scalar_one()

    def _get_or_create_airline(self, session: Session, iata: str, raw_name: str | None) -> Airline:
        code = iata.upper()
        stmt = pg_insert(Airline).values(
            iata_code=code,
            name=canonical_airline_name(code, raw_name),
        ).on_conflict_do_nothing(index_elements=["iata_code"])
        session.execute(stmt)
        airline = session.scalar(select(Airline).where(Airline.iata_code == code))
        if airline is None:
            raise RuntimeError(f"Failed to resolve airline {code}")
        return airline

    def _get_or_create_flight(self, session: Session, airline_id: int, flight_number: str) -> Flight:
        stmt = (
            pg_insert(Flight)
            .values(airline_id=airline_id, flight_number=flight_number)
            .on_conflict_do_nothing(index_elements=["airline_id", "flight_number"])
        )
        session.execute(stmt)
        flight = session.scalar(
            select(Flight).where(
                Flight.airline_id == airline_id,
                Flight.flight_number == flight_number,
            )
        )
        if flight is None:
            raise RuntimeError("Failed to resolve flight")
        return flight

    def _resolve_airline_and_flight(
        self, session: Session, record: dict[str, Any]
    ) -> tuple[int | None, int | None, str | None]:
        raw_flight = _as_text(record.get("plane_number") or record.get("flight_number")) or None
        raw_name = _as_text(record.get("airline_name") or record.get("airline")) or None
        iata, number = parse_flight_identity(raw_flight)
        if iata is None:
            iata = airline_iata_from_name(raw_name)

        airline_id = None
        flight_id = None
        if iata:
            airline = self._get_or_create_airline(session, iata, raw_name)
            airline_id = airline.id
            if number:
                flight = self._get_or_create_flight(session, airline.id, number)
                flight_id = flight.id
        return airline_id, flight_id, raw_flight

    def _upsert_observation(
        self,
        session: Session,
        *,
        run: ScrapeRun,
        search_id: int,
        route_id: int,
        travel_date: date,
        booking_window_days: int,
        currency: str,
        collected_at: datetime,
        record: dict[str, Any],
    ) -> bool:
        price_inr = parse_price_inr(record.get("price"))
        departure_time = parse_clock(record.get("departure_time"))
        if price_inr is None or departure_time is None:
            return False

        airline_id, flight_id, raw_flight = self._resolve_airline_and_flight(session, record)
        raw_airline = _as_text(record.get("airline_name") or record.get("airline")) or None
        values = {
            "search_id": search_id,
            "scrape_run_id": run.id,
            "source_id": run.source_id,
            "flight_id": flight_id,
            "route_id": route_id,
            "airline_id": airline_id,
            "travel_date": travel_date,
            "collected_on": run.collected_on,
            "collected_at": collected_at,
            "booking_window_days": booking_window_days,
            "departure_time": departure_time,
            "arrival_time": parse_clock(record.get("arrival_time")),
            "duration_minutes": parse_duration_minutes(record.get("duration")) or None,
            "stops": parse_stops(record.get("stops")),
            "price_inr": price_inr,
            "currency": currency,
            "raw_airline_name": raw_airline,
            "raw_flight_number": raw_flight,
            "raw_payload": record,
        }
        if values["duration_minutes"] == 0:
            values["duration_minutes"] = None

        stmt = pg_insert(FareObservation).values(**values)
        excluded = stmt.excluded
        update_fields = {
            "search_id": excluded.search_id,
            "scrape_run_id": excluded.scrape_run_id,
            "airline_id": excluded.airline_id,
            "collected_at": excluded.collected_at,
            "booking_window_days": excluded.booking_window_days,
            "departure_time": excluded.departure_time,
            "arrival_time": excluded.arrival_time,
            "duration_minutes": excluded.duration_minutes,
            "stops": excluded.stops,
            "price_inr": excluded.price_inr,
            "currency": excluded.currency,
            "raw_airline_name": excluded.raw_airline_name,
            "raw_flight_number": excluded.raw_flight_number,
            "raw_payload": excluded.raw_payload,
        }
        if flight_id is not None:
            stmt = stmt.on_conflict_do_update(
                index_elements=["source_id", "flight_id", "travel_date", "collected_on"],
                index_where=text("flight_id IS NOT NULL"),
                set_=update_fields,
            )
        else:
            stmt = stmt.on_conflict_do_update(
                index_elements=[
                    "source_id",
                    "route_id",
                    "travel_date",
                    "collected_on",
                    text("COALESCE(departure_time::text, '')"),
                    text("COALESCE(arrival_time::text, '')"),
                    text("COALESCE(raw_flight_number, '')"),
                    text("COALESCE(raw_airline_name, '')"),
                ],
                index_where=text("flight_id IS NULL"),
                set_=update_fields,
            )
        session.execute(stmt)
        return True


class _session_scope:
    def __init__(self, factory: Callable[[], Session]) -> None:
        self._factory = factory
        self._session: Session | None = None

    def __enter__(self) -> Session:
        self._session = self._factory()
        return self._session

    def __exit__(self, exc_type, exc, tb) -> None:
        session = self._session
        if session is None:
            return
        try:
            if exc_type is None:
                session.commit()
            else:
                session.rollback()
        finally:
            session.close()


def _as_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()
