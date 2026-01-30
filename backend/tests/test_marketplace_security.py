import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager

# Add project root directory to sys.path to allow 'from backend.app.routes import ...'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock app.models and app.extensions BEFORE importing marketplace
sys.modules['app'] = MagicMock()
sys.modules['app.models'] = MagicMock()
sys.modules['app.extensions'] = MagicMock()

# Mock limiter
sys.modules['app.extensions'].limiter.limit = lambda x: lambda f: f

# Now we can import the blueprint
# We need to make sure 'backend.app.routes.marketplace' can import 'app.models'
# Since we mocked 'app.models', it should work.
from backend.app.routes import marketplace

class TestMarketplaceValidation(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(marketplace.marketplace_bp, url_prefix='/api/marketplace')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Mock current_user
        self.mock_user = MagicMock()
        self.mock_user.id = 1
        self.mock_user.is_authenticated = True

        self.client = self.app.test_client()

    def test_create_pack_invalid_data(self):
        """
        Test that creating a pack with invalid data fails with 400.
        Current vulnerability: It succeeds (201).
        """
        payload = {
            "title": "Invalid Pack",
            "description": "This pack has invalid data",
            "category": "not_a_valid_category",  # Invalid
            "target_audience": "aliens",         # Invalid
            "voice_goal": "chaos",               # Invalid
            "price_cents": -500                  # Invalid (negative)
        }

        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            with patch('backend.app.routes.marketplace.db') as mock_db:
                response = self.client.post('/api/marketplace/packs',
                                          data=json.dumps(payload),
                                          content_type='application/json')

                # Currently, this returns 201 (Created), but we want it to be 400 (Bad Request)
                # If this assertion fails (returns 201), it confirms the vulnerability exists.
                # If it passes (returns 400), it means validation is already there (unlikely).

                # We assert 400 because that is our DESIRED behavior.
                # The test is expected to FAIL initially.
                self.assertEqual(response.status_code, 400, "Should reject invalid category/price")

                response_json = response.get_json()
                if response.status_code == 400:
                    self.assertIn('error', response_json)

if __name__ == '__main__':
    unittest.main()
