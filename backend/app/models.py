from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.sql import func
from .database import Base

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    sha256 = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)

class Sheet(Base):
    __tablename__ = "sheets"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(String, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    sheet_name = Column(String, nullable=False)
    n_rows = Column(Integer, nullable=False)
    n_cols = Column(Integer, nullable=False)
    merged_cells_count = Column(Integer, default=0)
    analysis_json = Column(Text, nullable=True)
    
    __table_args__ = (
        Index('ix_sheet_dataset', 'dataset_id'),
    )

class Cell(Base):
    __tablename__ = "cells"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(String, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    sheet_name = Column(String, nullable=False)
    row = Column(Integer, nullable=False)
    col = Column(Integer, nullable=False)
    value_text = Column(String(2000), nullable=False)
    
    __table_args__ = (
        Index('ix_cell_dataset', 'dataset_id'),
        Index('ix_cell_sheet', 'sheet_name'),
        Index('ix_cell_position', 'row', 'col'),
    )
