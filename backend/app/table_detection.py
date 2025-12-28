import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from . import models

def analyze_sheet_structure(cells: List[models.Cell]) -> str:
    """
    Analizza la struttura di un foglio e rileva candidati tabella.
    Restituisce JSON con candidati, confidence e header row.
    """
    if not cells:
        return json.dumps({"candidates": []})
    
    # Step 1: Calcola bounding box
    rows = [c.row for c in cells]
    cols = [c.col for c in cells]
    min_row, max_row = min(rows), max(rows)
    min_col, max_col = min(cols), max(cols)
    
    # Crea mappa celle per lookup veloce
    cell_map = {(c.row, c.col): c.value_text for c in cells}
    
    # Step 2: Calcola densità per riga e colonna
    row_density = {}
    col_density = {}
    total_cols = max_col - min_col + 1
    total_rows = max_row - min_row + 1
    
    for row in range(min_row, max_row + 1):
        filled = sum(1 for col in range(min_col, max_col + 1) if (row, col) in cell_map)
        row_density[row] = filled / total_cols if total_cols > 0 else 0
    
    for col in range(min_col, max_col + 1):
        filled = sum(1 for row in range(min_row, max_row + 1) if (row, col) in cell_map)
        col_density[col] = filled / total_rows if total_rows > 0 else 0
    
    # Step 3: Trova rettangoli densi
    candidates = find_dense_rectangles(
        cell_map, min_row, max_row, min_col, max_col, 
        row_density, col_density
    )
    
    # Step 4: Per ogni candidato, trova header row
    for candidate in candidates:
        header_row = detect_header_row(
            cell_map, 
            candidate["row_start"], 
            candidate["row_end"],
            candidate["col_start"],
            candidate["col_end"]
        )
        candidate["header_row"] = header_row
        
        # Calcola confidence
        density_score = calculate_density_score(
            cell_map,
            candidate["row_start"],
            candidate["row_end"],
            candidate["col_start"],
            candidate["col_end"]
        )
        
        has_good_header = header_row is not None
        candidate["score"] = density_score
        
        if density_score > 0.7 and has_good_header:
            candidate["confidence"] = "high"
        elif density_score > 0.4:
            candidate["confidence"] = "medium"
        else:
            candidate["confidence"] = "low"
    
    return json.dumps({"candidates": candidates})

def find_dense_rectangles(
    cell_map: Dict[Tuple[int, int], str],
    min_row: int, max_row: int,
    min_col: int, max_col: int,
    row_density: Dict[int, float],
    col_density: Dict[int, float],
    threshold: float = 0.3
) -> List[Dict[str, Any]]:
    """Trova fino a 3 rettangoli densi."""
    
    candidates = []
    
    # Candidato 1: Tutto il bounding box
    candidates.append({
        "row_start": min_row,
        "row_end": max_row,
        "col_start": min_col,
        "col_end": max_col
    })
    
    # Candidato 2: Rimuovi righe/colonne sparse all'inizio
    dense_row_start = min_row
    for row in range(min_row, max_row + 1):
        if row_density.get(row, 0) >= threshold:
            dense_row_start = row
            break
    
    dense_col_start = min_col
    for col in range(min_col, max_col + 1):
        if col_density.get(col, 0) >= threshold:
            dense_col_start = col
            break
    
    if dense_row_start > min_row or dense_col_start > min_col:
        candidates.append({
            "row_start": dense_row_start,
            "row_end": max_row,
            "col_start": dense_col_start,
            "col_end": max_col
        })
    
    # Candidato 3: Area centrale più densa
    if max_row - min_row > 10:
        mid_start = min_row + 2
        mid_end = min(min_row + 100, max_row)
        candidates.append({
            "row_start": mid_start,
            "row_end": mid_end,
            "col_start": dense_col_start,
            "col_end": max_col
        })
    
    return candidates[:3]

def detect_header_row(
    cell_map: Dict[Tuple[int, int], str],
    row_start: int, row_end: int,
    col_start: int, col_end: int
) -> int:
    """Rileva la riga header più probabile (prime 3 righe)."""
    
    best_row = None
    best_score = 0
    
    for test_row in range(row_start, min(row_start + 3, row_end + 1)):
        score = 0
        filled_count = 0
        
        for col in range(col_start, col_end + 1):
            value = cell_map.get((test_row, col), "")
            if value.strip():
                filled_count += 1
                # Preferisci stringhe non numeriche
                if not value.replace(".", "").replace(",", "").replace("-", "").strip().isdigit():
                    score += 2
                else:
                    score += 1
        
        # Normalizza score
        total_cols = col_end - col_start + 1
        if total_cols > 0:
            normalized_score = score / total_cols
            if normalized_score > best_score:
                best_score = normalized_score
                best_row = test_row
    
    return best_row if best_score > 0.5 else row_start

def calculate_density_score(
    cell_map: Dict[Tuple[int, int], str],
    row_start: int, row_end: int,
    col_start: int, col_end: int
) -> float:
    """Calcola densità del rettangolo."""
    
    total_cells = (row_end - row_start + 1) * (col_end - col_start + 1)
    if total_cells == 0:
        return 0.0
    
    filled = 0
    for row in range(row_start, row_end + 1):
        for col in range(col_start, col_end + 1):
            if (row, col) in cell_map:
                filled += 1
    
    return filled / total_cells
