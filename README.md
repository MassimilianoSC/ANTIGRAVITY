# Excel Dataset Importer MVP

Sistema flessibile per l'importazione e l'analisi di file Excel, anche con layout complessi (report gestionali).

## Funzionalità

- **Upload di file xlsx**: caricamento con calcolo SHA256 e salvataggio sicuro
- **Analisi automatica**: rilevamento intelligente di tabelle con punteggio di confidenza
- **Preview flessibile**: 
  - Vista Tabella per dati strutturati
  - Vista Griglia per layout complessi
- **Multi-sheet**: supporto completo per workbook con più fogli
- **Persistenza**: database SQLite con storage su disco

## Requisiti

- Docker
- Docker Compose

## Avvio Rapido

```bash
# Avvia tutto con Docker Compose
docker compose up --build
```

**URL di accesso:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentazione API: http://localhost:8000/docs

## Sviluppo Locale (senza Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Test

```bash
cd backend
pytest tests/ -v
```

## Architettura

### Backend
- **Framework**: FastAPI
- **Database**: SQLite con SQLAlchemy
- **Parser Excel**: openpyxl (read_only mode)
- **Storage**: File system per xlsx originali

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router

### Algoritmo di Rilevamento Tabelle

1. **Bounding Box**: identifica area con celle non vuote
2. **Densità**: calcola occupancy per riga/colonna
3. **Candidati**: trova fino a 3 rettangoli densi
4. **Header Detection**: stima riga intestazione
5. **Confidence Score**: alto se >70% celle piene e header chiaro

## Struttura Database

**Dataset**: id, filename, sha256, upload_date, file_path, file_size  
**Sheet**: id, dataset_id, sheet_name, n_rows, n_cols, merged_cells_count, analysis_json  
**Cell**: id, dataset_id, sheet_name, row, col, value_text  

## API Endpoints

- `GET /health` - Health check
- `POST /api/datasets` - Upload Excel file
- `GET /api/datasets` - Lista tutti i dataset
- `GET /api/datasets/{id}` - Dettaglio dataset
- `GET /api/datasets/{id}/sheets/{name}/preview` - Preview sheet (grid/table mode)

## Licenza

MIT
