import sqlite3
from contextlib import contextmanager
from pathlib import Path


DEFAULT_DATABASE = Path(__file__).resolve().parent / "farm_data.db"

SAMPLE_FARMS = [
    (
        "Sugarcane Farm - Plot A",
        "Taluka Karad, Satara District, Maharashtra",
        2.0,
        "Co 86032 (Nira)",
        "Medium Black Soil (Vertisol)",
        "2026-05-10",
        "Grand Growth (101-270 days)",
    ),
    ("Koyna Valley Plot B", "Karad, Satara, Maharashtra", 3.5, "Co 86032 (Nira)", "Deep Black Soil (Vertisol)", "2026-06-18", "Grand Growth (101-270 days)"),
    ("Krishna Riverside Plot", "Miraj, Sangli, Maharashtra", 4.2, "CoC 671", "Alluvial Soil", "2026-07-05", "Grand Growth (101-270 days)"),
    ("Baramati East Farm", "Baramati, Pune, Maharashtra", 6.75, "Co 0238", "Medium Black Soil (Vertisol)", "2026-08-22", "Tillering (46-100 days)"),
    ("Phaltan Green Fields", "Phaltan, Satara, Maharashtra", 5.1, "Co 15023", "Red Loamy Soil", "2026-09-01", "Tillering (46-100 days)"),
    ("Kolhapur Cane Block", "Hatkanangale, Kolhapur, Maharashtra", 3.8, "Co 86032 (Nira)", "Deep Black Soil (Vertisol)", "2026-04-14", "Maturity (271-365 days)"),
    ("Solapur South Plot", "Malshiras, Solapur, Maharashtra", 7.25, "Co 99004", "Sandy Loam", "2026-09-18", "Germination (0-45 days)"),
    ("Ahmednagar Canal Farm", "Shrirampur, Ahmednagar, Maharashtra", 8.4, "Co 0238", "Alluvial Soil", "2026-06-01", "Grand Growth (101-270 days)"),
    ("Nashik Trial Plot", "Niphad, Nashik, Maharashtra", 2.6, "Co 15023", "Sandy Loam", "2026-08-30", "Tillering (46-100 days)"),
    ("Pandharpur West Field", "Pandharpur, Solapur, Maharashtra", 4.9, "CoC 671", "Medium Black Soil (Vertisol)", "2026-09-25", "Germination (0-45 days)"),
    ("Satara Hill Base Farm", "Koregaon, Satara, Maharashtra", 3.2, "Co 86032 (Nira)", "Red Loamy Soil", "2026-05-25", "Maturity (271-365 days)"),
    ("Nira Command Plot C", "Indapur, Pune, Maharashtra", 5.65, "Co 86032 (Nira)", "Deep Black Soil (Vertisol)", "2026-07-15", "Grand Growth (101-270 days)"),
]


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


def initialize_database(database_path=None, seed_samples=True):
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
        if seed_samples:
            for record in SAMPLE_FARMS:
                exists = connection.execute(
                    "SELECT 1 FROM farms WHERE farm_name = ? AND location = ?",
                    (record[0], record[1]),
                ).fetchone()
                if exists is None:
                    connection.execute(
                        """
                        INSERT INTO farms (
                            farm_name, location, area, sugarcane_variety,
                            soil_type, plantation_date, growth_stage
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        record,
                    )


def row_to_dict(row):
    return dict(row) if row is not None else None
