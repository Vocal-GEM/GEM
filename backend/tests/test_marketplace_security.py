import unittest
from unittest.mock import MagicMock, patch
import sys
import os
import json

# Add repo root and backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'backend')))

# Mock dependencies
sys.modules['backend.app.models'] = MagicMock()
sys.modules['app.models'] = sys.modules['backend.app.models'] # Alias
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['app.extensions'] = sys.modules['backend.app.extensions'] # Alias
sys.modules['flask_login'] = MagicMock()

# Configure mocks
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['flask_login'].login_required = lambda f: f

from flask import Flask
from backend.app.routes.marketplace import marketplace_bp

class TestMarketplaceSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(marketplace_bp, url_prefix='/api/marketplace')
        self.client = self.app.test_client()

        # Setup Login Mock
        self.patcher = patch('flask_login.utils._get_user')
        self.mock_current_user = self.patcher.start()
        self.mock_current_user.is_authenticated = True
        self.mock_current_user.id = 1

        # Mock DB
        self.db_patcher = patch('backend.app.routes.marketplace.db')
        self.mock_db = self.db_patcher.start()

    def tearDown(self):
        self.patcher.stop()
        self.db_patcher.stop()

    def test_create_pack_negative_price(self):
        """Test that creating a pack with negative price is rejected"""
        payload = {
            "title": "Bad Price Pack",
            "description": "This should fail",
            "category": "pitch",
            "target_audience": "beginner",
            "voice_goal": "feminine",
            "price_cents": -500,  # malicious negative price
            "exercises": []
        }

        with patch('flask_login.utils._get_user') as mock_user:
            mock_user.return_value.is_authenticated = True
            mock_user.return_value.id = 1

            response = self.client.post('/api/marketplace/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            # Should fail with 400, but currently expects 201 (vulnerability)
            if response.status_code == 201:
                print("VULNERABILITY CONFIRMED: Negative price accepted")

            self.assertEqual(response.status_code, 400, "Should reject negative price")

    def test_create_pack_invalid_category(self):
        """Test that creating a pack with invalid category is rejected"""
        payload = {
            "title": "Bad Category Pack",
            "description": "This should fail",
            "category": "hacking_tools",  # invalid category
            "target_audience": "beginner",
            "voice_goal": "feminine",
            "price_cents": 1000,
            "exercises": []
        }

        with patch('flask_login.utils._get_user') as mock_user:
            mock_user.return_value.is_authenticated = True
            mock_user.return_value.id = 1

            response = self.client.post('/api/marketplace/packs',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            if response.status_code == 201:
                print("VULNERABILITY CONFIRMED: Invalid category accepted")

            self.assertEqual(response.status_code, 400, "Should reject invalid category")

if __name__ == '__main__':
    unittest.main()
