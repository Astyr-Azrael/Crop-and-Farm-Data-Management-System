import tempfile
import unittest
from pathlib import Path

from backend.app import create_app


VALID_RECORD = {
    "farm_name": "Sugarcane Farm - Plot A",
    "location": "Taluka Karad, Satara District, Maharashtra",
    "area": 2.0,
    "sugarcane_variety": "Co 86032 (Nira)",
    "soil_type": "Medium Black Soil (Vertisol)",
    "plantation_date": "2026-05-10",
    "growth_stage": "Grand Growth (101-270 days)",
}


class FarmApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database = Path(self.temp_dir.name) / "test.db"
        self.app = create_app(self.database)
        self.app.config.update(TESTING=True)
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["database"], "connected")

    def test_mandatory_fields_and_positive_area_are_validated(self):
        missing = self.client.post("/api/farms", json={})
        self.assertEqual(missing.status_code, 400)
        self.assertIn("farm_name", missing.get_json()["errors"])

        invalid = {**VALID_RECORD, "area": 0}
        response = self.client.post("/api/farms", json=invalid)
        self.assertEqual(response.status_code, 400)
        self.assertIn("area", response.get_json()["errors"])

    def test_create_retrieve_update_export_and_delete_record(self):
        created = self.client.post("/api/farms", json=VALID_RECORD)
        self.assertEqual(created.status_code, 201)
        record = created.get_json()
        self.assertEqual(record["farm_name"], VALID_RECORD["farm_name"])

        retrieved = self.client.get(f"/api/farms/{record['id']}")
        self.assertEqual(retrieved.status_code, 200)
        self.assertEqual(retrieved.get_json()["soil_type"], VALID_RECORD["soil_type"])

        updated_payload = {**VALID_RECORD, "growth_stage": "Maturity (271-365 days)"}
        updated = self.client.put(f"/api/farms/{record['id']}", json=updated_payload)
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.get_json()["growth_stage"], "Maturity (271-365 days)")

        dashboard = self.client.get("/api/dashboard").get_json()
        self.assertEqual(dashboard["total_farms"], 1)
        self.assertEqual(dashboard["total_area"], 2.0)

        export = self.client.get("/api/farms/export.csv")
        self.assertEqual(export.status_code, 200)
        self.assertIn(b"Sugarcane Farm - Plot A", export.data)

        deleted = self.client.delete(f"/api/farms/{record['id']}")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(self.client.get("/api/farms").get_json(), [])


if __name__ == "__main__":
    unittest.main()
