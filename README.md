# AIR-FARE-INDEX

## Overview

AIR-FARE-INDEX is a project focused on developing an Airfare Price Index to analyze and track changes in domestic air travel fares across India.

The project aims to provide a centralized platform for collecting, processing, and visualizing airfare data to identify price trends and patterns.

## Project Status

🚧 **Work in Progress**

The project is currently under active development, with the frontend, backend, data collection, and analysis components being developed and integrated.

## Key Components

- Airfare data collection and processing
- Airfare Price Index calculation and analysis
- Route-wise fare insights
- Price trend visualization
- Data exploration and analytics
- Dashboard for monitoring airfare patterns

## Preview

### Dashboard

![Dashboard](images/dashboard.png)
__

### Data Explorer

![Data Explorer](images/data-explorer.png)

### Price Trends

![Data Explorer](images/price_drivers.png)

## Technology

The project uses a combination of frontend, backend, data processing, and database technologies to build the complete system.

## Team

Developed as a collaborative project for the study and analysis of airfare pricing in India.

---

**AIR-FARE-INDEX** — Tracking and understanding airfare trends across India.


````markdown
# AIR-FARE-INDEX

Real-time Airfare Price Index for India using automated web scraping, PostgreSQL, FastAPI, and React.

## 1. Project Architecture

```text
Airline / OTA Websites
        ↓
   Web Scrapers
        ↓
 ScrapeCycle / Ingestion
        ↓
    PostgreSQL
        ↓
     FastAPI
        ↓
   React Dashboard
````

Current scrape sources:

* Cleartrip
* EaseMyTrip

Current tracked routes:

* CCU → BOM
* DEL → BLR
* BOM → DEL
* BLR → BOM

Current booking windows:

* T+1
* T+7
* T+15
* T+30
* T+45

---

# 2. Requirements

Install:

* Git
* Python 3
* Node.js + npm
* PostgreSQL
* Chromium / Playwright browser

Check installations:

```powershell
git --version
python --version
node --version
npm --version
```

---

# 3. Clone the Repository

```powershell
git clone https://github.com/samrudhikadampis-ship-it/AIR-FARE-INDEX.git
cd AIR-FARE-INDEX
```

Create a feature branch before making changes:

```powershell
git checkout -b feature/your-feature-name
```

---

# 4. Backend Setup

```powershell
cd backend
pip install -r requirements.txt
```

Install the Playwright browser if required:

```powershell
python -m playwright install chromium
```

---

# 5. PostgreSQL Setup

Make sure PostgreSQL is running.

```powershell
Get-Service postgresql*
```

If needed:

```powershell
Start-Service postgresql-x64-18
```

Create the database once:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost
```

Then inside `psql`:

```sql
CREATE DATABASE airfare_index;
\q
```

If the database already exists, DO NOT recreate it.

---

# 6. Configure the Database

From `backend`:

```powershell
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/airfare_index"
```

Replace `YOUR_PASSWORD` with the local PostgreSQL password.

**Never commit real database credentials to GitHub.**

Use `.env.example` for safe placeholders.

---

# 7. Run Migrations

From `backend`:

```powershell
python -m alembic upgrade head
```

This creates/updates the PostgreSQL schema.

Do not manually recreate tables if Alembic migrations already exist.

---

# 8. Import Existing JSON Data

If setting up a fresh local database and existing JSON data needs to be imported:

```powershell
python -m app.cli.backfill
```

Backfill imports:

```text
Cleartrip JSON → CLEARTRIP
EaseMyTrip JSON → EASEMYTRIP
```

Backfill is designed to be idempotent, so running it again should not continually create duplicates.

Do NOT delete the database before running backfill.

---

# 9. Important Data Rules

`source` in the original scraper JSON represents the ORIGIN airport.

Example:

```text
source = DEL
destination = BLR
```

It does NOT mean Cleartrip/EaseMyTrip.

The database separately tracks the scrape source:

```text
CLEARTRIP
EASEMYTRIP
```

The same flight found on two websites is intentionally stored as two observations:

```text
CLEARTRIP  → 6E123 → ₹5000
EASEMYTRIP → 6E123 → ₹5200
```

These are NOT duplicates.

Same source + same flight + same travel date + same collection day should not create accidental duplicates.

Different collection days should create historical observations.

Price is NOT part of observation identity.

---

# 10. Run the Backend API

From:

```text
AIR-FARE-INDEX/backend
```

set the database:

```powershell
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/airfare_index"
```

Start FastAPI:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Keep this terminal open.

Expected:

```text
Uvicorn running on http://127.0.0.1:8000
```

---

# 11. Test the Backend

Open another PowerShell.

```powershell
Invoke-WebRequest "http://127.0.0.1:8000/api/v1/quotes?limit=1" -UseBasicParsing
```

A working API should return:

```text
StatusCode : 200
```

and JSON containing fare data.

Useful API endpoints:

```text
GET /api/v1/quotes
GET /api/v1/routes
GET /api/v1/routes/{route_id}/quotes
GET /api/v1/routes/{route_id}/trend
GET /api/v1/index/snapshot
GET /api/v1/index/trend
GET /api/v1/index/booking-windows
GET /api/v1/index/day-of-week
GET /api/v1/heatmap/sectors
GET /api/v1/collection/summary
```

Example pagination:

```text
http://127.0.0.1:8000/api/v1/quotes?page=1&page_size=50
```

---

# 12. Run the Frontend

Open a NEW PowerShell:

```powershell
cd frontend
npm install
```

Set the backend URL:

```powershell
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000"
```

Start Vite:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

---

# 13. Normal Daily Development

You normally need two terminals.

### Terminal 1 — Backend

```powershell
cd AIR-FARE-INDEX\backend

$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/airfare_index"

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Terminal 2 — Frontend

```powershell
cd AIR-FARE-INDEX\frontend

$env:VITE_API_BASE_URL = "http://127.0.0.1:8000"

npm run dev -- --host 127.0.0.1 --port 5173
```

Then visit:

```text
http://127.0.0.1:5173
```

---

# 14. Running the Scrapers

The scrapers now use the same ingestion pipeline as the rest of the application:

```text
Scraper
   ↓
ScrapeCycle
   ↓
FareIngestor
   ↓
PostgreSQL
```

Before running a scraper:

```powershell
cd AIR-FARE-INDEX\backend

$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/airfare_index"
```

Install dependencies if necessary:

```powershell
pip install -r requirements.txt
python -m playwright install chromium
```

Run the scraper using the entry point defined in:

```text
backend/scraper/cleartrip_scraper.py
backend/scraper/easemytrip_scraper.py
```

Cleartrip:

```powershell
python -m scraper.cleartrip_scraper
```

EaseMyTrip:

```powershell
python -m scraper.easemytrip_scraper
```

The scraper writes through the ingestion layer into PostgreSQL.

Do not manually insert scraper results into the database.

---

# 15. Important: Local vs Shared Database

If a teammate uses:

```text
localhost:5432
```

they are using PostgreSQL on THEIR computer.

Their scraper will therefore write to their local database.

```text
Teammate laptop
      ↓
localhost
      ↓
Their PostgreSQL
```

It will NOT automatically write to your database.

For the whole team to share one database, use a shared PostgreSQL server and give each developer a `DATABASE_URL` pointing to that shared server.

```text
Teammate A ─┐
Teammate B ─┼──→ Shared PostgreSQL
Teammate C ─┘
```

Never commit the shared database credentials.

---

# 16. Tests

From `backend`:

```powershell
python -m pytest -v
```

The test suite currently covers areas such as:

* ingestion lifecycle
* duplicate protection
* same-day idempotency
* historical observations
* source separation
* failed searches
* PostgreSQL store
* API contracts
* store selection
* pagination

Always run tests before pushing backend changes.

---

# 17. Port 8000 Already in Use

If you see:

```text
[WinError 10048]
only one usage of each socket address...
```

another process is already using port 8000.

Check:

```powershell
netstat -ano | findstr :8000
```

Example:

```text
TCP  127.0.0.1:8000  ...  LISTENING  2132
```

Check the process:

```powershell
tasklist /FI "PID eq 2132"
```

If it is already a `python.exe`/Uvicorn process, the backend may already be running.

Do NOT start another backend on port 8000.

Test it instead:

```powershell
Invoke-WebRequest "http://127.0.0.1:8000/api/v1/quotes?limit=1" -UseBasicParsing
```

---

# 18. Git Workflow

Check status:

```powershell
git status
```

See changes:

```powershell
git diff
```

Add changes:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Describe the change"
```

Push your feature branch:

```powershell
git push -u origin feature/your-feature-name
```

Create a Pull Request into the appropriate branch.

Avoid directly modifying `main` unless the team workflow specifically requires it.

---

# 19. Safety Rules

### DO

* Use PostgreSQL as the primary database.
* Use Alembic for schema changes.
* Keep historical observations.
* Keep Cleartrip and EaseMyTrip observations separate.
* Add tests for meaningful backend changes.
* Use environment variables for credentials.
* Work on feature branches.
* Pull the latest changes before major work.

### DO NOT

* Delete or truncate the database.
* Reset PostgreSQL just because something fails.
* Insert fake fare data.
* Put real passwords in Git.
* Commit `.env` files containing credentials.
* Treat Cleartrip and EaseMyTrip observations as duplicates.
* Put scrape-source names into the quote `source` field.
* Rewrite working architecture unnecessarily.
* Replace PostgreSQL with mock data.

---

# 20. Quick Start

For an already-configured machine:

### Terminal 1

```powershell
cd AIR-FARE-INDEX\backend
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/airfare_index"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Terminal 2

```powershell
cd AIR-FARE-INDEX\frontend
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000"
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

### To run a scraper

```powershell
cd AIR-FARE-INDEX\backend
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/airfare_index"
python -m scraper.cleartrip_scraper
```

or:

```powershell
python -m scraper.easemytrip_scraper
```

### To run tests

```powershell
cd AIR-FARE-INDEX\backend
python -m pytest -v
```

### To apply database migrations

```powershell
cd AIR-FARE-INDEX\backend
python -m alembic upgrade head
```

### To backfill existing JSON data

```powershell
cd AIR-FARE-INDEX\backend
python -m app.cli.backfill
```

---

# 21. Current Known Limitations

* Current scraper coverage is limited to the configured routes.
* Data Explorer uses server-side pagination.
* Explorer sorting is currently limited to the current page.
* Price Drivers does not have an external fuel/festival feed yet.
* Hourly health metrics require additional collection/monitoring data.
* A shared remote PostgreSQL database is required if multiple teammates need to write to the same live dataset.

The current system is designed so that additional scrape sources, routes, airlines, and data feeds can be added without replacing the PostgreSQL → FastAPI → React architecture.

```
```
