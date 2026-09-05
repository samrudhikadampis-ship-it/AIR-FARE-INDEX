from __future__ import annotations

from datetime import date

from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.constants import (
    AIRPORT_CITIES,
    AIRPORT_NAMES,
    DEFAULT_ROUTE_WEIGHT,
    ROUTE_WEIGHT_EFFECTIVE_FROM,
    ROUTE_WEIGHT_METHOD,
    SCRAPE_SOURCE_SEEDS,
    TRACKED_ROUTES,
)


def seed_reference_data(connection: Connection) -> None:
    """Idempotent seeds for scrape sources, airports, routes, and weights."""
    for code, name, kind in SCRAPE_SOURCE_SEEDS:
        connection.execute(
            text(
                """
                INSERT INTO scrape_sources (code, name, kind, is_active)
                VALUES (:code, :name, :kind, true)
                ON CONFLICT (code) DO NOTHING
                """
            ),
            {"code": code, "name": name, "kind": kind},
        )

    airport_codes = {code for pair in TRACKED_ROUTES for code in pair}
    airport_codes.update(AIRPORT_CITIES)
    for iata in sorted(airport_codes):
        connection.execute(
            text(
                """
                INSERT INTO airports (iata_code, city, name, country_code)
                VALUES (:iata, :city, :name, 'IN')
                ON CONFLICT (iata_code) DO NOTHING
                """
            ),
            {
                "iata": iata,
                "city": AIRPORT_CITIES.get(iata),
                "name": AIRPORT_NAMES.get(iata),
            },
        )

    for origin, dest in TRACKED_ROUTES:
        connection.execute(
            text(
                """
                INSERT INTO routes (origin_iata, dest_iata)
                VALUES (:origin, :dest)
                ON CONFLICT (origin_iata, dest_iata) DO NOTHING
                """
            ),
            {"origin": origin, "dest": dest},
        )

    effective_from = date.fromisoformat(ROUTE_WEIGHT_EFFECTIVE_FROM)
    for origin, dest in TRACKED_ROUTES:
        connection.execute(
            text(
                """
                INSERT INTO route_weights (route_id, weight, effective_from, effective_to, method)
                SELECT r.id, :weight, :effective_from, NULL, :method
                FROM routes r
                WHERE r.origin_iata = :origin
                  AND r.dest_iata = :dest
                  AND NOT EXISTS (
                      SELECT 1
                      FROM route_weights w
                      WHERE w.route_id = r.id
                        AND w.effective_from = :effective_from
                  )
                """
            ),
            {
                "origin": origin,
                "dest": dest,
                "weight": DEFAULT_ROUTE_WEIGHT,
                "effective_from": effective_from,
                "method": ROUTE_WEIGHT_METHOD,
            },
        )
