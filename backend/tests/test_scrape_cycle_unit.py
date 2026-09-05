from __future__ import annotations

from datetime import date
from typing import Any

from app.storage.ingest import IngestSearchResult
from app.storage.scrape_cycle import SOURCE_CLEARTRIP, SOURCE_EASEMYTRIP, ScrapeCycle


class FakeIngestor:
    def __init__(self) -> None:
        self.runs: list[dict[str, Any]] = []
        self.searches: list[dict[str, Any]] = []
        self.finished: list[dict[str, Any]] = []
        self._next_run_id = 1
        self._next_search_id = 1

    def start_run(self, source_code: str, collected_on=None, target_windows=None, started_at=None) -> int:
        run_id = self._next_run_id
        self._next_run_id += 1
        self.runs.append({"id": run_id, "source_code": source_code, "collected_on": collected_on})
        return run_id

    def ingest_search(self, scrape_run_id, origin_iata, dest_iata, travel_date, records, **kwargs) -> IngestSearchResult:
        search_id = self._next_search_id
        self._next_search_id += 1
        self.searches.append(
            {
                "id": search_id,
                "scrape_run_id": scrape_run_id,
                "origin": origin_iata,
                "dest": dest_iata,
                "travel_date": travel_date,
                "records": list(records),
                "request_metadata": kwargs.get("request_metadata"),
            }
        )
        return IngestSearchResult(search_id=search_id, rows_upserted=len(records))

    def finish_run(self, scrape_run_id, status="success", error_text=None, finished_at=None) -> None:
        self.finished.append({"id": scrape_run_id, "status": status, "error_text": error_text})


def test_both_source_codes_are_passed_through():
    for code in (SOURCE_CLEARTRIP, SOURCE_EASEMYTRIP):
        fake = FakeIngestor()
        cycle = ScrapeCycle(code, collected_on=date(2026, 9, 5), ingestor=fake)
        cycle.start()
        assert fake.runs[0]["source_code"] == code


def test_failed_search_ingests_no_observations():
    fake = FakeIngestor()
    cycle = ScrapeCycle(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5), ingestor=fake)
    cycle.start()
    offered = [{"price": "1,000", "departure_time": "06:00", "plane_number": "6E-1"}]
    cycle.record_search(
        "DEL",
        "BLR",
        date(2026, 9, 12),
        offered,
        ok=False,
        error="timeout",
        request_metadata={"url": "https://example.test"},
    )
    status = cycle.finish()

    assert status == "failed"
    assert len(fake.searches) == 1
    assert fake.searches[0]["records"] == []
    assert fake.searches[0]["request_metadata"]["ok"] is False
    assert fake.searches[0]["request_metadata"]["error"] == "timeout"
    assert fake.finished[0]["status"] == "failed"


def test_successful_search_forwards_records():
    fake = FakeIngestor()
    cycle = ScrapeCycle(SOURCE_EASEMYTRIP, collected_on=date(2026, 9, 5), ingestor=fake)
    cycle.start()
    offered = [{"price": "1,000", "departure_time": "06:00"}]
    cycle.record_search("CCU", "BOM", date(2026, 9, 6), offered, ok=True)
    assert fake.searches[0]["records"] == offered
    assert cycle.finish() == "success"


def test_mixed_results_are_partial():
    fake = FakeIngestor()
    cycle = ScrapeCycle(SOURCE_CLEARTRIP, collected_on=date(2026, 9, 5), ingestor=fake)
    cycle.start()
    cycle.record_search("DEL", "BLR", date(2026, 9, 12), [{"price": "2,000", "departure_time": "07:00"}], ok=True)
    cycle.record_search("BOM", "DEL", date(2026, 9, 12), [{"price": "3,000"}], ok=False, error="blocked")
    assert cycle.finish() == "partial"
    assert fake.searches[1]["records"] == []
    assert fake.finished[0]["status"] == "partial"
