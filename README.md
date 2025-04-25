# Implementierung mathematischer Modelle für Logikspiele

Dieses Repository enthält Python‑Modelle auf Basis gemischt‑ganzzahliger Optimierung (MIP), um klassische Logikspiele automatisiert zu lösen oder zu generieren. Aktuell werden **Sudoku** (inklusive Killer‑Sudoku) und **Mastermind** unterstützt. Ein Next.js‑Frontend visualisiert die Rätsel, während zwei FastAPI‑Microservices die Berechnungen ausführen.

---

## Schneller Einstieg (empfohlen)

1. **Projekt klonen**
   ```bash
   git clone https://github.com/pascalmad/SA.git
   cd SA
   ```
2. **Container bauen und starten**
   ```bash
   docker compose build
   docker compose up
   ```
3. **Aufrufen**
   * Frontend: <http://localhost:3000>
   * Sudoku‑API: <http://localhost:8080>
   * Mastermind‑API: <http://localhost:8081>

Beenden mit `Ctrl+C`; anschließend kann `docker compose down` aufgeräumt werden.

---

## Manuelles Starten (Entwicklungsmodus)

Wenn Docker nicht verfügbar ist, lassen sich die drei Services in separaten Terminals betreiben.

```bash
# Terminal 1 – Frontend
cd frontend
npm install          # nur einmal nötig
npm run dev          # läuft auf Port 3000

# Terminal 2 – Sudoku‑Solver
cd backend/sudoku
python main.py       # Port 8080

# Terminal 3 – Mastermind‑Solver
cd backend/mastermind
python main.py       # Port 8081
```

---

## Ordnerstruktur

```
frontend/           # Next.js‑App (React + shadcn/ui)
backend/
  ├─ sudoku/        # FastAPI‑Service + MIP‑Modell
  └─ mastermind/    # FastAPI‑Service + MIP‑Modell
compose.yaml        # Orchestrierung aller Container
```

---
