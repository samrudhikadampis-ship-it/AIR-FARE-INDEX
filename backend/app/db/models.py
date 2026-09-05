from __future__ import annotations

from datetime import date, datetime, time
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    Time,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ScrapeSource(Base):
    __tablename__ = "scrape_sources"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('ota', 'airline_direct', 'other')",
            name="ck_scrape_sources_kind",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))


class Airline(Base):
    __tablename__ = "airlines"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    iata_code: Mapped[str | None] = mapped_column(String(2), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)


class Airport(Base):
    __tablename__ = "airports"

    iata_code: Mapped[str] = mapped_column(String(3), primary_key=True)
    city: Mapped[str | None] = mapped_column(String(128), nullable=True)
    name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False, default="IN", server_default=text("'IN'"))


class Route(Base):
    __tablename__ = "routes"
    __table_args__ = (
        UniqueConstraint("origin_iata", "dest_iata", name="uq_routes_origin_dest"),
        CheckConstraint("origin_iata <> dest_iata", name="ck_routes_not_loop"),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    origin_iata: Mapped[str] = mapped_column(
        String(3), ForeignKey("airports.iata_code"), nullable=False
    )
    dest_iata: Mapped[str] = mapped_column(
        String(3), ForeignKey("airports.iata_code"), nullable=False
    )


class Flight(Base):
    __tablename__ = "flights"
    __table_args__ = (
        UniqueConstraint("airline_id", "flight_number", name="uq_flights_airline_number"),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    airline_id: Mapped[int] = mapped_column(ForeignKey("airlines.id"), nullable=False)
    flight_number: Mapped[str] = mapped_column(String(8), nullable=False)


class ScrapeRun(Base):
    __tablename__ = "scrape_runs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('running', 'success', 'partial', 'failed')",
            name="ck_scrape_runs_status",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("scrape_sources.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    collected_on: Mapped[date] = mapped_column(Date, nullable=False)
    target_windows: Mapped[list[int] | None] = mapped_column(ARRAY(Integer), nullable=True)
    rows_upserted: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    error_text: Mapped[str | None] = mapped_column(Text, nullable=True)


class Search(Base):
    __tablename__ = "searches"
    __table_args__ = (
        UniqueConstraint(
            "scrape_run_id",
            "route_id",
            "travel_date",
            "passengers",
            "cabin",
            name="uq_searches_run_route_date_pax_cabin",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    scrape_run_id: Mapped[int] = mapped_column(ForeignKey("scrape_runs.id"), nullable=False)
    source_id: Mapped[int] = mapped_column(ForeignKey("scrape_sources.id"), nullable=False)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"), nullable=False)
    travel_date: Mapped[date] = mapped_column(Date, nullable=False)
    search_date: Mapped[date] = mapped_column(Date, nullable=False)
    booking_window_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    passengers: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default=text("1"))
    cabin: Mapped[str] = mapped_column(String(32), nullable=False, default="economy", server_default=text("'economy'"))
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR", server_default=text("'INR'"))
    searched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    request_metadata: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)


class FareObservation(Base):
    __tablename__ = "fare_observations"
    __table_args__ = (
        Index(
            "uq_fare_observations_identified",
            "source_id",
            "flight_id",
            "travel_date",
            "collected_on",
            unique=True,
            postgresql_where=text("flight_id IS NOT NULL"),
        ),
        Index(
            "uq_fare_observations_unidentified",
            "source_id",
            "route_id",
            "travel_date",
            "collected_on",
            text("COALESCE(departure_time::text, '')"),
            text("COALESCE(arrival_time::text, '')"),
            text("COALESCE(raw_flight_number, '')"),
            text("COALESCE(raw_airline_name, '')"),
            unique=True,
            postgresql_where=text("flight_id IS NULL"),
        ),
        Index("ix_fare_observations_collected_on", "collected_on"),
        Index("ix_fare_observations_route_collected", "route_id", "collected_on"),
        Index("ix_fare_observations_source_collected", "source_id", "collected_on"),
        Index("ix_fare_observations_travel_collected", "travel_date", "collected_on"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    search_id: Mapped[int] = mapped_column(ForeignKey("searches.id"), nullable=False)
    scrape_run_id: Mapped[int] = mapped_column(ForeignKey("scrape_runs.id"), nullable=False)
    source_id: Mapped[int] = mapped_column(ForeignKey("scrape_sources.id"), nullable=False)
    flight_id: Mapped[int | None] = mapped_column(ForeignKey("flights.id"), nullable=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"), nullable=False)
    airline_id: Mapped[int | None] = mapped_column(ForeignKey("airlines.id"), nullable=True)
    travel_date: Mapped[date] = mapped_column(Date, nullable=False)
    collected_on: Mapped[date] = mapped_column(Date, nullable=False)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    booking_window_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    departure_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    arrival_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stops: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR", server_default=text("'INR'"))
    raw_airline_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_flight_number: Mapped[str | None] = mapped_column(String(16), nullable=True)
    raw_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)


class RouteWeight(Base):
    __tablename__ = "route_weights"
    __table_args__ = (
        UniqueConstraint("route_id", "effective_from", name="uq_route_weights_route_from"),
        CheckConstraint("weight > 0", name="ck_route_weights_positive"),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id"), nullable=False)
    weight: Mapped[float] = mapped_column(Numeric(12, 6), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    method: Mapped[str | None] = mapped_column(String(64), nullable=True)
