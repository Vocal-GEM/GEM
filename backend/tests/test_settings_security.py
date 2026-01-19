import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies before importing routes
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()

from backend.app.routes import settings

class TestSettingsSecurity(unittest.TestCase):
    def setUp(self):
        # Setup a real Flask app for context
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(settings.settings_bp, url_prefix='/api/settings')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Mock DB
        self.patcher_db = patch('backend.app.routes.settings.db')
        self.mock_db = self.patcher_db.start()

        self.client = self.app.test_client()

    def tearDown(self):
        self.patcher_db.stop()

    def test_update_settings_error_leakage(self):
        """
        Test that update_settings does NOT leak internal exception details.
        """
        payload = {"theme": "dark"}

        # Setup login
        mock_user = MagicMock()
        mock_user.id = '123'
        mock_user.is_authenticated = True
        # Ensure user has settings
        mock_settings = MagicMock()
        mock_settings.preferences = {}
        mock_user.settings = mock_settings

        with patch('flask_login.utils._get_user', return_value=mock_user):
            # Mock db.session.commit to raise an exception with sensitive info
            sensitive_info = "Connection failed to database at 192.168.1.5:5432"
            self.mock_db.session.commit.side_effect = Exception(sensitive_info)

            response = self.client.put('/api/settings',
                                    data=json.dumps(payload),
                                    content_type='application/json')

            self.assertEqual(response.status_code, 500)

            # Security Check: The sensitive info should NOT be in the response
            # Currently this assertion is expected to FAIL until we fix the code
            self.assertNotIn(sensitive_info, response.get_json()['error'])
            self.assertEqual(response.get_json()['error'], "An error occurred while saving settings")

if __name__ == '__main__':
    unittest.main()
