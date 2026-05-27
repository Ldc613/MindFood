from pathlib import Path
import sys
import tempfile
import unittest


ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from app import app  # noqa: E402
from database.init_db import init_database  # noqa: E402


class WhatToEatApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "test.db"
        init_database(self.db_path)
        app.config.update(TESTING=True, DATABASE=str(self.db_path))
        self.client = app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def response_data(self, response):
        payload = response.get_json()
        self.assertIn("success", payload)
        self.assertTrue(payload["success"])
        self.assertIn("data", payload)
        return payload["data"]

    def test_restaurants_filter_by_cuisine_and_price(self):
        response = self.client.get("/api/restaurants?cuisine=面食&price=0-20")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertGreaterEqual(len(data), 1)
        self.assertTrue(all(item["cuisine"] == "面食" for item in data))
        self.assertTrue(all(item["price_range"] == "0-20" for item in data))

    def test_restaurants_filter_by_source_type(self):
        response = self.client.get("/api/restaurants?source_type=canteen")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertGreaterEqual(len(data), 1)
        self.assertTrue(all(item["source_type"] == "canteen" for item in data))

    def test_restaurants_search_by_name_or_cuisine(self):
        response = self.client.get("/api/restaurants?keyword=牛肉")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertGreaterEqual(len(data), 1)
        self.assertTrue(
            all("牛肉" in item["name"] or "牛肉" in item["cuisine"] for item in data)
        )

    def test_restaurants_filters_out_diet_restrictions(self):
        response = self.client.get("/api/restaurants?diet=not_spicy,no_cilantro")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertGreaterEqual(len(data), 1)
        self.assertTrue(
            all(
                "spicy" not in item["diet_tags"]
                and "cilantro" not in item["diet_tags"]
                for item in data
            )
        )

    def test_restaurants_vegetarian_filter(self):
        response = self.client.get("/api/restaurants?diet=vegetarian")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertGreaterEqual(len(data), 1)
        self.assertTrue(all("vegetarian" in item["diet_tags"] for item in data))

    def test_random_restaurants_respects_seafood_allergy(self):
        response = self.client.get("/api/restaurants/random?diet=no_seafood&count=3")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertGreaterEqual(len(data), 1)
        self.assertTrue(all("seafood" not in item["diet_tags"] for item in data))

    def test_restaurants_pagination_returns_eight_per_page(self):
        response = self.client.get("/api/restaurants?page=1")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertEqual(data["page"], 1)
        self.assertEqual(data["page_size"], 8)
        self.assertEqual(data["total"], 10)
        self.assertEqual(data["total_pages"], 2)
        self.assertEqual(len(data["items"]), 8)

    def test_restaurants_excludes_blocked_ids(self):
        response = self.client.get("/api/restaurants?blocked_ids=1&page=1")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertEqual(data["total"], 9)
        self.assertTrue(all(item["id"] != 1 for item in data["items"]))

    def test_restaurants_prioritizes_preferred_ids(self):
        response = self.client.get("/api/restaurants?preferred_ids=6&page=1")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertEqual(data["items"][0]["id"], 6)

    def test_random_restaurants_prefers_preferred_ids(self):
        response = self.client.get(
            "/api/restaurants/random?source_type=takeout&price=20-40&preferred_ids=8&count=1"
        )

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], 8)

    def test_random_restaurants_returns_one_to_three_items(self):
        response = self.client.get("/api/restaurants/random?source_type=takeout&price=20-40")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertGreaterEqual(len(data), 1)
        self.assertLessEqual(len(data), 3)
        self.assertTrue(all(item["source_type"] == "takeout" for item in data))
        self.assertTrue(all(item["price_range"] == "20-40" for item in data))

    def test_restaurant_detail_contains_complete_display_fields(self):
        response = self.client.get("/api/restaurants/1?user_id=student_001")

        self.assertEqual(response.status_code, 200)
        data = self.response_data(response)
        self.assertIn("signature_dishes", data)
        self.assertIn("opening_hours", data)
        self.assertIn("avg_spend", data)
        self.assertIn("review_summary", data)
        self.assertGreaterEqual(len(data["signature_dishes"]), 1)

    def test_toggle_favorite_and_get_favorites(self):
        add_response = self.client.post(
            "/api/favorite",
            json={"user_id": "student_001", "restaurant_id": 1},
        )

        self.assertEqual(add_response.status_code, 200)
        self.assertTrue(self.response_data(add_response)["favorited"])

        list_response = self.client.get("/api/favorites?user_id=student_001")
        favorites = self.response_data(list_response)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(favorites), 1)
        self.assertEqual(favorites[0]["id"], 1)

        remove_response = self.client.post(
            "/api/favorite",
            json={"user_id": "student_001", "restaurant_id": 1},
        )
        self.assertEqual(remove_response.status_code, 200)
        self.assertFalse(self.response_data(remove_response)["favorited"])

    def test_error_when_restaurant_not_found(self):
        response = self.client.get("/api/restaurants/999")

        self.assertEqual(response.status_code, 404)
        payload = response.get_json()
        self.assertFalse(payload["success"])
        self.assertIn("error", payload)


if __name__ == "__main__":
    unittest.main()
