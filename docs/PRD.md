# Product Requirement Document (PRD): DetectiveAI

## 1. Product Overview
DetectiveAI is an autonomous, web-based data forensics and intelligence platform that enables security teams, researchers, and data analysts to upload data, run automated quality cleansing operations, detect anomalies, forecast metrics, and compile professional executive briefings inside a secure, zero-retention memory isolation container.

---

## 2. Target Audience & User Personas
* **Data Security Analysts:** Need to parse raw security logs and system metrics quickly to spot spikes, dropouts, or drift, with absolute guarantees that their data is not persisted to secondary databases.
* **Forensic Investigators:** Need immediate statistics, time-series forecasting, and structural cleaning suggestions to prepare raw tabular logs for external evidence files.
* **Executives & Stakeholders:** Need to read clear, simplified PDF/Word summaries showing what quality actions were executed, primary insights, and critical KPIs.

---

## 3. Core Features & Capabilities

### A. Data Ingestion Dropzone
* Drag-and-drop file ingestion support for `.csv`, `.xlsx`, `.xls`, `.json`, and `.parquet` files.
* Soft file size constraint of **100MB** to ensure operation runs within standard free hosting resource quotas (512MB RAM).
* Dynamic status feedback showing stages: Parsing schema, locking column constraints, analyzing correlations, and compiling results.

### B. Automated Cleansing System
* Scans ingested columns for 8 major categories of issues:
  1. Missing values (with imputation fixes).
  2. Duplicate rows.
  3. Z-Score structural outliers.
  4. Mismatched string/temporal data types.
  5. Whitespace inconsistencies.
  6. Mixed-case category variables.
  7. Invalid date intervals.
  8. Negative values in quantity metrics.
* **Interactive Remediation:** Lists quality suggestions in a card matrix, permitting users to run fixes individually or apply all in a single click.

### C. Engine Analytics Suite
* **Evidence (Dataset Profile):** Visualizes structural health percentages, memory footprint, dimensions, and individual column type specs.
* **Charts:** Automatically generates interactive data charts (line, bar, scatter) utilizing vectorized datasets.
* **Forecasts:** Runs auto-tuned autoregressive forecasts (90 periods forward) on specified date/value vectors.
* **Anomalies:** Identifies statistical outliers using z-score threshold flags.
* **Statistics & Hypothesis testing:** Computes statistical distributions (mean, median, variance) and evaluates null hypotheses against custom confidence alpha configurations.
* **Root-Cause Analysis:** Generates a structured logical hierarchy using automated "Why" analysis chains to trace anomaly roots.

### D. Document Export & executive Briefings
* **Cleaned Data Download:** Allows users to download the corrected dataset as a file matching its original format (e.g. clean `.csv` or `.parquet`).
* **Executive Summary:** Compiles a formatted PDF or DOCX report summarising KPIs, discovered insights, statistics, and corrective recommendations.

---

## 4. User Experience & Design Guidelines
* **Minimalist Aesthetic:** Styled in a premium Sand & Charcoal color palette with bone-outline containers and monospaced diagnostic labels.
* **Dual Theme Compatibility:** Adaptive color parameters scaling gracefully between light and dark modes.
* **Interactive Fluidity:** High-fidelity theme reveal animations, sliding calculators, and responsive metric cards.

---

## 5. Security & Privacy Constraints
* **Memory-Only Ingest:** Keep data vectors strictly in memory contexts using Polars during runtime tasks.
* **Ephemeral Disk Storage:** Stored files are immediately deleted from disk if the user deletes the Case or clean operations finish.
* **No Persistent Data Warehousing:** The database retains metadata (like column names, row counts, and health scores) but never the raw dataset cells themselves.
