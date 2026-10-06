# Crop and Farm Data Management System

A focused implementation of **SRS FR-02: Crop and Field Data Management** for the AI-based Irrigation Advisory System for Sugarcane Crop.

The application deliberately contains no login, irrigation advisory, weather, notification, or administration modules. It demonstrates only the required farm and crop data workflow: enter, validate, save, retrieve, update, display, and export.

## Features

- Dashboard overview with farm count, total area, leading growth stage, and common variety
- Mandatory validation for farm name, location, positive area, variety, soil type, plantation date, and growth stage
- SQLite persistence through a Python API
- Search and growth-stage filtering
- Server-backed pagination with exactly 10 farm records per page
- Record detail view, update, and confirmed deletion
- CSV export of saved records
- Responsive React interface with subtle page and interaction animations
- One-click demo form fill for **Sugarcane Farm - Plot A**
- Local location autocomplete for common Maharashtra farming regions
- Thirty-two sample farm and crop records available immediately for dashboard and CSV demonstrations

## Technology

- Frontend: React, Vite, Lucide icons, CSS
- Backend: Python, Flask
- Database: SQLite
- Tests: Python `unittest`

## Project structure

```text
backend/
  app.py             Flask API and production frontend server
  database.py        SQLite connection and schema
  validation.py      FR-02 server-side validation
src/
  components/        Reusable React interface components
  lib/api.js         API client
  App.jsx            Application state and workflows
  constants.js       Domain options and display helpers
  styles.css         Responsive visual system and animations
tests/
  test_api.py        API and database workflow tests
```

## Run locally

Prerequisites: Node.js 18+ and Python 3.10+.

```bash
python -m pip install -r requirements.txt
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend proxies API requests to Flask at `http://127.0.0.1:5000`.

For a production-style run:

```bash
npm run build
python backend/app.py
```

Then open `http://127.0.0.1:5000`.

## Live demo flow

1. Open **Farm & Crop Records** from the sidebar.
2. Select **Add record**.
3. Choose **Use demo data** to fill Sugarcane Farm - Plot A.
4. Save the record and observe the SQLite confirmation.
5. Open the saved record to retrieve and display all details.
6. Select **Edit this record**, change the crop growth stage, and save.
7. Reopen the record to display the updated value.

## Tests

```bash
npm test
```

The test suite uses temporary SQLite databases and verifies mandatory validation, sample-data seeding, creation, retrieval, update, dashboard aggregation, CSV export, and deletion.
