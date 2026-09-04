# PlanetX — AI-Driven Exoplanet Detection

**PlanetX** is an end-to-end machine learning pipeline for detecting exoplanet candidates from NASA TESS (Transiting Exoplanet Survey Satellite) 2-minute cadence light curves. It combines classical astrophysical transit detection (Box Least Squares) with a Random Forest classifier to classify signals into four categories, and surfaces results through a real-time Next.js dashboard.

- **Backend:** FastAPI + Python scientific stack (lightkurve, astropy, scikit-learn, scipy)
- **Frontend:** Next.js 16 + TypeScript + Tailwind-style custom design system
- **Classification accuracy:** 97% on held-out test data

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Running the Application](#running-the-application)
8. [API Reference](#api-reference)
9. [Using the Frontend](#using-the-frontend)
10. [Running the CLI Pipeline](#running-the-cli-pipeline)
11. [Outputs & Caching](#outputs--caching)
12. [Data & Model Notes](#data--model-notes)
13. [Known Limitations](#known-limitations)
14. [Contributing](#contributing)

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     PlanetX System                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐     POST /analyze      ┌─────────────┐ │
│  │  Next.js    │ ──────────────────────▶ │   FastAPI   │ │
│  │  Dashboard  │ ◀────────────────────── │   Backend   │ │
│  └─────────────┘     JSON result         └──────┬──────┘ │
│         ▲                                        │        │
│         │                                        ▼        │
│         │                              ┌─────────────────┐│
│         │                              │ PlanetX Pipeline ││
│         │                              │ 1. Ingest       ││
│         │                              │ 2. Preprocess   ││
│         │                              │ 3. BLS Detect   ││
│         │                              │ 4. Classify     ││
│         │                              │ 5. Fit Params   ││
│         │                              │ 6. Visualize    ││
│         │                              └────────┬────────┘│
│         │                                       │         │
│         │                              ┌────────▼────────┐│
│         │                              │  outputs/       ││
│         │                              │  result_TIC*.json│
│         │                              │  planetx_TIC*.png││
│         │                              └─────────────────┘│
│         │ GET /results, /result/{id}, /stats              │
└─────────┼─────────────────────────────────────────────────┘┘
          │
          ▼
   NASA MAST Archive
   (TESS SPOC Light Curves)
```

---

## Features

### Backend Pipeline
- **Data Ingestion:** Downloads SPOC-calibrated TESS light curves from the NASA MAST archive via `lightkurve`.
- **Preprocessing:** 5σ outlier clipping, median normalization, and Savitzky-Golay detrending with a 101-cadence window (~200 minutes).
- **Transit Detection:** Box Least Squares (BLS) periodogram scanning periods from 0.5 to 14 days with transit durations of 30–200 minutes.
- **Classification:** Random Forest trained on 7 photometric features — period, depth, duration, SNR, depth ratio, duty cycle, and scatter. Achieves ~97% accuracy across four classes.
- **Parameter Fitting:** Trapezoidal transit model fitted via bounded least squares; period refinement and duration validation against Kepler's third law.
- **Visualization:** 4-panel diagnostic figure (raw light curve, detrended flux, BLS periodogram, phase-folded transit).
- **REST API:** FastAPI endpoints for analysis, cached results, batch listing, stats, and static file serving.

### Frontend Application
- **Landing Page:** Deep-space animated hero with canvas starfield, twinkling stars, floating asteroid outlines, meteor streaks, custom orange cursor, and orbital ring decorations.
- **Dashboard:** Interactive pipeline runner with TIC ID input, 3 quick-select reference targets, animated 6-stage progress tracker, and rich result visualization.
- **Results:** Auto-refreshing batch results table with summary counters, row selection, and cached result detail view.
- **Docs:** Static documentation covering API reference, pipeline stages, signal classes, physics formulas, uncertainty estimation, known limitations, and tech stack.

---

## Tech Stack

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Python | 3.9+ | Runtime |
| FastAPI | Latest | REST API server |
| lightkurve | 2.6 | TESS light curve download |
| astropy | 8.0 | Units, timeseries, BLS |
| scikit-learn | 1.3 | Random Forest classifier |
| scipy | 1.10 | Transit model fitting |
| numpy | Latest | Array operations |
| uvicorn | Latest | ASGI server |

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 16 | React framework |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Utility CSS (via PostCSS) |
| Lucide React | 1.21 | Icons |
| Recharts | 3.8 | Data visualization |

---

## Project Structure

```
PlanetX_backup/
├── main.py                 # CLI entry point for standalone pipeline runs
├── .gitignore
├── .kilo/
│   └── kilo.jsonc          # Kilo agent configuration
│
├── backend/
│   ├── api/
│   │   └── main.py         # FastAPI application and endpoints
│   ├── backend/
│   │   └── src/            # Python package root (sys.path entry)
│   ├── src/
│   │   ├── ingestion/
│   │   │   └── load_data.py
│   │   ├── preprocessing/
│   │   │   └── clean_lightcurve.py
│   │   ├── detection/
│   │   │   ├── transit_detector.py   # BLS implementation
│   │   │   └── signal_classifier.py  # Random Forest classifier
│   │   ├── fitting/
│   │   │   ├── period_estimator.py
│   │   │   ├── depth_calculator.py
│   │   │   └── transit_duration.py
│   │   ├── models/                  # Trained model checkpoints
│   │   │   ├── classifier.pkl
│   │   │   └── scaler.pkl
│   │   └── visualization/
│   │       └── plot_lightcurve.py   # 4-panel diagnostic figure
│   ├── data/
│   │   └── raw/             # Downloaded FITS files (gitignored)
│   ├── outputs/             # Generated JSON results and PNG figures
│   │   └── result_TIC*.json
│   │   └── planetx_TIC*.png
│   └── venv/                # Python virtual environment (gitignored)
│
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── .gitignore
    │
    ├── app/
    │   ├── layout.tsx        # Root layout with metadata
    │   ├── globals.css       # Global styles, fonts, animations
    │   ├── page.tsx          # Landing page
    │   ├── Dashboard/
    │   │   └── page.tsx      # Main analysis page
    │   ├── Results/
    │   │   └── page.tsx      # Batch results table
    │   └── Docs/
    │       └── page.tsx      # Documentation page
    │
    └── components/
        ├── Cursor.tsx        # Custom cursor overlay
        ├── Navbar.tsx        # Fixed navigation bar
        ├── Footer.tsx        # Site footer
        ├── SpaceBackground.tsx # Canvas animation (stars, asteroids, meteors)
        └── Pipeline.tsx      # 6-stage progress indicator
```

---

## Prerequisites

- **Python 3.9+** with `pip`
- **Node.js 18+** and `npm`
- **Git**
- Internet connection (for downloading TESS light curves from NASA MAST on first run)
- ~2 GB free disk space for dependencies and cached data

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/PlanetX_backup.git
cd PlanetX_backup
```

### 2. Backend Setup

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn lightkurve astropy scikit-learn scipy numpy

# Create outputs directory
mkdir outputs
```

**Note:** If `backend/models/classifier.pkl` and `backend/models/scaler.pkl` do not exist, they will be auto-generated on the first API startup or CLI run (training takes ~30 seconds).

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

---

## Running the Application

You need **two terminal windows** — one for the backend and one for the frontend.

### Terminal 1 — Backend (FastAPI)

```bash
cd backend
.\venv\Scripts\activate   # Windows PowerShell
# source venv/bin/activate  # macOS / Linux

uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

- API will be available at `http://localhost:8000`
- Interactive docs at `http://localhost:8000/docs`
- Static files served at `http://localhost:8000/outputs/`

### Terminal 2 — Frontend (Next.js)

```bash
cd frontend
npm run dev
```

- App will be available at `http://localhost:3000`
- Hot reloading enabled in development mode

---

## API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Run full PlanetX pipeline on a TIC target |
| `GET` | `/result/{tic_id}` | Retrieve cached analysis result by TIC ID |
| `GET` | `/results` | List all cached analysis results |
| `GET` | `/stats` | Dashboard counters (totals per class) |
| `GET` | `/outputs/planetx_TIC{id}.png` | Serve diagnostic figure PNG |
| `DELETE` | `/result/{tic_id}` | Delete a cached result and its figure |

### POST /analyze

**Request Body:**
```json
{
  "tic_id": 25155310
}
```

**Response (200 OK):**
```json
{
  "tic_id": 25155310,
  "name": "PlanetX",
  "classification": "PLANET CANDIDATE",
  "confidence": 92.4,
  "probabilities": {
    "PLANIDATE": 92.4,
    "ECLIPSING BINARY": 5.1,
    "BLEND": 1.8,
    "NOISE / OTHER": 0.7
  },
  "parameters": {
    "period_days": 3.90870,
    "period_err_days": 0.00012,
    "depth_ppm": 850.32,
    "depth_err_ppm": 45.10,
    "duration_hrs": 2.450,
    "snr": 18.92,
    "scatter_ppm": 1200.45,
    "radius_ratio": 0.00921,
    "n_points": 18540,
    "fit_quality": "good"
  },
  "quality": {
    "confidence": "HIGH",
    "score": 95,
    "flags": []
  },
  "duration_validation": {
    "flag": "NORMAL",
    "interpretation": "Duration consistent with planetary transit"
  },
  "figure_url": "/outputs/planetx_TIC25155310.png"
}
```

---

## Using the Frontend

1. Open `http://localhost:3000` in your browser.
2. **Landing Page** — Read the project overview, pipeline summary, and science background. Click **"Analyze a Star"** or **"Launch Pipeline"**.
3. **Dashboard** — Enter a TIC ID or click one of the quick-select chips (WASP-126b, TOI-700, Known EB). Click **"Run Pipeline"**. The 6-stage tracker will animate. When complete, you will see:
   - Classification banner with confidence and color-coded probability bars
   - Parameter cards (Period, Depth, Duration, SNR)
   - Signal quality badge and flags
   - 4-panel diagnostic figure
   - Star information (MAST link, radius ratio interpretation, period/SNR context)
   - Technical analysis (depth ratio, duty cycle, scatter, classification rationale)
4. **Results** — View all cached results in a sortable table. Click any row to load the full cached result. Auto-refreshes every 30 seconds.
5. **Docs** — Read the API reference, pipeline stages, signal classes, science formulas, uncertainty estimation, known limitations, and tech stack.

---

## Running the CLI Pipeline

You can run the pipeline directly from Python without the web interface.

```bash
cd backend
.\venv\Scripts\activate
python main.py --tic 25155310
```

### CLI Options

```bash
# Single TIC target
python main.py --tic 25155310

# Batch from a text file (one TIC ID per line)
python main.py --ticlist targets.txt --limit 20

# Run demo on 3 known targets
python main.py --demo
```

### Example Output

```
================================================
  PLANETX SUMMARY — 3/3 stars processed
================================================
  TIC ID           Classification        Conf%    Period(d)      SNR
  ------------------------------------------------------------
  25155310         PLANET CANDIDATE      92.4     3.90870        18.9
  207141131        PLANET CANDIDATE      88.1     10.34720       22.3
  318937509        ECLIPSING BINARY      96.7     0.98340        45.1

  Breakdown:
    ECLIPSING BINARY : 1  █
    PLANET CANDIDATE : 2  ██
================================================
```

---

## Outputs & Caching

All pipeline outputs are stored in `backend/outputs/`:

| File | Description |
|------|-------------|
| `result_TIC{id}.json` | Full analysis result with parameters, probabilities, quality flags |
| `planetx_TIC{id}.png` | 4-panel diagnostic figure (PNG) |

The FastAPI server serves these files statically at `/outputs/...`. The Results page and Dashboard figure image both load from this directory.

---

## Data & Model Notes

- **Light curves** are fetched from the NASA MAST archive using `lightkurve`. On first run for a target, data is downloaded and cached under `backend/data/raw/`.
- **Classifier model** (`backend/models/classifier.pkl`) and **scaler** (`backend/models/scaler.pkl`) are trained on first startup if not present. Training uses synthetic data generated to match TESS-like noise distributions.
- The pipeline supports **any TIC target** with available TESS 2-minute SPOC data. Multi-sector data is preferred for longer-period planets.

---

## Known Limitations

1. TESS 2-minute cadence limits detection of short-period (< 1 day) planets with very shallow transits.
2. BLS is less sensitive to eccentric orbits or grazing transits; it assumes a periodic, box-shaped signal.
3. The Random Forest classifier is trained on synthetic data with simplified noise models; performance on real TESS data may vary.
4. Single-sector TESS data cannot distinguish between true exoplanets and systematic trends or stellar variability.
5. Radius ratio assumes a known stellar radius from Gaia; incorrect stellar parameters propagate directly into planet radius estimates.

---

## Contributing

This project was built during the **Bharatiya Antariksh Hackathon 2026 — PS-07**.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Make your changes. Ensure backend Python code passes linting and frontend TypeScript compiles (`npx tsc --noEmit`).
4. Run the full pipeline on a test TIC target to verify end-to-end behavior.
5. Commit with a descriptive message.
6. Open a pull request.

---

## License

MIT — see `LICENSE` for details.

---

*Built with lightkurve 2.6 · astropy 8.0 · FastAPI · Next.js 16 · TypeScript 5*
