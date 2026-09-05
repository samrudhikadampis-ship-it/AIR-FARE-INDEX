from __future__ import annotations

from datetime import date

from sqlalchemy import func, select

from app.db.models import Airline, FareObservation, Flight, ScrapeRun, ScrapeSource, Search
from app.storage.ingest import FareIngestor
from app.storage.scrape_cycle import SOURCE_CLEARTRIP, SOURCE_EASEMYTRIP, ScrapeCycle


def _card(**overrides):
    row = {
        "airline_name": "IndiGo",
        "plane_number": "6E-6328",
        "stops": "Non-stop",
        "departure_time": "06:00",
        "arrival_time": "08:15",
        "duration": "2h 15m",
        "price": "5,000",
        "source": "DEL",
        "destination": "BLR",
        "date": "2026-09-12",
        "today": "2026-09-05",
    }
    row.update(overrides)
    return row


def test_one_search_creates_expected_records(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    run_id = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5), target_windows=[1, 7, 15, 30, 45])
    result = ingestor.ingest_search(
        run_id,
        "DEL",
        "BLR",
        date(2026, 9, 12),
        [_card()],
        request_metadata={"ok": True, "window_days": 7},
    )
    ingestor.finish_run(run_id, status="success")

    run = db_session.get(ScrapeRun, run_id)
    assert run is not None
    assert run.status == "success"
    assert run.rows_upserted == 1
    assert result.rows_upserted == 1
    assert db_session.scalar(select(func.count()).select_from(Search).where(Search.scrape_run_id == run_id)) == 1
    assert db_session.scalar(select(func.count()).select_from(FareObservation).where(FareObservation.scrape_run_id == run_id)) == 1

    observation = db_session.scalar(select(FareObservation).where(FareObservation.scrape_run_id == run_id))
    assert observation is not None
    assert observation.price_inr == 5000
    assert observation.flight_id is not None
    source = db_session.get(ScrapeSource, observation.source_id)
    assert source is not None and source.code == SOURCE_CLEARTRIP


def test_both_source_codes_create_separate_observations(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    card = _card()
    travel = date(2026, 9, 12)
    collected = date(2026, 9, 5)

    cleartrip_run = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=collected)
    ingestor.ingest_search(cleartrip_run, "DEL", "BLR", travel, [card])
    ingestor.finish_run(cleartrip_run, status="success")

    emt_run = ingestor.start_run(SOURCE_EASEMYTRIP, collected_on=collected)
    ingestor.ingest_search(emt_run, "DEL", "BLR", travel, [card])
    ingestor.finish_run(emt_run, status="success")

    observations = db_session.scalars(select(FareObservation)).all()
    assert len(observations) == 2
    source_ids = {row.source_id for row in observations}
    assert len(source_ids) == 2
    codes = {
        db_session.get(ScrapeSource, source_id).code
        for source_id in source_ids
    }
    assert codes == {SOURCE_CLEARTRIP, SOURCE_EASEMYTRIP}


def test_same_day_ingestion_is_idempotent(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    collected = date(2026, 9, 5)
    travel = date(2026, 9, 12)

    first = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=collected)
    ingestor.ingest_search(first, "DEL", "BLR", travel, [_card(price="5,000")])
    ingestor.finish_run(first, status="success")

    second = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=collected)
    ingestor.ingest_search(second, "DEL", "BLR", travel, [_card(price="6,250")])
    ingestor.finish_run(second, status="success")

    observations = db_session.scalars(select(FareObservation)).all()
    assert len(observations) == 1
    assert observations[0].price_inr == 6250
    assert observations[0].scrape_run_id == second
    assert db_session.scalar(select(func.count()).select_from(Search)) == 2


def test_next_day_ingestion_creates_history(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    travel = date(2026, 9, 12)

    day_one = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5))
    ingestor.ingest_search(day_one, "DEL", "BLR", travel, [_card(price="5,000")])
    ingestor.finish_run(day_one, status="success")

    day_two = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 6))
    ingestor.ingest_search(day_two, "DEL", "BLR", travel, [_card(price="5,400")])
    ingestor.finish_run(day_two, status="success")

    observations = db_session.scalars(select(FareObservation).order_by(FareObservation.collected_on)).all()
    assert len(observations) == 2
    assert [row.collected_on for row in observations] == [date(2026, 9, 5), date(2026, 9, 6)]
    assert [row.price_inr for row in observations] == [5000, 5400]


def test_missing_flight_number_uses_fallback_identity(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    collected = date(2026, 9, 5)
    travel = date(2026, 9, 12)
    unidentified = _card(plane_number=None, price="4,100")

    run_id = ingestor.start_run(SOURCE_EASEMYTRIP, collected_on=collected)
    ingestor.ingest_search(run_id, "CCU", "BOM", travel, [unidentified])
    ingestor.ingest_search(run_id, "CCU", "BOM", travel, [_card(plane_number=None, price="4,900")])
    ingestor.finish_run(run_id, status="success")

    observations = db_session.scalars(select(FareObservation)).all()
    assert len(observations) == 1
    assert observations[0].flight_id is None
    assert observations[0].price_inr == 4900
    assert db_session.scalar(select(func.count()).select_from(Flight)) == 0
    airline = db_session.scalar(select(Airline))
    assert airline is not None
    assert airline.iata_code == "6E"


def test_failed_search_writes_search_not_observations(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    cycle = ScrapeCycle(
        SOURCE_CLEARTRIP,
        collected_on=date(2026, 9, 5),
        target_windows=[1, 7],
        ingestor=ingestor,
    )
    run_id = cycle.start()
    cycle.record_search(
        "DEL",
        "BLR",
        date(2026, 9, 12),
        [_card()],
        ok=False,
        error="timeout",
        request_metadata={"url": "https://example.test"},
    )
    status = cycle.finish()

    assert status == "failed"
    run = db_session.get(ScrapeRun, run_id)
    assert run is not None
    assert run.status == "failed"
    assert "timeout" in (run.error_text or "")

    searches = db_session.scalars(select(Search).where(Search.scrape_run_id == run_id)).all()
    assert len(searches) == 1
    assert searches[0].request_metadata["ok"] is False
    assert searches[0].request_metadata["error"] == "timeout"
    assert db_session.scalar(
        select(func.count()).select_from(FareObservation).where(FareObservation.search_id == searches[0].id)
    ) == 0


def test_mixed_search_results_mark_run_partial(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    cycle = ScrapeCycle(
        SOURCE_EASEMYTRIP,
        collected_on=date(2026, 9, 5),
        ingestor=ingestor,
    )
    run_id = cycle.start()
    cycle.record_search("DEL", "BLR", date(2026, 9, 12), [_card()], ok=True)
    cycle.record_search("BOM", "DEL", date(2026, 9, 12), [_card()], ok=False, error="blocked")
    status = cycle.finish()

    assert status == "partial"
    run = db_session.get(ScrapeRun, run_id)
    assert run is not None and run.status == "partial"
    assert db_session.scalar(select(func.count()).select_from(Search).where(Search.scrape_run_id == run_id)) == 2
    assert db_session.scalar(
        select(func.count()).select_from(FareObservation).where(FareObservation.scrape_run_id == run_id)
    ) == 1
