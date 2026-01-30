import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager

# Add backend directory to sys.path so 'app' module can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock dependencies
sys.modules['app.extensions'] = MagicMock()
sys.modules['app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.extensions'] = sys.modules['app.extensions']

# Mock models
mock_models = MagicMock()
sys.modules['app.models'] = mock_models
sys.modules['backend.app.models'] = mock_models

# Import the blueprint
# We need to make sure we can import it even if it uses 'from app.models'
from app.routes import marketplace

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test'

        # Register blueprint
        self.app.register_blueprint(marketplace.marketplace_bp, url_prefix='/api/marketplace')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Mock DB
        self.patcher_db = patch('app.routes.marketplace.db')
        self.mock_db = self.patcher_db.start()

        # Mock User and current_user
        self.mock_user = MagicMock()
        self.mock_user.id = 1
        self.mock_user.is_authenticated = True

        self.client = self.app.test_client()

    def tearDown(self):
        self.patcher_db.stop()

    def test_create_pack_validation_negative_price(self):
        """
        Test that creating a pack with negative price is rejected.
        """
        payload = {
            "title": "Bad Pack",
            "description": "Test",
            "price_cents": -500,
            "category": "pitch",
            "target_audience": "beginner",
            "voice_goal": "feminine"
        }

        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            response = self.client.post('/api/marketplace/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            # Should be 400 Bad Request
            self.assertEqual(response.status_code, 400, "Should reject negative price")
            self.assertIn("price", response.get_json().get('error', '').lower())

    def test_create_pack_validation_invalid_category(self):
        """
        Test that creating a pack with invalid category is rejected.
        """
        payload = {
            "title": "Bad Pack",
            "description": "Test",
            "price_cents": 100,
            "category": "invalid_category",
            "target_audience": "beginner",
            "voice_goal": "feminine"
        }

        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            response = self.client.post('/api/marketplace/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            # Should be 400 Bad Request
            self.assertEqual(response.status_code, 400, "Should reject invalid category")
            self.assertIn("category", response.get_json().get('error', '').lower())

    def test_create_pack_xss_payload(self):
        """
        Test that creating a pack with XSS payload is sanitized.
        This test checks the existing sanitization.
        """
        payload = {
            "title": "<script>alert(1)</script>Safe Title",
            "description": "<b>Bold</b>",
            "price_cents": 100,
            "category": "pitch",
            "target_audience": "beginner",
            "voice_goal": "feminine"
        }

        # Mock ExercisePack constructor or db.session.add to capture the object
        # We can inspect the arguments passed to ExercisePack constructor
        # But ExercisePack is a mocked class from app.models

        # Since we mocked app.models, ExercisePack is a MagicMock.
        # But the route imports ExercisePack.

        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            with patch('app.routes.marketplace.ExercisePack') as MockExercisePack:
                response = self.client.post('/api/marketplace/packs',
                                          data=json.dumps(payload),
                                          content_type='application/json')

                self.assertEqual(response.status_code, 201)

                # Verify arguments
                call_args = MockExercisePack.call_args[1] # kwargs
                self.assertNotIn("<script>", call_args['title'])
                self.assertIn("Safe Title", call_args['title'])

if __name__ == '__main__':
    unittest.main()
