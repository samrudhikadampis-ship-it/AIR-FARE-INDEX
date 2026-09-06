from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any, Awaitable

from app.constants import BOOKING_WINDOW_DAYS
from app.db.config import require_database_url
from app.storage.ingest import FareIngestor, IngestSearchResult

logger = logging.getLogger("airfare.scrape")

SOURCE_CLEARTRIP = "CLEARTRIP"
SOURCE_EASEMYTRIP = "EASEMYTRIP"


class ScrapeCycle:
    """Shared scrape_run lifecycle for every scraper."""

    def __init__(
        self,
        source_code: str,
        collected_on: date | None = None,
        target_windows: list[int] | tuple[int, ...] | None = None,
        ingestor: FareIngestor | None = None,
    ) -> None:
        self.source_code = source_code.strip().upper()
        self.collected_on = collected_on or datetime.now().date()
        self.target_windows = list(target_windows if target_windows is not None else BOOKING_WINDOW_DAYS)
        self.ingestor = ingestor if ingestor is not None else _live_ingestor()
        self.run_id: int | None = None
        self.attempted = 0
        self.successes = 0
        self.failures: list[str] = []

    def start(self) -> int:
        self.run_id = self.ingestor.start_run(
            self.source_code,
            collected_on=self.collected_on,
            target_windows=self.target_windows,
        )
        logger.info("Started scrape_run %s source=%s collected_on=%s", self.run_id, self.source_code, self.collected_on)
        return self.run_id

    def record_search(
        self,
        origin_iata: str,
        dest_iata: str,
        travel_date: date,
        records: list[dict[str, Any]],
        *,
        ok: bool,
        error: str | None = None,
        request_metadata: dict[str, Any] | None = None,
    ) -> IngestSearchResult | None:
        if self.run_id is None:
            raise RuntimeError("ScrapeCycle.start() must be called before record_search()")

        self.attempted += 1
        label = f"{origin_iata}->{dest_iata} {travel_date.isoformat()}"
        metadata = dict(request_metadata or {})
        metadata["ok"] = ok
        if error:
            metadata["error"] = error

        # Failed searches persist the request, never observations.
        to_ingest = records if ok else []
        empty = ok and not to_ingest
        if empty:
            metadata["empty"] = True

        try:
            result = self._ingest(origin_iata, dest_iata, travel_date, to_ingest, metadata)
        except Exception as exc:
            logger.exception("Ingest failed for %s source=%s", label, self.source_code)
            self.failures.append(f"{label}: ingest error: {exc}")
            return None

        if ok and to_ingest:
            self.successes += 1
            logger.info(
                "Ingested search %s source=%s observations=%s",
                label,
                self.source_code,
                result.rows_upserted,
            )
        elif empty:
            self.failures.append(f"{label}: empty results")
            logger.warning("Recorded empty search %s source=%s", label, self.source_code)
        else:
            self.failures.append(f"{label}: {error or 'search failed'}")
            logger.warning("Recorded failed search %s source=%s error=%s", label, self.source_code, error)
        return result

    def finish(self) -> str:
        if self.run_id is None:
            raise RuntimeError("ScrapeCycle.start() must be called before finish()")

        if self.attempted == 0:
            status = "failed"
            error_text = "no searches attempted"
        elif not self.failures:
            status = "success"
            error_text = None
        elif self.successes == 0:
            status = "failed"
            error_text = self._error_text()
        else:
            status = "partial"
            error_text = self._error_text()

        self.ingestor.finish_run(self.run_id, status=status, error_text=error_text)
        logger.info(
            "Finished scrape_run %s status=%s attempted=%s successes=%s failures=%s",
            self.run_id,
            status,
            self.attempted,
            self.successes,
            len(self.failures),
        )
        return status

    def _ingest(
        self,
        origin_iata: str,
        dest_iata: str,
        travel_date: date,
        records: list[dict[str, Any]],
        metadata: dict[str, Any],
    ) -> IngestSearchResult:
        return self.ingestor.ingest_search(
            self.run_id,
            origin_iata,
            dest_iata,
            travel_date,
            records,
            request_metadata=metadata,
        )

    def _error_text(self) -> str:
        preview = "; ".join(self.failures[:20])
        extra = len(self.failures) - 20
        if extra > 0:
            preview = f"{preview} ... ({extra} more)"
        return preview


async def run_search_and_ingest(
    cycle: ScrapeCycle,
    scrape_coro: Awaitable[list[dict[str, Any]]],
    *,
    origin_iata: str,
    dest_iata: str,
    travel_date: date,
    request_metadata: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Run one scrape request, then persist immediately."""
    try:
        records = await scrape_coro
    except Exception as exc:
        logger.exception(
            "Search failed %s->%s %s source=%s",
            origin_iata,
            dest_iata,
            travel_date,
            cycle.source_code,
        )
        cycle.record_search(
            origin_iata,
            dest_iata,
            travel_date,
            [],
            ok=False,
            error=str(exc),
            request_metadata=request_metadata,
        )
        return []

    if not records:
        logger.warning(
            "Empty scrape %s->%s %s source=%s",
            origin_iata,
            dest_iata,
            travel_date,
            cycle.source_code,
        )

    cycle.record_search(
        origin_iata,
        dest_iata,
        travel_date,
        records,
        ok=True,
        request_metadata=request_metadata,
    )
    return records


def _live_ingestor() -> FareIngestor:
    require_database_url()
    return FareIngestor()
