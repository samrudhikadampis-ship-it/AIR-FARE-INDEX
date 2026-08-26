import asyncio
import re
import json
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from datetime import datetime, timedelta
from urllib.parse import urlencode


AIRPORTS = {
    "CCU": "Kolkata",
    "BOM": "Mumbai",
    "DEL": "New Delhi",
    "BLR": "Bengaluru"
}

def generate_cleartrip_url(from_code, to_code, depart_date, return_date=None):
    base_url = "https://www.cleartrip.com/flights/results"
    params = {
        "adults": "1",
        "childs": "0",
        "infants": "0",
        "class": "Economy",
        "depart_date": depart_date.strftime("%d/%m/%Y"),
        "from": from_code,
        "to": to_code,
        "intl": "n",
        "origin": f"{from_code} - {AIRPORTS[from_code]}, IN",
        "destination": f"{to_code} - {AIRPORTS[to_code]}, IN",
        "isCfw": "false",
        "isFF": "false"
    }
    if return_date:
        params["return_date"] = return_date.strftime("%d/%m/%Y")
        params["rnd_one"] = "R"
        
    return f"{base_url}?{urlencode(params)}"

# Generate dynamic search tasks
def generate_search_tasks(days_ahead=7, duration_days=30):
    tasks = []
    start_date = datetime.now() + timedelta(days=days_ahead)
    
    # Example route pairs
    routes = [("CCU", "BOM"), ("DEL", "BLR")]
    
    for from_code, to_code in routes:
        for i in range(duration_days):
            dep = start_date + timedelta(days=i)
            url = generate_cleartrip_url(from_code, to_code, dep)
            tasks.append({
                "from": from_code,
                "to": to_code,
                "date": dep.strftime("%Y-%m-%d"),
                "url": url
            })
    return tasks




CLEARTRIP_URL = (
    "https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&depart_date=28/08/2026&return_date=01/09/2026&from=CCU&to=BOM&intl=n&origin=CCU%20-%20Kolkata,%20IN&destination=BOM%20-%20Mumbai,%20IN&sft=&sd=1787741242175&rnd_one=R&isCfw=false&utm_source=google&utm_medium=cpc&utm_campaign=BR_Cleartrip-Desktab&isFF=false&sourceCountry=Mumbai&destinationCountry=Bengaluru&nonStop="
)

async def scrape_cleartrip(url,source,dest):
    async with async_playwright() as p:
        # Launch Chromium with anti-bot evasion arguments
        browser = await p.chromium.launch(
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            viewport={"width": 1366, "height": 768},
            locale="en-IN",
            timezone_id="Asia/Kolkata"
        )

        # Anti-detection stealth overrides
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        """)

        page = await context.new_page()

        captured_json_payloads = []

        await page.goto(CLEARTRIP_URL,wait_until="domcontentloaded")
        await page.wait_for_timeout(10000)

        html = await page.content()
        soup = BeautifulSoup(html, 'html.parser')

        # Target flight card containers
        target_class = "sc-bdfDLd iGCqqo flex flex-between flex-1"
        cards = soup.find_all(class_=target_class)
        
        # Fallback if class names shift dynamically
        if not cards:
            cards = soup.find_all(
                lambda tag: tag.name == "div" and 
                tag.get("class") and 
                "flex-between" in tag.get("class") and 
                "flex-1" in tag.get("class")
            )

        flights = []

        for card in cards:
            # Extract all text tokens inside the card container
            # Example output string: "Partial Refundable Akasa Air QP-1136 05:10 2h 35m Non-stop 07:45 ₹8,252"
            card_text = card.get_text(separator=" ", strip=True)

            # 1. Extract Price (matches currency symbol + numbers/commas)
            price_match = re.search(r'[₹$]\s?[\d,]+', card_text)
            price = price_match.group(0) if price_match else None

            # 2. Extract Timings (matches HH:MM formats like 05:10 and 07:45)
            times = re.findall(r'\b\d{2}:\d{2}\b', card_text)
            departure_time = times[0] if len(times) >= 1 else None
            arrival_time = times[1] if len(times) >= 2 else None

            # 3. Extract Duration (e.g., 2h 35m)
            duration_match = re.search(r'\b\d+h\s*\d+m\b', card_text)
            duration = duration_match.group(0) if duration_match else None

            

            # Append structured item
            flights.append({
                "departure_time": departure_time,
                "arrival_time": arrival_time,
                "duration": duration,
                "price": price,
                "source": AIRPORTS[source],
                "destination": AIRPORTS[dest]
            })

        await context.close()
        await browser.close()

        return flights

    

if __name__ == "__main__":
    search_batch = generate_search_tasks(days_ahead=14, duration_days=3)
    print(search_batch)
    data = asyncio.run(scrape_cleartrip(search_batch[4]["url"],search_batch[4]["from"],search_batch[4]["to"])) 
    exr_json = json.dumps(data, indent=2, ensure_ascii=False)
    print(exr_json)



