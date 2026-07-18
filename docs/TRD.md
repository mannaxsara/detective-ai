# Technical Requirement Document (TRD): DetectiveAI

## 1. System Technology Stack

### Frontend Architecture
* **Framework:** Next.js (version 16) with App Router, utilizing React Server Components (RSC) and Client Components.
* **Styling:** Tailwind CSS with custom brand variables (Sand & Charcoal system).
* **State Management:** Zustand (used for authentication stores and analytical tab state).
* **Data Fetching:** React Query (TanStack Query version 5) for cache handling and automated API invalidation.
* **Component Library:** Radix UI primitives.
* **Visualization:** Apache ECharts (via custom canvas bindings) for data dashboards and time-series charting.

### Backend Architecture
* **Framework:** FastAPI (Python 3.12-slim) executing behind Uvicorn.
* **Database Driver:** SQLAlchemy 2.0 (AsyncPG driver wrapper) managing async queries.
* **Data Frame Engine:** Polars (Rust-backed dataframe library) for high-performance column processing.
* **Forensics Engines:** SciPy, Statsmodels (ARIMA model computing), NumPy.
* **Report Compiler:** ReportLab (PDF rendering), python-docx (Microsoft Word compiling).
* **HTTP Client:** HTTPX (handling external auth requests).

### Databases & Cloud hosting
* **Relational Database:** Supabase PostgreSQL instance (Postgres 15+).
* **Frontend Hosting:** Vercel (Serverless Deployment).
* **Backend Hosting:** Render Free Tier Container Instance (512MB RAM limit).

---

## 2. Directory Structure
```
detective-ai/
├── backend/
│   ├── app/
│   │   ├── api/                 # Endpoint routes (auth, datasets, cleaning, reports, analysis)
│   │   ├── core/                # Configuration settings, security logic, dependencies
│   │   ├── database/            # SQLAlchemy session setup
│   │   ├── models/              # SQLAlchemy database ORM model schemas
│   │   ├── repositories/        # Database CRUD execution interfaces
│   │   ├── schemas/             # Pydantic schemas (request/response schemas)
│   │   └── services/            # Forensics business logic (cleaning, profiling, forecast)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages and layouts (auth guard wrappers, dashboard)
│   │   ├── components/          # Reusable UI widgets and tabs (profile, cleaning, charts)
│   │   ├── hooks/               # Custom hooks (e.g. ECharts binding resize handler)
│   │   ├── lib/                 # Axios clients and API mappings
│   │   └── store/               # Zustand global store files
│   ├── package.json
│   └── tailwind.config.ts
└── docs/                        # Architectural, Design, Product, and Technical documents
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

### Authentication Routes
* `POST /api/auth/register`: Create user account. Returns user info & tokens.
* `POST /api/auth/login`: Basic email/password authentication.
* `POST /api/auth/google`: Authenticates Google ID Token credentials.
* `GET /api/auth/me`: Fetches profile details of the currently logged-in user.

### Datasets Routes
* `POST /api/datasets/upload`: Streams input file (CSV/JSON/Parquet/Excel) to disk. Max 100MB.
* `GET /api/datasets`: Paginated listing of datasets owned by the caller.
* `GET /api/datasets/{id}`: Detailed metadata configuration.
* `DELETE /api/datasets/{id}`: Removes the file from the local container disk and deletes metadata records.
* `GET /api/datasets/{id}/preview`: Retrieves first 100 records for the tabular preview pane.
* `GET /api/datasets/{id}/profile`: Evaluates health score metrics.
* `GET /api/datasets/{id}/download`: Serves the cleaned data file directly via HTTP binary stream download.

### Data Cleaning Routes
* `GET /api/datasets/{id}/cleaning`: Returns dynamic formatting anomalies and suggests actions.
* `POST /api/datasets/{id}/cleaning/apply`: Executes selected correction scripts on the raw dataframe file, updates profile records, and invalidates analytics caches.

### Reports Routes
* `POST /api/reports/analysis/{analysis_id}`: Compiles PDF/DOCX briefings on the server.
* `GET /api/reports/{report_id}/download`: Downloads compiled report documents.
