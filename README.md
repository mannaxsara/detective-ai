# 🔍 DetectiveAI — Autonomous Data Intelligence Platform

![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?style=for-the-badge&logo=fastapi)
![Polars](https://img.shields.io/badge/Polars-1.18.0-blue?style=for-the-badge&logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **DetectiveAI** is an autonomous business intelligence and data analyst assistant. Upload tabular data files (CSV, Excel, JSON, Parquet) and instantly receive automated schema profiling, interactive AI Q&A analysis, ARIMA time-series forecasts, Isolation Forest anomaly clusters, 5-Whys root-cause trees, and executive PDF/DOCX report exports.

---

## ⚡ Deployment Modes: Free Cloud Tier vs Local Full Potential

DetectiveAI is built to run seamlessly in two deployment configurations:

| Feature / Environment | ☁️ Live Demo (Free Cloud Tier) | ⚡ Local Setup (Full Potential) |
| :--- | :--- | :--- |
| **Hosting Stack** | Vercel + Render (Free Tier) + Supabase | Local Node.js + Python (`.venv`) or Docker |
| **RAM & Compute Cap** | Capped at **512 MB RAM** (Render Free Limit) | **Unlimited** (utilizes all available host RAM/CPU) |
| **Max Upload Size** | **15 MB per file** (Memory-safe limit) | **100 MB+ per file** (Configurable in `config.py`) |
| **Response Latency** | ~30–50s cold start if idle on Render | **Instant** (Zero cold starts, local execution) |
| **File Persistence** | Ephemeral container storage | Local disk storage (`./uploads`) or Supabase Storage |

> 💡 **Recommendation:** The live web demo is optimized to showcase features safely within free-tier cloud limits. To unlock the full potential of DetectiveAI—processing large multi-gigabyte datasets, rapid local Polars computations, and custom reporting—run the project locally using the quickstart guide below.

---

## ✨ Features & Capabilities

- 📊 **Automated Schema Profiler & Data Health:** Computes data integrity scores, row/column cardinality, null percentages, memory footprints, and statistical distribution metrics using high-speed Polars engines.
- 💬 **Interactive AI Analyst Assistant:** Natural language context-aware Q&A console connected directly to dataset profiling matrices and anomaly telemetry nodes.
- 📈 **Time-Series Forecasting Engine:** Calculates ARIMA trend lines, seasonality horizons, and confidence interval bounds over temporal data series.
- 🛡️ **Outlier & Anomaly Detection:** Applies Isolation Forest models and univariate z-score checks to flag critical deviations across tabular attributes.
- 🔍 **Root-Cause Analysis (5 Whys):** Constructs hierarchical 5-Whys root cause diagnostic trees with remediation action steps.
- 📄 **Executive Report Exporting:** One-click automated PDF and DOCX document compiling complete with KPI summaries, chart data, dataset metadata, anomaly logs, and rule-based recommendations.
- 🔑 **Tokenized Case URL Slugs:** Security-focused URL obfuscation converting internal database auto-increment IDs into XOR Base36 case identifiers (`/analysis/case_xxxx`).
- 💰 **Interactive Pricing Studio:** Ingestion-capacity calculator with tiered storage slider, annual (-20%) billing toggle, and live price result card.
- 🎨 **Ink Design System:** Brutalist-diagnostics visual language — hard offset shadows (`4px 4px 0 #000`), 18px-radius panels, monospace status readouts, and an `#edfe5e` acid-accent on near-black/paper canvases. Fully light/dark adaptive.

---

## 🛠️ Technology Stack

| Architecture Layer | Technology | Key Dependencies |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router + Turbopack) | React 19, TypeScript, TanStack Query v5, Zustand |
| **Styling & UI** | Ink Design System + TailwindCSS v4 | Lucide Icons, Framer Motion, ECharts (theme-aware), Sonner |
| **Backend Engine** | Python 3.12 + FastAPI | Uvicorn, Pydantic v2, PyJWT, Pwdlib (Argon2) |
| **Data Engine & Stats** | Polars + Scikit-Learn | Prophet, Statsmodels, Pandas, NumPy, SciPy |
| **Document Generation** | ReportLab + Python-Docx | Jinja2 (HTML → PDF via WeasyPrint) |
| **Database & ORM** | Async SQLAlchemy 2.0 + Alembic | AsyncPG (Supabase / Postgres), AIOSQLite |
| **Auth** | Firebase Auth (email/password + Google OAuth) | Firebase JS SDK, `httpx-oauth` for Google code flow |

---

## 🎨 Design System

The UI follows the **Ink Design System** (see [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)):

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| Ink / Paper | `#000000` / `#f9f9f7` | `#f9f9f7` / `#11120d` | Primary text / canvas |
| Card surface | `#ffffff` | `#1c1d18` | Panels, cards, modals |
| Hairline border | `#000000` | `#3b3a33` | 1px borders (`border-black dark:border-[#3b3a33]`) |
| Acid accent | `#000000` | `#edfe5e` | CTAs, active states (`bg-black dark:bg-[#edfe5e]`) |
| Success / Danger | `#31e992` / `#bc3e3e` | `#31e992` / `#bc3e3e` | Health scores, alerts |
| Muted text | `#555555` | `#a09e93` | Secondary copy, metadata |

- **Panels:** `rounded-[18px]` with hard offset shadow `shadow-[4px_4px_0px_#000000]`
- **Typography:** sans-serif for UI copy, monospace (`font-mono`) for numbers, health scores, and status readouts with uppercase `tracking-widest` labels
- **Icons:** custom SVG brand mark (magnifying-glass / wireframe motif) used across landing, auth, and favicon

---

## 📁 Repository Structure

```text
detective-ai/
├── backend/
│   ├── alembic/             # Database Migration Framework & Revision Scripts
│   ├── app/
│   │   ├── api/             # FastAPI Routers (auth, datasets, analysis, cleaning,
│   │   │                    #   dashboard, forecast, history, reports, statistics)
│   │   ├── core/            # Config, Security JWT, Base36 Slug Tokenization
│   │   ├── database/        # Async SQLAlchemy Engine & Session Factories
│   │   ├── models/          # ORM Models (User, Dataset, Analysis, Report)
│   │   ├── repositories/    # Async DB Repositories
│   │   ├── schemas/         # Pydantic Request & Response Data Contracts
│   │   ├── services/        # Analytics Engines (profiling, EDA, KPI, ARIMA forecast,
│   │   │                    #   anomalies, root cause, insights, cleaning, reports)
│   │   └── templates/       # Jinja2 HTML Report Template (report.html)
│   ├── Dockerfile           # Backend Containerization Definition
│   ├── requirements.txt     # Python Dependencies
│   ├── alembic.ini          # Alembic Migration Settings
│   └── .env.example         # Backend Environment Variable Template
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/      # login, register, forgot-password
│       │   ├── (dashboard)/ # dashboard, upload, history, analysis/[id], profile, settings
│       │   ├── blog/        # Blog landing page
│       │   ├── pricing/     # Interactive pricing studio
│       │   ├── page.tsx     # Marketing landing page
│       │   └── layout.tsx / providers.tsx / globals.css / icon.tsx
│       ├── components/
│       │   ├── analysis/    # 12 Tab Modules (profile, statistics, kpi, charts, anomalies,
│       │   │                #   forecast, root-cause, insights, recommendations, cleaning,
│       │   │                #   hypothesis, chat)
│       │   ├── reports/     # Executive Report Generator
│       │   ├── layout/      # Dashboard Shell (sidebar, header, layout)
│       │   ├── ui/          # Base UI Primitives + Forensic Chart Components
│       │   └── animate-ui/  # Animation & Micro-interaction Components
│       ├── hooks/           # Theme-Aware ECharts Hook & UI Listeners
│       ├── lib/             # Axios API Client, Firebase Init, Utils
│       ├── store/           # Zustand Auth & Analysis State Stores
│       └── types/           # Shared TypeScript Contracts
│
├── docs/                    # PRD.md, TRD.md, ARCHITECTURE.md, DESIGN_SYSTEM.md
├── .github/workflows/       # Render Free-Tier Keep-Alive Cron
├── .env.example             # Root Environment Variable Template
└── README.md
```

---

## 🚀 Quickstart Guide (Local Development — Full Potential)

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- Git

### 1. Start Backend API Server
```bash
# Move to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy the env template (edit values as needed)
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```
*The FastAPI interactive documentation will be available at `http://localhost:8000/docs`.*

### 2. Start Frontend Dev Server
```bash
# Open a new terminal and move to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Next.js Turbopack server on port 3000
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

---

## 🔒 Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Firebase Auth (optional — email/password auth works without these;
# Google Sign-In requires a Firebase Web App configured in the console)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite+aiosqlite:///./detectiveai.db
SECRET_KEY=your_production_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=104857600
CORS_ORIGINS=http://localhost:3000,https://projectdetective.vercel.app
```
*`CORS_ORIGINS` is a comma-separated list of allowed origins.*

---

## ☁️ Deploying to Production (Free Tier Setup)

1. **Database (Supabase PostgreSQL):**
   - Create a free PostgreSQL database on [Supabase](https://supabase.com).
   - Set `DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`.

2. **Backend Deployment (Render):**
   - Connect your GitHub repository to Render as a Web Service.
   - Set Root Directory to `backend`.
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `MAX_UPLOAD_SIZE=15728640`).

3. **Frontend Deployment (Vercel):**
   - Connect your GitHub repository to Vercel.
   - Set Root Directory to `frontend`.
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://detective-ai-guio.onrender.com/api`.

---

## 📄 License

This repository is licensed under the [MIT License](LICENSE). Built for high-performance autonomous data analytics.
