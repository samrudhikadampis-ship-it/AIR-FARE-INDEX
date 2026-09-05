import asyncio
import json
import os
import random
import re
from datetime import datetime, timedelta
from pathlib import Path
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

AIRPORTS = {
    "CCU": "Kolkata",
    "BOM": "Mumbai",
    "DEL": "New Delhi",
    "BLR": "Bengaluru"
}

advance_windows = [1, 7, 15, 30, 45]

routes = [
    ("CCU", "BOM"),
    ("DEL", "BLR"),
    ("BOM", "DEL"),
    ("BLR", "BOM")
]

today = datetime.now()


def clean_text(text):
    """Clean excessive whitespace."""
    if not text:
        return ""

    return re.sub(r"\s+", " ", text).strip()


def write_json_atomically(output_path, data):
    """Write JSON without replacing a valid output with a partial file."""

    temporary_path = output_path.with_name(
        f".{output_path.name}.tmp"
    )

    try:

        with open(
            temporary_path,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                data,
                f,
                indent=4,
                ensure_ascii=False
            )

            f.flush()
            os.fsync(f.fileno())

        os.replace(
            temporary_path,
            output_path
        )

    finally:

        if temporary_path.exists():
            temporary_path.unlink()


def ensure_valid_output_file(output_path):
    """Keep the output valid if a scrape is interrupted before saving."""

    try:

        with open(
            output_path,
            "r",
            encoding="utf-8"
        ) as f:

            json.load(f)

    except (
        FileNotFoundError,
        json.JSONDecodeError,
        OSError
    ):

        write_json_atomically(
            output_path,
            []
        )


def extract_price(text):
    """
    Extract Indian airfare from text.

    Examples:
    ₹5,924
    ₹5924
    Rs. 5924
    5924
    """

    patterns = [
        r"₹\s*([\d,]+)",
        r"Rs\.?\s*([\d,]+)",
        r"INR\s*([\d,]+)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            return match.group(1).replace(",", "")

    return None


def extract_times(text):
    """
    Extract departure and arrival times.
    """

    times = re.findall(
        r"\b(?:[01]?\d|2[0-3]):[0-5]\d\b",
        text
    )

    if len(times) >= 2:
        return times[0], times[1]

    return (
        times[0] if len(times) >= 1 else None,
        times[1] if len(times) >= 2 else None
    )


def extract_duration(text):
    """
    Extract duration such as:
    2h 15m
    02h 15m
    2h
    2h 30m
    """

    patterns = [
        r"\b\d{1,2}h\s*\d{1,2}m\b",
        r"\b\d{1,2}h\s*\d{1,2}\s*min\b",
        r"\b\d{1,2}h\b"
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            return clean_text(match.group(0))

    return None


def extract_stops(text):
    """
    Detect stop information.
    """

    if re.search(
        r"\bnon[\s-]?stop\b",
        text,
        re.IGNORECASE
    ):
        return "Non-stop"

    match = re.search(
        r"\b(\d+)\s*stop(?:s)?\b",
        text,
        re.IGNORECASE
    )

    if match:
        stop_count = int(match.group(1))
        suffix = "Stop" if stop_count == 1 else "Stops"
        return f"{stop_count} {suffix}"

    return "Non-stop"


def flight_signature(record):
    """Identify a flight without collapsing legitimate date/route records."""

    return tuple(
        record.get(field)
        for field in (
            "source",
            "destination",
            "date",
            "airline_name",
            "departure_time",
            "arrival_time",
            "duration",
            "price"
        )
    )


def extract_flight_number(text):
    """
    Extract common Indian airline flight-number formats.

    Examples:
    6E-6328
    AI-2955
    QP-2021
    SG-123
    IX-456
    """

    patterns = [
        r"\b(?:6E|AI|IX|QP|SG|UK|I5|G8|S5|9I|2T)-?\d{2,4}\b",
        r"\b[A-Z]{2}-\d{2,4}\b"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            return match.group(0).upper()

    return None


def extract_airline(text, flight_number):
    """
    Try to determine airline name.

    EaseMyTrip commonly displays airline names such as:
    IndiGo
    Air India
    Akasa Air
    SpiceJet
    Air India Express
    """

    known_airlines = [
        "Air India Express",
        "Air India",
        "IndiGo",
        "Akasa Air",
        "AkasaAir",
        "SpiceJet",
        "Alliance Air",
        "Star Air",
        "Fly91",
        "Vistara",
        "Go First",
        "GoAir"
    ]

    text_lower = text.lower()

    for airline in known_airlines:

        if airline.lower() in text_lower:
            return airline

    # If airline is not directly visible,
    # infer from flight code.

    if flight_number:

        code = flight_number.split("-")[0]

        airline_codes = {
            "6E": "IndiGo",
            "AI": "Air India",
            "IX": "Air India Express",
            "QP": "Akasa Air",
            "SG": "SpiceJet",
            "UK": "Vistara",
            "I5": "Air India Express",
            "9I": "Alliance Air"
        }

        return airline_codes.get(code)

    return None


def parse_flight_card(
    card_text,
    from_code,
    to_code,
    date_str,
    current_date_str
):

    card_text = clean_text(card_text)

    if not card_text:
        return None

    # Need at least a price
    price = extract_price(card_text)

    if not price:
        return None

    # Need departure/arrival times
    departure_time, arrival_time = extract_times(card_text)

    if not departure_time:
        return None

    # Flight number
    flight_number = extract_flight_number(card_text)

    # Airline
    airline_name = extract_airline(
        card_text,
        flight_number
    )

    # Duration
    duration = extract_duration(card_text)

    # Stops
    stops = extract_stops(card_text)

    return {
        "airline_name": airline_name,
        "plane_number": flight_number,
        "stops": stops,
        "departure_time": departure_time,
        "arrival_time": arrival_time,
        "duration": duration,
        "price": price,
        "source": from_code,
        "destination": to_code,
        "date": date_str,
        "today": current_date_str
    }


# ============================================================
# BUILD EASEMYTRIP ROUTE URL
# ============================================================

def build_route_url(from_code, to_code):

    from_city = AIRPORTS[from_code].lower().replace(
        " ",
        "-"
    )

    to_city = AIRPORTS[to_code].lower().replace(
        " ",
        "-"
    )

    return (
        f"https://www.easemytrip.com/flights/"
        f"{from_city}-{from_code.lower()}-"
        f"to-"
        f"{to_city}-{to_code.lower()}/"
    )


# ============================================================
# SCRAPE ONE URL
# ============================================================

async def scrape_single_url(
    browser,
    semaphore,
    from_code,
    to_code,
    date_str,
    current_date_str
):

    async with semaphore:

        route_url = build_route_url(
            from_code,
            to_code
        )

        route_flights = []

        page = None
        context = None

        try:

            # Same idea as teammate's random delay
            await asyncio.sleep(
                random.uniform(1.0, 2.0)
            )

            # Browser context
            context = await browser.new_context(

                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 "
                    "(KHTML, like Gecko) "
                    "Chrome/125.0.0.0 "
                    "Safari/537.36"
                ),

                viewport={
                    "width": 1366,
                    "height": 768
                },

                locale="en-IN"
            )

            # Block unnecessary resources
            async def handle_route(route):

                resource_type = route.request.resource_type

                if resource_type in [
                    "image",
                    "media",
                    "font"
                ]:
                    await route.abort()

                else:
                    await route.continue_()

            await context.route(
                "**/*",
                handle_route
            )

            page = await context.new_page()

            print(
                f"\nOpening: "
                f"{from_code}->{to_code}"
            )

            print(
                f"Date requested: {date_str}"
            )

            print(
                f"URL: {route_url}"
            )

            # Load EaseMyTrip route page
            response = await page.goto(
                route_url,
                wait_until="domcontentloaded",
                timeout=45000
            )

            if response:

                print(
                    f"HTTP status: "
                    f"{response.status}"
                )

            # Select the requested date from EaseMyTrip's date slider.
            date_card = page.locator(
                f".calendar-date[data-date='{date_str}']"
            ).first

            if await date_card.count() == 0:
                raise RuntimeError(
                    f"Date {date_str} was not available on the route page"
                )

            expected_search_date = datetime.strptime(
                date_str,
                "%Y-%m-%d"
            ).strftime(
                "%d/%m/%Y"
            )

            async with page.expect_navigation(
                wait_until="domcontentloaded",
                timeout=45000
            ):

                await date_card.click()

            if expected_search_date not in page.url:
                raise RuntimeError(
                    f"EaseMyTrip did not navigate to {date_str}: "
                    f"{page.url}"
                )

            print(
                f"Date search URL: {page.url}"
            )

            # Give JavaScript time to render
            await asyncio.sleep(5)

            # Scroll progressively like teammate's scraper
            for _ in range(5):

                await page.evaluate(
                    "window.scrollBy(0, 1400)"
                )

                await asyncio.sleep(1)

            # One final scroll
            await page.evaluate(
                "window.scrollTo(0, document.body.scrollHeight)"
            )

            await asyncio.sleep(2)

            # Get HTML
            html = await page.content()

            soup = BeautifulSoup(
                html,
                "html.parser"
            )

            # =================================================
            # FIND POSSIBLE FLIGHT CARDS
            # =================================================

            candidate_elements = []

            for element in soup.find_all(True):

                text = clean_text(
                    element.get_text(
                        separator=" ",
                        strip=True
                    )
                )

                if len(text) < 20:
                    continue

                if len(text.split()) > 100:
                    continue

                has_price = bool(
                    re.search(
                        r"₹\s*[\d,]+|Rs\.?\s*[\d,]+|INR\s*[\d,]+",
                        text,
                        re.IGNORECASE
                    )
                )

                has_time = bool(
                    re.search(
                        r"\b(?:[01]?\d|2[0-3]):[0-5]\d\b",
                        text
                    )
                )

                has_duration = bool(
                    re.search(
                        r"\b\d{1,2}h",
                        text,
                        re.IGNORECASE
                    )
                )

                if (
                    has_price
                    and has_time
                    and has_duration
                ):

                    candidate_elements.append(
                        element
                    )

            # =================================================
            # PARSE + DEDUPLICATE
            # =================================================

            seen_signatures = set()

            for element in candidate_elements:

                card_text = clean_text(
                    element.get_text(
                        separator=" ",
                        strip=True
                    )
                )

                record = parse_flight_card(
                    card_text,
                    from_code,
                    to_code,
                    date_str,
                    current_date_str
                )

                if not record:
                    continue

                signature = flight_signature(record)

                if signature in seen_signatures:
                    continue

                seen_signatures.add(signature)

                route_flights.append(record)

            print(
                f"✔ Successfully scraped "
                f"{len(route_flights)} records "
                f"for {from_code}->{to_code} "
                f"on {date_str}"
            )

        except Exception as e:

            print(
                f"✘ Error scraping "
                f"{from_code}->{to_code} "
                f"({date_str}): {e}"
            )

        finally:

            if page:

                try:
                    await page.close()
                except Exception:
                    pass

            if context:

                try:
                    await context.close()
                except Exception:
                    pass

        return route_flights


# ============================================================
# MAIN
# ============================================================

async def main():

    semaphore = asyncio.Semaphore(1)

    output_path = (
        Path(__file__).resolve().parent
        / "easemytrip_flights_data.json"
    )

    ensure_valid_output_file(
        output_path
    )

    current_date_str = today.strftime(
        "%Y-%m-%d"
    )

    all_flights_data = []

    async with async_playwright() as p:

        print("\n===================================")
        print("     EASEMYTRIP FLIGHT SCRAPER")
        print("===================================\n")

        print(
            f"Today's date: "
            f"{current_date_str}"
        )

        print(
            f"Routes: {len(routes)}"
        )

        print(
            f"Date offsets: {advance_windows}"
        )

        print(
            f"Total searches: "
            f"{len(routes) * len(advance_windows)}"
        )

        print()

        browser = await p.chromium.launch(
            headless=True
        )

        tasks = []

        # =====================================================
        # EXACT SAME 4 × 5 STRUCTURE
        # =====================================================

        for from_code, to_code in routes:

            for offset in advance_windows:

                dep = today + timedelta(
                    days=offset
                )

                date_str = dep.strftime(
                    "%Y-%m-%d"
                )

                tasks.append(
                    scrape_single_url(
                        browser,
                        semaphore,
                        from_code,
                        to_code,
                        date_str,
                        current_date_str
                    )
                )

        # Run all searches
        results = await asyncio.gather(
            *tasks
        )

        await browser.close()

        # Flatten results and remove only meaningful duplicates.
        all_signatures = set()

        for sublist in results:

            for record in sublist:

                signature = flight_signature(record)

                if signature in all_signatures:
                    continue

                all_signatures.add(signature)
                all_flights_data.append(record)

    # =========================================================
    # SAVE JSON
    # =========================================================

    write_json_atomically(
        output_path,
        all_flights_data
    )

    print("\n===================================")
    print("              DONE")
    print("===================================")

    print(
        f"Total records saved: "
        f"{len(all_flights_data)}"
    )

    print(
        f"Output file: "
        f"{output_path}"
    )

    print(
        "First records:"
    )

    print(
        json.dumps(
            all_flights_data[:3],
            indent=4,
            ensure_ascii=False
        )
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    asyncio.run(main())