# System Architecture & Flowcharts: DetectiveAI

This document describes the high-level architecture and processing pipelines for the DetectiveAI platform.

---

## 1. System Context Diagram
The following Mermaid diagram shows the relationship between the client browser, API server, database, and local file storage:

```mermaid
graph TD
    Client[Client Browser - Next.js] <--> |HTTPS / Auth| API[FastAPI Application Server]
    API <--> |JSON Profiles / Results| DB[(Supabase PostgreSQL Database)]
    API <--> |Stream File Read/Write| Disk[(Container Local Disk - Ephemeral)]
```

---

## 2. File Upload & Profiling Pipeline
When a user uploads a new dataset, it undergoes automated schema analysis and health calculation:

```mermaid
sequenceDiagram
    autonumber
    actor User as Investigator (Client)
    participant API as FastAPI Backend
    participant Polars as Polars Core (Engine)
    participant DB as Postgres Database
    
    User->>API: POST /api/datasets/upload (File Stream)
    API->>API: Validate file extensions & size (max 100MB)
    API->>API: Write file to uploads/ directory
    API->>Polars: Load dataset dataframe
    Polars-->>API: Extract rows count, column types, & schema
    API->>API: Compute baseline Health Score (Quality profile)
    API->>DB: Save dataset metadata (status="uploaded")
    API-->>User: Return dataset ID & properties
```

---

## 3. Data Cleansing Lifecycle
Cleansing suggestion detection and correction execution loop:

```mermaid
graph TD
    A[Start: Uploaded Dataset] --> B[GET /datasets/{id}/cleaning]
    B --> C[Polars scans for missing values, duplicates, mixed case, outliers]
    C --> D[Generate Suggestions with deterministic md5 fix_ids]
    D --> E[Render suggestion lists on Cleaning Tab]
    E -->|User clicks Apply Fix| F[POST /datasets/{id}/cleaning/apply]
    F --> G[Load raw dataframe from disk]
    G --> H[Run specific correction scripts in Polars]
    H --> I[Overwrite file on disk with clean data]
    I --> J[Recalculate profile health score & save to DB]
    J --> K[Invalidate React Query cache keys on client]
    K --> L[Refresh details page view]
```

---

## 4. Analytical Insights & Forecast Loop
When a user opens the Case Details dashboard, background analytical engines are lazily populated:

```mermaid
graph LR
    Dataset[Dataset Clean File] --> Profile[Profiling Service]
    Dataset --> Forecast[ARIMA Forecast Service]
    Dataset --> Stats[SciPy Statistics Engine]
    Dataset --> Insights[Insight Engine]
    
    Profile --> |Health / Metadata| DB[(Postgres Metadata DB)]
    Forecast --> |90-period predictions JSON| DB
    Stats --> |Z-Scores / Hypothesis tests JSON| DB
    Insights --> |Concentration / Correlations JSON| DB
```

---

## 5. Briefing Compilation Pipeline
compilation stages of dynamic business reports:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser
    participant API as FastAPI Backend
    participant DB as Postgres Database
    participant Service as Report Service (ReportLab)
    
    Client->>API: POST /api/reports/analysis/{id} (PDF request)
    API->>DB: Fetch analysis metrics, statistics, & insights
    DB-->>API: Return JSON datasets
    API->>API: Parse summaries using _md_to_html formatter
    API->>Service: Send parsed HTML snippets & metrics
    Service->>Service: Build ReportLab Canvas (Charcoal & Sand colors)
    Service->>Service: Write PDF report to disk
    API->>DB: Save report file details
    API-->>Client: Return report ID
    Client->>API: GET /api/reports/{id}/download
    API-->>Client: Stream binary report file to browser
```
