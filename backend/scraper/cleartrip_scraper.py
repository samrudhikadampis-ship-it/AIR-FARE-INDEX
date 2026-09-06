import asyncio
import json
import random
import re
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.storage.scrape_cycle import SOURCE_CLEARTRIP, ScrapeCycle, run_search_and_ingest

AIRPORTS = {"CCU": "Kolkata", "BOM": "Mumbai", "DEL": "New Delhi", "BLR": "Bengaluru"}
advance_windows = [1, 7, 15, 30, 45]
routes = [("CCU", "BOM"), ("DEL", "BLR"), ("BOM", "DEL"), ("BLR", "BOM")]
today = datetime.now()

def parse_flight_card(card_text, from_code, to_code, date_str, current_date_str):
    if not card_text:
        return None

    plane_match = re.search(r'\b[A-Z0-9]{2,3}-\d{3,4}\b', card_text)
    plane_number = plane_match.group(0) if plane_match else None

    airline_name = None
    if plane_number and plane_number in card_text:
        parts = card_text.split(plane_number)
        if parts[0]:
            clean_name = re.sub(r'(Partial Refundable|Refundable|Non-Refundable|Economy)', '', parts[0]).strip()
            if len(clean_name) > 2:
                airline_name = clean_name[-20:].strip()

    times = re.findall(r'\b\d{2}:\d{2}\b', card_text)
    departure_time = times[0] if len(times) >= 1 else None
    arrival_time = times[1] if len(times) >= 2 else None

    duration_match = re.search(r'\b\d{1,2}h\s*\d{0,2}m?\b', card_text)
    duration = duration_match.group(0) if duration_match else None

    stops_match = re.search(r'(\d+\s*stop(?:s)?|non-stop)', card_text, re.IGNORECASE)
    stops = stops_match.group(0) if stops_match else "Non-stop"

    price_match = re.search(r'₹([\d,]+)', card_text)
    price = price_match.group(1) if price_match else None

    if not departure_time or not price:
        return None

    return {
        "airline_name": airline_name,
        "plane_number": plane_number,
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

async def scrape_single_url(browser, semaphore, from_code, to_code, date_str, dep_date_formatted, current_date_str):
    async with semaphore:
        url = f"https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&depart_date={dep_date_formatted}&from={from_code}&to={to_code}&intl=n&origin={from_code}+-+{AIRPORTS[from_code]},+IN&destination={to_code}+-+{AIRPORTS[to_code]},+IN&rnd_one=O&isCfw=false"
        
        route_flights = []
        page = None
        try:
            await asyncio.sleep(random.uniform(1.0, 2.0))

            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            )
            
            await context.route(
                "**/*",
                lambda route: route.abort()
                if route.request.resource_type in ["image", "media", "font", "imageset"]
                else route.continue_()
            )

            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)

            await page.wait_for_selector("text=₹", timeout=12000)

            try:
                await page.locator("svg:has(path[d='M18 6l-6 6m0 0l-6 6m6-6L6 6m6 6l6 6'])").first.click(timeout=3000)
                await page.wait_for_load_state("domcontentloaded", timeout=5000)
            except Exception:
                pass
            
            await page.evaluate("window.scrollBy(0, 7000)")
            await asyncio.sleep(1)

            html = await page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            valid_flight_cards = []
            for element in soup.find_all(True):
                text = element.get_text(separator=" ", strip=True)
                if re.search(r'\b\d{2}:\d{2}\b', text) and re.search(r'\d+h', text) and '₹' in text:
                    if len(text.split()) < 70: 
                        valid_flight_cards.append(element)

            seen_signatures = set()
            for card in valid_flight_cards:
                card_text = card.get_text(separator=" ", strip=True)
                record = parse_flight_card(card_text, from_code, to_code, date_str, current_date_str)
                
                if record:
                    signature = f"{record['departure_time']}-{record['arrival_time']}-{record['price']}-{record['airline_name']}"
                    if signature not in seen_signatures:
                        seen_signatures.add(signature)
                        route_flights.append(record)

            print(f"Successfully scraped {len(route_flights)} records for {from_code}->{to_code} on {date_str}")

        except Exception as e:
            print(f"Error scraping {from_code}->{to_code} ({date_str}): {e}")
            raise
        finally:
            if page:
                await page.close()

        return route_flights

async def main():
    semaphore = asyncio.Semaphore(1)  
    current_date_str = today.strftime("%Y-%m-%d")
    cycle = ScrapeCycle(
        SOURCE_CLEARTRIP,
        collected_on=today.date(),
        target_windows=advance_windows,
    )
    cycle.start()
    all_flights_data = []

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            tasks = []
            for from_code, to_code in routes:
                for offset in advance_windows:
                    dep = today + timedelta(days=offset)
                    date_str = dep.strftime("%Y-%m-%d")
                    dep_date_formatted = dep.strftime("%d/%m/%Y")
                    url = (
                        f"https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0"
                        f"&class=Economy&depart_date={dep_date_formatted}&from={from_code}&to={to_code}"
                        f"&intl=n&origin={from_code}+-+{AIRPORTS[from_code]},+IN"
                        f"&destination={to_code}+-+{AIRPORTS[to_code]},+IN&rnd_one=O&isCfw=false"
                    )
                    tasks.append(
                        run_search_and_ingest(
                            cycle,
                            scrape_single_url(
                                browser, semaphore, from_code, to_code, date_str, dep_date_formatted, current_date_str
                            ),
                            origin_iata=from_code,
                            dest_iata=to_code,
                            travel_date=dep.date(),
                            request_metadata={
                                "url": url,
                                "window_days": offset,
                                "passengers": 1,
                                "cabin": "economy",
                            },
                        )
                    )

            results = await asyncio.gather(*tasks)
            await browser.close()

        all_flights_data = [flight for sublist in results for flight in sublist]

        if all_flights_data:
            file_path = 'fast_flights_data.json'

            if not os.path.exists(file_path) or os.path.getsize(file_path) <= 4:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(all_flights_data, f, indent=4, ensure_ascii=False)
            else:
                with open(file_path, 'rb+') as f:
                    f.seek(0, 2)
                    while f.tell() > 0:
                        f.seek(-1, 1)
                        char = f.read(1)
                        if char == b']':
                            f.seek(-1, 1)
                            f.truncate()
                            break
                        f.seek(-1, 1)

                with open(file_path, 'a', encoding='utf-8') as f:
                    new_data_str = json.dumps(all_flights_data, indent=4, ensure_ascii=False)
                    f.write(",\n" + new_data_str[1:])

        print(f"\nDone! Total records saved: {len(all_flights_data)}")
    finally:
        status = cycle.finish()
        print(f"PostgreSQL scrape_run {cycle.run_id} status={status}")

if __name__ == "__main__":
    asyncio.run(main())