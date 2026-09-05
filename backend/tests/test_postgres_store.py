from __future__ import annotations

from datetime import date

from sqlalchemy import select

from app.db.models import FareObservation
from app.services.quotes import load_quotes
from app.storage.ingest import FareIngestor
from app.storage.postgres_store import PostgresQuoteStore
from app.storage.scrape_cycle import SOURCE_CLEARTRIP, SOURCE_EASEMYTRIP


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


def test_postgres_store_maps_quote_fields(session_factory):
    ingestor = FareIngestor(session_factory=session_factory)
    run_id = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5))
    ingestor.ingest_search(run_id, "DEL", "BLR", date(2026, 9, 12), [_card()])
    ingestor.finish_run(run_id, status="success")

    quotes = load_quotes(PostgresQuoteStore(session_factory=session_factory))
    assert len(quotes) == 1
    quote = quotes[0]
    assert quote.source == "DEL"
    assert quote.source != SOURCE_CLEARTRIP
    assert quote.destination == "BLR"
    assert quote.airline == "IndiGo"
    assert quote.id.startswith("Q-")
    assert quote.departure_time == "06:00"
    assert quote.arrival_time == "08:15"
    assert quote.duration_minutes == 135
    assert quote.duration == "2h 15m"
    assert quote.price_inr == 5000
    assert quote.travel_date == "2026-09-12"
    assert quote.collected_at == "2026-09-05"


def test_quote_ids_are_stable_database_ids(session_factory, db_session):
    ingestor = FareIngestor(session_factory=session_factory)
    run_id = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5))
    ingestor.ingest_search(run_id, "DEL", "BLR", date(2026, 9, 12), [_card()])
    observation_id = db_session.scalar(select(FareObservation.id))
    quotes = load_quotes(PostgresQuoteStore(session_factory=session_factory))
    assert quotes[0].id == f"Q-{observation_id}"


def test_empty_postgres_store_returns_no_quotes(session_factory):
    assert load_quotes(PostgresQuoteStore(session_factory=session_factory)) == []


def test_multiple_sources_and_history_remain_separate(session_factory):
    ingestor = FareIngestor(session_factory=session_factory)
    card = _card()
    first = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5))
    ingestor.ingest_search(first, "DEL", "BLR", date(2026, 9, 12), [card])
    second = ingestor.start_run(SOURCE_EASEMYTRIP, collected_on=date(2026, 9, 5))
    ingestor.ingest_search(second, "DEL", "BLR", date(2026, 9, 12), [card])
    third = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 6))
    ingestor.ingest_search(third, "DEL", "BLR", date(2026, 9, 12), [_card(price="5,400")])

    quotes = load_quotes(PostgresQuoteStore(session_factory=session_factory))
    assert len(quotes) == 3
    assert {q.source for q in quotes} == {"DEL"}
    assert {q.collected_at for q in quotes} == {"2026-09-05", "2026-09-06"}
    assert sorted(q.price_inr for q in quotes) == [5000, 5000, 5400]
