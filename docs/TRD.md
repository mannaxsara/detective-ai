# Technical Requirement Document (TRD): DetectiveAI

## 1. System Technology Stack

### Frontend Architecture
* **Framework:** Next.js (version 16) with App Router + Turbopack, utilizing React Server Components (RSC) and Client Components.
* **Styling:** Tailwind CSS v4 (CSS-first, no `tailwind.config` file — tokens live in `globals.css` `@theme`) using the **Ink design system** (explicit hex / arbitrary-value classes on pages; CSS-var tokens inside `components/ui/*` primitives).
* **State Management:** Zustand (used for authentication stores and analytical tab state).
* **Data Fetching:** React Query (TanStack Query version 5) for cache handling and automated API invalidation.
* **Component Library:** Base UI (`@base-ui/react`) primitives + shadcn/ui registry; Lucide icon set.
* **Visualization:** Apache ECharts v6 (via a custom theme-aware `use-echarts` hook) for data dashboards and time-series charting.
* **Motion:** Framer Motion / Motion for theme reveals and micro-interactions; Sonner for toast notifications.

### Backend Architecture
* **Framework:** FastAPI (Python 3.12-slim) executing behind Uvicorn.
* **Database Driver:** SQLAlchemy 2.0 (AsyncPG driver wrapper for Postgres; AIOSQLite for local dev) managing async queries.
* **Data Frame Engine:** Polars (Rust-backed dataframe library) for high-performance column processing.
* **Forensics Engines:** SciPy, Statsmodels, NumPy, Scikit-Learn (Isolation Forest), Time-Series Forecasting Engine (Trend & Seasonality Modeling).
* **Report Compiler:** ReportLab (PDF rendering), python-docx (Microsoft Word compiling), Jinja2 (HTML briefing template).
* **Authentication:** PyJWT (access/refresh tokens), Pwdlib (Argon2 password hashing), HTTPX + `httpx-oauth` (Google OAuth), Firebase Auth on the frontend.
* **HTTP Client:** HTTPX (handling external auth requests).

### Databases & Cloud hosting
* **Relational Database:** Supabase PostgreSQL instance (Postgres 15+), SQLite fallback for local dev.
* **Frontend Hosting:** Vercel (Serverless Deployment).
* **Backend Hosting:** Render Free Tier Container Instance (512MB RAM limit).
* **Auth Provider:** Firebase (email/password + Google popup sign-in).

---

## 2. Directory Structure
```
detective-ai/
├── backend/
│   ├── alembic/              # Migration scripts (alembic.ini at backend root)
│   ├── app/
│   │   ├── api/              # Endpoint routers (auth, datasets, cleaning, analysis,
│   │   │                     #   statistics, forecast, reports, history, dashboard)
│   │   ├── core/             # Config settings, JWT security, Base36 slug encoding
│   │   ├── database/         # SQLAlchemy async session setup
│   │   ├── models/           # ORM models (user, dataset, analysis, report)
│   │   ├── repositories/     # Database CRUD execution interfaces
│   │   ├── schemas/          # Pydantic schemas (request/response contracts)
│   │   ├── services/         # Analytics engines (profiling, EDA, KPI, forecast,
│   │   │                     #   anomaly, root-cause, insight, cleaning, report)
│   │   └── templates/        # Jinja2 HTML briefing template (report.html)
│   ├── Dockerfile            # python:3.12-slim
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/              # Next.js routes: (auth)/, (dashboard)/, blog/, pricing/,
│       │                     #   landing page, layout.tsx, globals.css (design tokens)
│       ├── components/       # analysis/ (12 tab modules), reports/, layout/ (shell),
│       │                     #   ui/ (primitives + charts), animate-ui/
│       ├── hooks/            # Custom hooks (theme-aware ECharts binding)
│       ├── lib/              # Axios API client, Firebase init, utils
│       ├── store/            # Zustand global stores (auth, analysis)
│       └── types/            # Shared TypeScript contracts
├── docs/                     # Architectural, Design, Product, and Technical documents
└── .github/workflows/        # Render keep-alive cron
```

---

## 3. Database Schema Definitions (SQLAlchemy & Postgres)

### A. Users Table (`users`)
Main repository for application accounts. Supports standard passwords and Google OAuth credentials.
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) UNIQUE NOT NULL,
    hashed_password VARCHAR(1024) NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(2048) NULL,
    google_id VARCHAR(255) UNIQUE NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

### B. Datasets Table (`datasets`)
Registers uploaded metadata. **Important:** Files are stored ephemerally on the container disk, never inside Postgres.
```sql
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(512) NOT NULL,
    original_filename VARCHAR(512) NOT NULL,
    file_path VARCHAR(2048) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size INTEGER NOT NULL,
    row_count INTEGER NULL,
    column_count INTEGER NULL,
    status VARCHAR(50) DEFAULT 'uploaded' NOT NULL,
    health_score FLOAT NULL,
    profile_data JSON NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_datasets_user_id ON datasets(user_id);
```

### C. Analyses Table (`analyses`)
Main storage area for computed analytical indicators.
```sql
CREATE TABLE analyses (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    results JSON NULL,
    insights JSON NULL,
    charts JSON NULL,
    kpis JSON NULL,
    statistics JSON NULL,
    anomalies JSON NULL,
    forecast JSON NULL,
    cleaning_suggestions JSON NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_analyses_dataset_id ON analyses(dataset_id);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
```

### D. Reports Table (`reports`)
Stores generated reports details for easy download.
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(512) NOT NULL,
    format VARCHAR(10) NOT NULL,
    file_path VARCHAR(2048) NOT NULL,
    sections JSON NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX idx_reports_analysis_id ON reports(analysis_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
```

---

## 4. Key API Endpoint Specifications

All routers are registered under the `/api` prefix (`backend/app/api/__init__.py` → `app.main.py`).

### Authentication Routes (`/api/auth`)
* `POST /api/auth/register`: Create user account. Returns user info & tokens.
* `POST /api/auth/login`: Basic email/password authentication.
* `POST /api/auth/google`: Authenticates Google ID Token credentials.
* `POST /api/auth/refresh`: Rotates the expired access token via a stored refresh token.
* `POST /api/auth/forgot-password`: Sends a password reset token to the user's email.
* `POST /api/auth/reset-password`: Resets the password using the emailed token.
* `GET /api/auth/me`: Fetches profile details of the currently logged-in user.

### Datasets Routes (`/api/datasets`)
* `POST /api/datasets/upload`: Streams input file (CSV/JSON/Parquet/Excel) to disk. Enforced by `MAX_UPLOAD_SIZE` — 15 MB default on the free cloud tier, configurable (e.g. 100 MB) for local/self-hosted instances.
* `GET /api/datasets`: Paginated listing of datasets owned by the caller.
* `GET /api/datasets/{id}`: Detailed metadata configuration.
* `DELETE /api/datasets/{id}`: Removes the file from the local container disk and deletes metadata records.
* `GET /api/datasets/{id}/preview`: Retrieves first 100 records for the tabular preview pane.
* `GET /api/datasets/{id}/profile`: Evaluates health score metrics.
* `GET /api/datasets/{id}/download`: Serves the cleaned data file directly via HTTP binary stream download.

### Data Cleaning Routes (`/api/datasets/{id}/cleaning`)
* `GET /api/datasets/{id}/cleaning`: Returns dynamic formatting anomalies and suggests actions.
* `POST /api/datasets/{id}/cleaning/apply`: Executes selected correction scripts on the raw dataframe file, updates profile records, and invalidates analytics caches.

### Analysis Routes (`/api/analysis`)
* `POST /api/analysis/trigger`: Starts an autonomous analysis (profiling, EDA, insights, KPIs) in a background task for a dataset.
* `GET /api/analysis/{id}`: Retrieves the analysis status and aggregated result payload.
* `GET /api/analysis/{id}/charts`: Returns chart configuration JSON consumed by the ECharts frontend.
* `GET /api/analysis/{id}/kpis`: Returns computed KPI cards.
* `GET /api/analysis/{id}/insights`: Returns discovered insight narratives.
* `GET /api/analysis/{id}/recommendations`: Returns suggested actions for the analyst.
* `POST /api/analysis/{id}/chat`: Question-answering assistant grounded in the analysis results.
* `GET /api/analysis/{id}/root-cause`: Root-cause analysis (contribution index) for weak metrics.

### Statistics Routes (`/api/analysis/{id}/…`)
* `GET /api/analysis/{analysis_id}/statistics`: Descriptive statistics for all columns.
* `GET /api/analysis/{analysis_id}/correlations`: Pairwise correlation matrix (Pearson/Spearman).
* `GET /api/analysis/{analysis_id}/anomalies`: Anomaly detection report (Isolation Forest / IQR).

### Forecast Routes (`/api/analysis/{analysis_id}/forecast`)
* `POST /api/analysis/{analysis_id}/forecast`: Fits an ARIMA/Prophet model and stores the forecast series.
* `GET /api/analysis/{analysis_id}/forecast`: Retrieves the stored forecast series.

### Reports Routes (`/api/reports`)
* `POST /api/reports/analysis/{analysis_id}`: Compiles PDF/DOCX briefings on the server.
* `GET /api/reports/{report_id}/download`: Downloads compiled report documents.

### History Routes (`/api/history`)
* `GET /api/history`: Lists past analyses performed by the caller.
* `GET /api/history/search`: Searches past analyses (SQL `ILIKE` across names/types).

### Dashboard Routes (`/api/dashboard`)
* `GET /api/dashboard/stats`: Aggregated platform statistics (totals, recent activity) for the landing/dashboard page.
