# Matches backend/scraper/cleartrip_scraper.py AIRPORTS — the only reliable city map.
AIRPORT_CITIES: dict[str, str] = {
    "CCU": "Kolkata",
    "BOM": "Mumbai",
    "DEL": "New Delhi",
    "BLR": "Bengaluru",
}

AIRPORT_NAMES: dict[str, str] = {
    "CCU": "Netaji Subhas Chandra Bose International Airport",
    "BOM": "Chhatrapati Shivaji Maharaj International Airport",
    "DEL": "Indira Gandhi International Airport",
    "BLR": "Kempegowda International Airport",
}

# (code, name, kind) — scrape source is not an airline.
SCRAPE_SOURCE_SEEDS: tuple[tuple[str, str, str], ...] = (
    ("CLEARTRIP", "Cleartrip", "ota"),
    ("EASEMYTRIP", "EaseMyTrip", "ota"),
)

TRACKED_ROUTES: tuple[tuple[str, str], ...] = (
    ("CCU", "BOM"),
    ("DEL", "BLR"),
    ("BOM", "DEL"),
    ("BLR", "BOM"),
)

DEFAULT_ROUTE_WEIGHT = 1
ROUTE_WEIGHT_METHOD = "equal"
ROUTE_WEIGHT_EFFECTIVE_FROM = "2020-01-01"

INDEX_BASELINE_FARE = 6000
BOOKING_WINDOW_DAYS: tuple[int, ...] = (1, 7, 15, 30, 45)
SCRAPER_SOURCE = "Cleartrip"
WEEKDAY_NAMES: tuple[str, ...] = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
