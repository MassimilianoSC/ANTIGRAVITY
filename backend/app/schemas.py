from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class DatasetBase(BaseModel):
    filename: str

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(BaseModel):
    id: str
    filename: str
    sha256: str
    upload_date: datetime
    file_size: int
    sheet_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class SheetResponse(BaseModel):
    id: int
    sheet_name: str
    n_rows: int
    n_cols: int
    merged_cells_count: int
    analysis_json: Optional[str] = None
    
    class Config:
        from_attributes = True

class DatasetDetailResponse(BaseModel):
    dataset: DatasetResponse
    sheets: List[SheetResponse]

class GridPreviewResponse(BaseModel):
    mode: str = "grid"
    data: List[List[str]]
    dimensions: dict

class TablePreviewResponse(BaseModel):
    mode: str = "table"
    headers: List[str]
    rows: List[List[Any]]
    confidence: str
    score: float
