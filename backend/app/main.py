from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path

from . import models, schemas, crud
from .database import engine, get_db, Base

# Crea tabelle al primo avvio
Path("storage/uploads").mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Excel Dataset Importer",
    description="Sistema flessibile per l'importazione e analisi di file Excel",
    version="1.0.0"
)

# CORS per sviluppo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/api/datasets", response_model=schemas.DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload di un file Excel e creazione dataset."""
    
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Solo file .xlsx sono supportati")
    
    dataset = await crud.create_dataset(db, file)
    
    # Conta sheets
    sheet_count = db.query(models.Sheet).filter(
        models.Sheet.dataset_id == dataset.id
    ).count()
    
    return schemas.DatasetResponse(
        id=dataset.id,
        filename=dataset.filename,
        sha256=dataset.sha256,
        upload_date=dataset.upload_date,
        file_size=dataset.file_size,
        sheet_count=sheet_count
    )

@app.get("/api/datasets", response_model=List[schemas.DatasetResponse])
async def list_datasets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista tutti i dataset."""
    
    datasets = crud.get_datasets(db, skip=skip, limit=limit)
    
    result = []
    for dataset in datasets:
        sheet_count = db.query(models.Sheet).filter(
            models.Sheet.dataset_id == dataset.id
        ).count()
        
        result.append(schemas.DatasetResponse(
            id=dataset.id,
            filename=dataset.filename,
            sha256=dataset.sha256,
            upload_date=dataset.upload_date,
            file_size=dataset.file_size,
            sheet_count=sheet_count
        ))
    
    return result

@app.get("/api/datasets/{dataset_id}", response_model=schemas.DatasetDetailResponse)
async def get_dataset_detail(
    dataset_id: str,
    db: Session = Depends(get_db)
):
    """Dettaglio dataset con lista sheets."""
    
    dataset = crud.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trovato")
    
    sheets = crud.get_sheets_by_dataset(db, dataset_id)
    
    sheet_count = len(sheets)
    
    return schemas.DatasetDetailResponse(
        dataset=schemas.DatasetResponse(
            id=dataset.id,
            filename=dataset.filename,
            sha256=dataset.sha256,
            upload_date=dataset.upload_date,
            file_size=dataset.file_size,
            sheet_count=sheet_count
        ),
        sheets=[
            schemas.SheetResponse(
                id=s.id,
                sheet_name=s.sheet_name,
                n_rows=s.n_rows,
                n_cols=s.n_cols,
                merged_cells_count=s.merged_cells_count,
                analysis_json=s.analysis_json
            ) for s in sheets
        ]
    )

@app.get("/api/datasets/{dataset_id}/sheets/{sheet_name}/preview")
async def preview_sheet(
    dataset_id: str,
    sheet_name: str,
    mode: str = Query("grid", regex="^(grid|table)$"),
    row_start: int = Query(1, ge=1),
    row_end: int = Query(50, ge=1),
    col_start: int = Query(1, ge=1),
    col_end: int = Query(20, ge=1),
    candidate: int = Query(0, ge=0),
    raw_values: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Preview foglio in modalità grid o table."""
    
    sheet = crud.get_sheet(db, dataset_id, sheet_name)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet non trovato")
    
    if mode == "grid":
        return crud.get_grid_preview(
            db, dataset_id, sheet_name,
            row_start, row_end, col_start, col_end
        )
    else:  # table
        return crud.get_table_preview(
            db, dataset_id, sheet_name, candidate, raw_values
        )
