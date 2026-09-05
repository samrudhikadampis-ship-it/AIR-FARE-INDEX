from __future__ import annotations

import argparse
import json
import logging
import sys
from collections import defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import func, select

from app.db.engine import get_session_factory
from app.db.models import FareObservation, ScrapeRun, ScrapeSource, Search
from app.services.normalize import parse_price_inr
from app.storage.identity import parse_clock
from app.storage.ingest import FareIngestor
from app.storage.scrape_cycle import SOURCE_CLEARTRIP, SOURCE_EASEMYTRIP

logger = logging.getLogger("airfare.backfill")

BACKEND_ROOT = Path(__file__).resolve().parents[2]
SCRAPER_DIR = BACKEND_ROOT / "scraper"

DEFAULT_FILES = (
    (SOURCE_CLEARTRIP, SCRAPER_DIR / "fast_flights_data.json"),
    (SOURCE_EASEMYTRIP, SCRAPER_DIR / "easemytrip_flights_data.json"),
)


def _parse_date(value: Any) -> date | None:
    text = str(value or "").strip()[:10]
    if not text:
        return None
    try:
        return date.fromisoformat(text)
    except ValueError:
        return None


def _valid_record(row: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    origin = str(row.get("source") or "").strip().upper()
    dest = str(row.get("destination") or "").strip().upper()
    travel_date = _parse_date(row.get("date"))
    collected_on = _parse_date(row.get("today") or row.get("collected_at"))
    if len(origin) != 3 or len(dest) != 3:
        return None, "invalid_iata"
    if origin == dest:
        return None, "loop_route"
    if travel_date is None or collected_on is None:
        return None, "invalid_date"
    if parse_price_inr(row.get("price")) is None:
        return None, "invalid_price"
    if parse_clock(row.get("departure_time")) is None:
        return None, "invalid_departure"
    return row, None


def _count(session_factory, model, source_id: int | None = None) -> int:
    session = session_factory()
    try:
        stmt = select(func.count()).select_from(model)
        if source_id is not None and hasattr(model, "source_id"):
            stmt = stmt.where(model.source_id == source_id)
        return int(session.scalar(stmt) or 0)
    finally:
        session.close()


def _source_id(session_factory, code: str) -> int:
    session = session_factory()
    try:
        source = session.scalar(select(ScrapeSource).where(ScrapeSource.code == code))
        if source is None:
            raise ValueError(f"Unknown scrape source {code}. Seed scrape_sources first.")
        return source.id
    finally:
        session.close()


def _get_or_start_run(
    ingestor: FareIngestor, session_factory, source_code: str, collected_on: date
) -> tuple[int, bool]:
    session = session_factory()
    try:
        source_id = session.scalar(select(ScrapeSource.id).where(ScrapeSource.code == source_code))
        existing = session.scalar(
            select(ScrapeRun.id)
            .where(ScrapeRun.source_id == source_id, ScrapeRun.collected_on == collected_on)
            .order_by(ScrapeRun.id)
        )
        if existing is not None:
            return int(existing), False
    finally:
        session.close()
    return ingestor.start_run(source_code, collected_on=collected_on), True


def backfill_file(
    source_code: str,
    path: Path,
    ingestor: FareIngestor,
    session_factory,
) -> dict[str, Any]:
    summary: dict[str, Any] = {
        "source": source_code,
        "file": str(path),
        "rows_read": 0,
        "rows_skipped": 0,
        "skip_reasons": {},
        "searches_before": 0,
        "searches_after": 0,
        "searches_created": 0,
        "observations_before": 0,
        "observations_after": 0,
        "observations_inserted": 0,
        "observations_updated": 0,
        "errors": [],
        "upserted": 0,
    }
    if not path.is_file():
        summary["errors"].append(f"file not found: {path}")
        return summary

    with path.open(encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, list):
        summary["errors"].append("JSON root must be an array")
        return summary

    source_id = _source_id(session_factory, source_code)
    summary["searches_before"] = _count(session_factory, Search, source_id)
    summary["observations_before"] = _count(session_factory, FareObservation, source_id)

    grouped: dict[date, dict[tuple[str, str, date], list[dict[str, Any]]]] = defaultdict(
        lambda: defaultdict(list)
    )
    for raw in payload:
        summary["rows_read"] += 1
        if not isinstance(raw, dict):
            summary["rows_skipped"] += 1
            summary["skip_reasons"]["not_object"] = summary["skip_reasons"].get("not_object", 0) + 1
            continue
        record, reason = _valid_record(raw)
        if record is None or reason:
            summary["rows_skipped"] += 1
            key = reason or "invalid"
            summary["skip_reasons"][key] = summary["skip_reasons"].get(key, 0) + 1
            continue
        origin = str(record["source"]).strip().upper()
        dest = str(record["destination"]).strip().upper()
        travel_date = _parse_date(record.get("date"))
        collected_on = _parse_date(record.get("today") or record.get("collected_at"))
        assert travel_date is not None and collected_on is not None
        grouped[collected_on][(origin, dest, travel_date)].append(record)

    for collected_on, searches in sorted(grouped.items()):
        try:
            run_id, created = _get_or_start_run(ingestor, session_factory, source_code, collected_on)
        except Exception as exc:
            logger.exception("Could not start/reuse scrape_run for %s %s", source_code, collected_on)
            summary["errors"].append(f"run {source_code} {collected_on}: {exc}")
            continue
        for (origin, dest, travel_date), records in searches.items():
            try:
                result = ingestor.ingest_search(
                    run_id,
                    origin,
                    dest,
                    travel_date,
                    records,
                    request_metadata={
                        "ok": True,
                        "backfill": True,
                        "file": path.name,
                    },
                    searched_at=datetime.combine(collected_on, datetime.min.time(), tzinfo=timezone.utc),
                )
                summary["upserted"] += result.rows_upserted
            except Exception as exc:
                logger.exception("Backfill search failed %s %s->%s %s", source_code, origin, dest, travel_date)
                summary["errors"].append(f"{origin}->{dest} {travel_date}: {exc}")
        if created:
            try:
                ingestor.finish_run(run_id, status="success" if not summary["errors"] else "partial")
            except Exception as exc:
                summary["errors"].append(f"finish_run {run_id}: {exc}")

    summary["searches_after"] = _count(session_factory, Search, source_id)
    summary["observations_after"] = _count(session_factory, FareObservation, source_id)
    summary["searches_created"] = max(0, summary["searches_after"] - summary["searches_before"])
    summary["observations_inserted"] = max(0, summary["observations_after"] - summary["observations_before"])
    summary["observations_updated"] = max(
        0, summary["upserted"] - summary["observations_inserted"]
    )
    return summary


def run_backfill(paths: list[tuple[str, Path]] | None = None) -> list[dict[str, Any]]:
    session_factory = get_session_factory()
    ingestor = FareIngestor(session_factory=session_factory)
    files = paths or list(DEFAULT_FILES)
    reports = []
    for source_code, path in files:
        logger.info("Backfilling %s from %s", source_code, path)
        reports.append(backfill_file(source_code, path, ingestor, session_factory))
    return reports


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    parser = argparse.ArgumentParser(description="Backfill airfare JSON files into PostgreSQL.")
    parser.parse_args(argv)
    reports = run_backfill()
    print(json.dumps(reports, indent=2, default=str))
    return 1 if any(item["errors"] for item in reports) else 0


if __name__ == "__main__":
    sys.exit(main())
