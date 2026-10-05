import sqlite3
from contextlib import contextmanager
from pathlib import Path


DEFAULT_DATABASE = Path(__file__).resolve().parent / "farm_data.db"


@contextmanager
def connect(database_path=None):
    database = str(database_path or DEFAULT_DATABASE)
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database(database_path=None):
    with connect(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS farms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farm_name TEXT NOT NULL,
                location TEXT NOT NULL,
                area REAL NOT NULL CHECK (area > 0),
                sugarcane_variety TEXT NOT NULL,
                soil_type TEXT NOT NULL,
                plantation_date TEXT NOT NULL,
                growth_stage TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_farms_name ON farms (farm_name)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_farms_stage ON farms (growth_stage)"
        )


def row_to_dict(row):
    return dict(row) if row is not None else None
