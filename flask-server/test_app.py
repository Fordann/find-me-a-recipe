import unittest
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
import json

class TestFlaskAPI(unittest.TestCase):
    def setUp(self):
        """Set up test client"""
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    def test_research_recipe_endpoint_exists(self):
        """Test that research_recipe endpoint exists and returns valid response"""
        response = self.client.post('/research_recipe', 
                                    json={'language': 'fr', 'ingredients': {'aqt': 'tomate'}},
                                    content_type='application/json')
        self.assertIn(response.status_code, [200, 404])

    def test_research_recipe_with_english_language(self):
        """Test that English language parameter triggers translation"""
        response = self.client.post('/research_recipe',
                                    json={'language': 'en', 'ingredients': {'aqt': 'tomato'}},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_research_recipe_with_french_language(self):
        """Test that French language parameter skips translation"""
        response = self.client.post('/research_recipe',
                                    json={'language': 'fr', 'ingredients': {'aqt': 'tomate'}},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_detailed_recipe_endpoint(self):
        """Test detailed recipe endpoint"""
        response = self.client.post('/detailed_recipe',
                                    json={'language': 'fr', 'ingredients': {'aqt': 'pâtes carbonara'}},
                                    content_type='application/json')
        self.assertIn(response.status_code, [200, 404, 502])

    def test_detailed_recipe_with_translation(self):
        """Test detailed recipe with English translation"""
        response = self.client.post('/detailed_recipe',
                                    json={'language': 'en', 'ingredients': {'aqt': 'pasta carbonara'}},
                                    content_type='application/json')
        self.assertIn(response.status_code, [200, 404, 502])

    def test_history_endpoint(self):
        """Test history GET endpoint"""
        response = self.client.get('/history')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_history_clear_endpoint(self):
        """Test history clear endpoint"""
        response = self.client.post('/history/clear')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'cleared')

    def test_favorites_get_endpoint(self):
        """Test get favorites endpoint"""
        response = self.client.get('/favorites')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_favorites_toggle_endpoint(self):
        """Test toggle favorite endpoint"""
        response = self.client.post('/favorites/toggle',
                                    json={'name': 'Test Recipe'},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('status', data)
        self.assertIn(data['status'], ['added', 'removed'])

    def test_favorites_toggle_missing_name(self):
        """Test toggle favorite with missing name returns error"""
        response = self.client.post('/favorites/toggle',
                                    json={},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_image_ingredient_endpoint(self):
        """Test image ingredient endpoint"""
        response = self.client.post('/image_ingredient',
                                    json={'ingredient': 'tomate'},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('image', data)

    def test_recipe_image_endpoint_missing_name(self):
        """Test recipe image endpoint with missing name"""
        response = self.client.post('/recipe_image',
                                    json={},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 400)

class TestTranslator(unittest.TestCase):
    """Test translator functions"""
    
    def test_translate_to_french(self):
        """Test English to French translation"""
        from translator import translate_to_french
        result = translate_to_french("tomato")
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)

    def test_translate_to_english(self):
        """Test French to English translation"""
        from translator import translate_to_english
        result = translate_to_english("tomate")
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)

    def test_translate_empty_string(self):
        """Test translation of empty string"""
        from translator import translate_to_french, translate_to_english
        self.assertEqual(translate_to_french(""), "")
        self.assertEqual(translate_to_english(""), "")

    def test_translate_recipe_list(self):
        """Test recipe list translation"""
        from translator import translate_recipe_list_to_english
        recipes = [
            {'name': 'Pâtes carbonara', 'image': 'test.jpg'},
            {'name': 'Tarte aux pommes', 'image': 'test2.jpg'}
        ]
        result = translate_recipe_list_to_english(recipes)
        self.assertEqual(len(result), 2)
        self.assertIsInstance(result[0]['name'], str)

class TestImageScraper(unittest.TestCase):
    """Test image scraper functions"""
    
    def test_get_image_from_ingredient(self):
        """Test image URL generation for ingredient"""
        from image_scraper import getImageFromIngredient
        result = getImageFromIngredient("tomato")
        self.assertIsInstance(result, str)
        self.assertTrue(result.startswith("https://"))

    def test_get_image_from_dict_ingredient(self):
        """Test image URL generation from dict"""
        from image_scraper import getImageFromIngredient
        result = getImageFromIngredient({"ingredient": "tomato"})
        self.assertIsInstance(result, str)

    def test_get_image_from_empty_input(self):
        """Test image URL generation with empty input"""
        from image_scraper import getImageFromIngredient
        result = getImageFromIngredient("")
        self.assertIsNone(result)

if __name__ == '__main__':
    unittest.main()
