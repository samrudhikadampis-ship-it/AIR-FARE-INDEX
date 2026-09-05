# Matches backend/scraper/cleartrip_scraper.py AIRPORTS — the only reliable city map.
AIRPORT_CITIES: dict[str, str] = {
    "CCU": "Kolkata",
    "BOM": "Mumbai",
    "DEL": "New Delhi",
    "BLR": "Bengaluru",
}

INDEX_BASELINE_FARE = 6000
BOOKING_WINDOW_DAYS: tuple[int, ...] = (1, 7, 15, 30, 45)
SCRAPER_SOURCE = "Cleartrip"
WEEKDAY_NAMES: tuple[str, ...] = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
