import csv
import io
import os
from pathlib import Path

from flask import Flask, Response, jsonify, request, send_from_directory
from flask_cors import CORS

try:
    from .database import connect, initialize_database, row_to_dict
    from .validation import validate_farm
except ImportError:
    from database import connect, initialize_database, row_to_dict
    from validation import validate_farm


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def create_app(database_path=None, seed_samples=True):
    app = Flask(__name__, static_folder=None)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.config["DATABASE"] = database_path or os.environ.get("FARM_DATABASE")
    initialize_database(app.config["DATABASE"], seed_samples=seed_samples)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "database": "connected"})

    @app.get("/api/farms")
    def list_farms():
        query = request.args.get("q", "").strip()
        stage = request.args.get("stage", "").strip()
        sql = "SELECT * FROM farms WHERE 1 = 1"
        params = []

        if query:
            sql += " AND (farm_name LIKE ? OR location LIKE ? OR sugarcane_variety LIKE ?)"
            wildcard = f"%{query}%"
            params.extend([wildcard, wildcard, wildcard])
        if stage:
            sql += " AND growth_stage = ?"
            params.append(stage)
        sql += " ORDER BY updated_at DESC, id DESC"

        with connect(app.config["DATABASE"]) as connection:
            records = [row_to_dict(row) for row in connection.execute(sql, params)]
        return jsonify(records)

    @app.get("/api/farms/<int:farm_id>")
    def get_farm(farm_id):
        with connect(app.config["DATABASE"]) as connection:
            record = connection.execute(
                "SELECT * FROM farms WHERE id = ?", (farm_id,)
            ).fetchone()
        if record is None:
            return jsonify({"message": "Farm record not found."}), 404
        return jsonify(row_to_dict(record))

    @app.post("/api/farms")
    def create_farm():
        payload = request.get_json(silent=True) or {}
        errors = validate_farm(payload)
        if errors:
            return jsonify({"message": "Please correct the highlighted fields.", "errors": errors}), 400

        values = _clean_values(payload)
        with connect(app.config["DATABASE"]) as connection:
            cursor = connection.execute(
                """
                INSERT INTO farms (
                    farm_name, location, area, sugarcane_variety,
                    soil_type, plantation_date, growth_stage
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                values,
            )
            record = connection.execute(
                "SELECT * FROM farms WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
        return jsonify(row_to_dict(record)), 201

    @app.put("/api/farms/<int:farm_id>")
    def update_farm(farm_id):
        payload = request.get_json(silent=True) or {}
        errors = validate_farm(payload)
        if errors:
            return jsonify({"message": "Please correct the highlighted fields.", "errors": errors}), 400

        with connect(app.config["DATABASE"]) as connection:
            exists = connection.execute(
                "SELECT id FROM farms WHERE id = ?", (farm_id,)
            ).fetchone()
            if exists is None:
                return jsonify({"message": "Farm record not found."}), 404

            connection.execute(
                """
                UPDATE farms SET
                    farm_name = ?, location = ?, area = ?, sugarcane_variety = ?,
                    soil_type = ?, plantation_date = ?, growth_stage = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (*_clean_values(payload), farm_id),
            )
            record = connection.execute(
                "SELECT * FROM farms WHERE id = ?", (farm_id,)
            ).fetchone()
        return jsonify(row_to_dict(record))

    @app.delete("/api/farms/<int:farm_id>")
    def delete_farm(farm_id):
        with connect(app.config["DATABASE"]) as connection:
            cursor = connection.execute("DELETE FROM farms WHERE id = ?", (farm_id,))
        if cursor.rowcount == 0:
            return jsonify({"message": "Farm record not found."}), 404
        return "", 204

    @app.get("/api/dashboard")
    def dashboard():
        with connect(app.config["DATABASE"]) as connection:
            overview = connection.execute(
                "SELECT COUNT(*) AS total_farms, COALESCE(SUM(area), 0) AS total_area FROM farms"
            ).fetchone()
            stage_rows = connection.execute(
                "SELECT growth_stage, COUNT(*) AS count FROM farms GROUP BY growth_stage ORDER BY count DESC"
            ).fetchall()
            variety_rows = connection.execute(
                "SELECT sugarcane_variety, COUNT(*) AS count FROM farms GROUP BY sugarcane_variety ORDER BY count DESC"
            ).fetchall()
            recent = connection.execute(
                "SELECT * FROM farms ORDER BY updated_at DESC, id DESC LIMIT 4"
            ).fetchall()

        return jsonify(
            {
                "total_farms": overview["total_farms"],
                "total_area": round(overview["total_area"], 2),
                "stage_distribution": [row_to_dict(row) for row in stage_rows],
                "variety_distribution": [row_to_dict(row) for row in variety_rows],
                "recent_records": [row_to_dict(row) for row in recent],
            }
        )

    @app.get("/api/farms/export.csv")
    def export_farms():
        with connect(app.config["DATABASE"]) as connection:
            records = connection.execute("SELECT * FROM farms ORDER BY id").fetchall()

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            [
                "Farm Name",
                "Location",
                "Area (acres)",
                "Sugarcane Variety",
                "Soil Type",
                "Plantation Date",
                "Crop Growth Stage",
                "Last Updated",
            ]
        )
        for row in records:
            writer.writerow(
                [
                    row["farm_name"],
                    row["location"],
                    row["area"],
                    row["sugarcane_variety"],
                    row["soil_type"],
                    row["plantation_date"],
                    row["growth_stage"],
                    row["updated_at"],
                ]
            )
        return Response(
            buffer.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=farm-records.csv"},
        )

    @app.get("/")
    @app.get("/<path:path>")
    def serve_frontend(path=""):
        if not DIST.exists():
            return jsonify(
                {
                    "message": "Frontend build not found. Run npm run dev or npm run build."
                }
            ), 404
        requested = DIST / path
        if path and requested.is_file():
            return send_from_directory(DIST, path)
        return send_from_directory(DIST, "index.html")

    return app


def _clean_values(payload):
    return (
        payload["farm_name"].strip(),
        payload["location"].strip(),
        float(payload["area"]),
        payload["sugarcane_variety"],
        payload["soil_type"],
        payload["plantation_date"],
        payload["growth_stage"],
    )


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
