#!/usr/bin/env python3
"""
DetectiveAI Local Runner
Automatically adapts to host CPU/RAM, checks for local Ollama,
and launches backend and frontend concurrently with zero configuration.
"""

import os
import signal
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"


def detect_hardware():
    cpus = os.cpu_count() or 4
    safe_threads = max(1, cpus // 2)
    os.environ["POLARS_MAX_THREADS"] = str(safe_threads)
    print(f"[*] Hardware detected: {cpus} CPU cores. Throttled Polars to {safe_threads} threads (leaves {cpus - safe_threads} cores for system).")


def check_ollama():
    try:
        req = urllib.request.Request("http://127.0.0.1:11434/api/tags", headers={"User-Agent": "DetectiveAI"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                print("[*] Local Ollama is ONLINE at http://127.0.0.1:11434. Privacy mode: 100% offline local inference available.")
                return True
    except Exception:
        pass
    print("[*] Local Ollama not detected. Using cloud AI providers (Gemini / Claude / OpenAI) or built-in deterministic statistical engine.")
    return False


def main():
    print("=" * 65)
    print("           DETECTIVE AI - LOCAL RUNNER")
    print("=" * 65)

    detect_hardware()
    has_ollama = check_ollama()

    # Default to SQLite for zero-config local run if no DATABASE_URL set
    if "DATABASE_URL" not in os.environ and not (BACKEND_DIR / ".env").exists():
        sqlite_db = BACKEND_DIR / "detectiveai.db"
        os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{sqlite_db}"
        print(f"[*] Zero-config local database: {sqlite_db.name}")

    if has_ollama and "AI_PROVIDER" not in os.environ:
        os.environ.setdefault("AI_PROVIDER", "ollama")
        os.environ.setdefault("AI_BASE_URL", "http://localhost:11434/v1")
        os.environ.setdefault("AI_MODEL", "llama3.2")

    os.environ.setdefault("MAX_UPLOAD_SIZE", "104857600")
    print("[*] Local upload capacity: 100 MB per dataset file.")

    procs = []
    try:
        print("\n[*] Starting FastAPI backend on http://localhost:8000 ...")
        py_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]
        backend_proc = subprocess.Popen(py_cmd, cwd=str(BACKEND_DIR))
        procs.append(backend_proc)

        # Check for npm in frontend
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        if (FRONTEND_DIR / "package.json").exists():
            print("[*] Starting Next.js frontend on http://localhost:3000 ...")
            frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=str(FRONTEND_DIR))
            procs.append(frontend_proc)

        print("\n[+] DetectiveAI is running locally!")
        print("    - Web UI: http://localhost:3000")
        print("    - API Docs: http://localhost:8000/docs")
        print("    - Press Ctrl+C to stop all services.\n")

        while True:
            time.sleep(1)
            for p in procs:
                if p.poll() is not None:
                    print(f"[!] Process {p.pid} exited with code {p.returncode}.")
                    return

    except KeyboardInterrupt:
        print("\n[*] Shutting down local services...")
    finally:
        for p in procs:
            try:
                p.terminate()
                p.wait(timeout=3)
            except Exception:
                p.kill()
        print("[*] All local services stopped cleanly.")


if __name__ == "__main__":
    main()
