from __future__ import annotations

from datetime import date

from fastapi.testclient import TestClient

from app.deps import get_quote_store
from app.main import app
from app.storage.ingest import FareIngestor
from app.storage.postgres_store import PostgresQuoteStore
from app.storage.scrape_cycle import SOURCE_CLEARTRIP


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


def _client(session_factory) -> TestClient:
    app.dependency_overrides[get_quote_store] = lambda: PostgresQuoteStore(session_factory=session_factory)
    return TestClient(app)


def test_empty_database_api_contracts(session_factory):
    client = _client(session_factory)
    quotes = client.get("/api/v1/quotes").json()
    assert quotes["items"] == []
    assert quotes["total"] == 0
    assert quotes["page"] == 1

    routes = client.get("/api/v1/routes").json()
    assert routes["items"] == []
    assert routes["total"] == 0

    snapshot = client.get("/api/v1/index/snapshot").json()
    assert snapshot["index_value"] is None
    assert snapshot["quote_count"] == 0
    assert snapshot["avg_fare"] is None

    trend = client.get("/api/v1/index/trend").json()
    assert trend["items"] == []

    heatmap = client.get("/api/v1/heatmap/sectors").json()
    assert heatmap["airports"] == []
    assert heatmap["sectors"] == []

    missing = client.get("/api/v1/routes/DEL-BLR/quotes")
    assert missing.status_code == 404
    app.dependency_overrides.clear()


def test_quotes_pagination_and_route_filters(session_factory):
    ingestor = FareIngestor(session_factory=session_factory)
    run_id = ingestor.start_run(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5))
    ingestor.ingest_search(
        run_id,
        "DEL",
        "BLR",
        date(2026, 9, 12),
        [_card(), _card(plane_number="6E-100", departure_time="09:00", price="6,000")],
    )
    ingestor.ingest_search(
        run_id,
        "CCU",
        "BOM",
        date(2026, 9, 12),
        [_card(source="CCU", destination="BOM", plane_number="6E-200")],
    )

    client = _client(session_factory)
    page = client.get("/api/v1/quotes", params={"page": 1, "page_size": 2}).json()
    assert page["page"] == 1
    assert page["page_size"] == 2
    assert page["total"] == 3
    assert len(page["items"]) == 2
    assert all(item["source"] in {"DEL", "CCU"} for item in page["items"])
    assert all(item["source"] != "CLEARTRIP" for item in page["items"])

    too_big = client.get("/api/v1/quotes", params={"page_size": 101})
    assert too_big.status_code == 422

    bad_route = client.get("/api/v1/routes/DELBLR/quotes")
    assert bad_route.status_code == 422

    route_quotes = client.get("/api/v1/routes/DEL-BLR/quotes").json()
    assert route_quotes["route_id"] == "DEL-BLR"
    assert route_quotes["total"] == 2
    assert all(item["source"] == "DEL" and item["destination"] == "BLR" for item in route_quotes["items"])

    missing = client.get("/api/v1/routes/BLR-DEL/quotes")
    assert missing.status_code == 404

    snapshot = client.get("/api/v1/index/snapshot").json()
    assert snapshot["quote_count"] == 3
    assert snapshot["index_value"] is not None

    collection = client.get("/api/v1/collection/summary").json()
    assert collection["quotes_total"] == 3
    assert collection["routes"] == 2
    assert collection["source"] == "Cleartrip, EaseMyTrip"

    filtered = client.get("/api/v1/quotes", params={"origin": "DEL", "page": 1, "page_size": 50}).json()
    assert filtered["total"] == 2
    assert all(item["source"] == "DEL" for item in filtered["items"])
    page_two = client.get("/api/v1/quotes", params={"page": 2, "page_size": 2}).json()
    assert page_two["page"] == 2
    assert page_two["total"] == 3
    assert len(page_two["items"]) == 1
    app.dependency_overrides.clear()
