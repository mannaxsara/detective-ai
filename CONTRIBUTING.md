# Contributing to DetectiveAI 🔍

Welcome to DetectiveAI! We are thrilled to have your contributions. This guide walks you through setting up your local environment, contributing code, running tests, and understanding the architecture.

---

## ⚡ Option 1: Quickstart with Docker (Recommended)

The easiest way to run DetectiveAI locally with zero configuration:

```bash
# Clone the repository
git clone https://github.com/mannaxsara/detective-ai.git
cd detective-ai

# Start database, backend, and frontend
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000/api`
- **API Documentation**: `http://localhost:8000/docs`
- **Database**: PostgreSQL on `localhost:5432`

---

## 💻 Option 2: Manual Local Development

### 1. Prerequisites
- **Python**: 3.11+
- **Node.js**: 20+ & npm
- **PostgreSQL**: 15+ (or use Supabase connection string)

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🤖 Connecting Local AI Models (Ollama / 100% Offline)

DetectiveAI supports offline local LLMs via Ollama with zero API cost:

1. Install [Ollama](https://ollama.com/) on your host machine.
2. Pull a model:
   ```bash
   ollama run llama3.2
   ```
3. Open DetectiveAI at `http://localhost:3000/settings` and select **Local Ollama** (or paste your personal Google Gemini, Groq, or OpenAI key for instant auto-detection).

---

## 🧪 Running Automated Tests

Before submitting a Pull Request, verify that all test suites pass:

```bash
# Backend unit tests
$env:PYTHONPATH="backend"; python -m pytest backend/tests

# Frontend production build & typecheck
npm --prefix frontend run build
```

---

## 📐 Architecture Guidelines

1. **Polars for Tabular Processing**: Use Polars instead of Pandas for all in-memory data processing to ensure low memory footprints.
2. **Safe Fallbacks**: If external AI models fail or quota is exhausted, fall back gracefully to `RuleBasedInsightProvider`.
3. **Ink Design System**: Maintain our brutalist-diagnostic UI standards (`rounded-[18px]`, `shadow-[4px_4px_0px_#000000]`, monospace metrics, `#edfe5e` acid-accent).
