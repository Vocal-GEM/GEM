import sys
import os
import unittest
import json
from unittest.mock import MagicMock, patch
from flask import Flask

# Add backend directory to sys.path so 'app' can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock extensions before importing marketplace
sys.modules['app.extensions'] = MagicMock()
# Properly mock limiter.limit to act as a decorator that returns the original function
sys.modules['app.extensions'].limiter.limit.side_effect = lambda *args, **kwargs: lambda f: f

sys.modules['app.models'] = MagicMock()

# We need to ensure 'app' is importable and has 'models'
import app
app.models = sys.modules['app.models']
app.extensions = sys.modules['app.extensions']

from app.routes import marketplace

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(marketplace.marketplace_bp, url_prefix='/api')
        self.client = self.app.test_client()

        # Setup Mocks
        self.mock_db = MagicMock()
        marketplace.db = self.mock_db
        self.mock_exercise_pack = MagicMock()
        marketplace.ExercisePack = self.mock_exercise_pack

        self.mock_pack_exercise = MagicMock()
        marketplace.PackExercise = self.mock_pack_exercise

    def test_create_pack_invalid_input_rejected(self):
        """
        Test that create_pack REJECTS invalid data (security fix verification).
        """
        with patch('flask_login.utils._get_user') as mock_user_loader:
            user = MagicMock()
            user.is_authenticated = True
            user.id = 123
            mock_user_loader.return_value = user

            # 1. Invalid Category
            payload = {
                "title": "Bad Pack",
                "category": "<script>alert(1)</script>", # XSS / Invalid
                "price_cents": 100
            }
            response = self.client.post('/api/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')
            self.assertEqual(response.status_code, 400)
            self.assertIn('Invalid category', response.get_json()['error'])
            self.mock_exercise_pack.assert_not_called()

            # 2. Negative Price
            payload = {
                "title": "Bad Price",
                "category": "pitch", # Valid
                "price_cents": -5000
            }
            response = self.client.post('/api/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')
            self.assertEqual(response.status_code, 400)
            self.assertIn('Price must be a non-negative integer', response.get_json()['error'])
            self.mock_exercise_pack.assert_not_called()

    def test_create_pack_valid_input_accepted(self):
        """
        Test that create_pack ACCEPTS valid data.
        """
        with patch('flask_login.utils._get_user') as mock_user_loader:
            user = MagicMock()
            user.is_authenticated = True
            user.id = 123
            mock_user_loader.return_value = user

            payload = {
                "title": "Good Pack",
                "description": "A good pack",
                "category": "pitch",
                "target_audience": "beginner",
                "voice_goal": "feminine",
                "price_cents": 1000
            }

            response = self.client.post('/api/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            self.assertEqual(response.status_code, 201)

            # Verify constructor called with correct data
            call_args = self.mock_exercise_pack.call_args[1]
            self.assertEqual(call_args['category'], 'pitch')
            self.assertEqual(call_args['price_cents'], 1000)

if __name__ == '__main__':
    unittest.main()
