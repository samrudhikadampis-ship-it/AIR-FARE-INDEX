from typing import Any, Protocol


class QuoteStore(Protocol):
    """Replaceable persistence port. JSON now; PostgreSQL later."""

    def load_raw(self) -> list[dict[str, Any]]:
        """Return scraper-shaped records. Never expose this to the client."""
        ...
