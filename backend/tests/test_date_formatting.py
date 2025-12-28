"""Test per la funzione di formattazione date Excel."""
import pytest
from app.crud import format_excel_date


def test_format_excel_date_only_date():
    """Test formattazione data senza ora (00:00:00)."""
    # 31/12/2022 = serial 44926
    result = format_excel_date("44926")
    assert result == "31/12/2022", f"Expected '31/12/2022' but got '{result}'"


def test_format_excel_date_with_time():
    """Test formattazione data con ora."""
    # 31/12/2022 14:30 = serial 44926.604166...
    result = format_excel_date("44926.604166667")
    assert result == "31/12/2022 14:30", f"Expected '31/12/2022 14:30' but got '{result}'"


def test_format_excel_date_with_seconds():
    """Test formattazione data con ora e minuti (secondi ignorati)."""
    # 31/12/2022 09:15:45 = serial 44926.385243...
    result = format_excel_date("44926.385243")
    assert result == "31/12/2022 09:15", f"Expected '31/12/2022 09:15' but got '{result}'"


def test_format_excel_date_invalid_serial():
    """Test valore fuori range (non una data)."""
    result = format_excel_date("123456")
    assert result == "123456", "Should return original value for out-of-range serial"


def test_format_excel_date_non_numeric():
    """Test valore non numerico."""
    result = format_excel_date("N/A")
    assert result == "N/A", "Should return original value for non-numeric input"


def test_format_excel_date_year_1900():
    """Test data anno 1900."""
    # 01/01/1900 = serial 1
    result = format_excel_date("1")
    assert result == "01/01/1900", f"Expected '01/01/1900' but got '{result}'"


def test_format_excel_date_leap_year_bug():
    """Test gestione bug Excel del 1900 bisestile."""
    # 01/03/1900 = serial 61 (dopo il bug)
    result = format_excel_date("61")
    assert result == "01/03/1900", f"Expected '01/03/1900' but got '{result}'"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
