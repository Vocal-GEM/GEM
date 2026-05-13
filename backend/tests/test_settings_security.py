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

# Import the blueprint
from backend.app.routes import settings

class TestSettingsSecurity(unittest.TestCase):
    def setUp(self):
        # Setup a real Flask app for context
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(settings.settings_bp, url_prefix='/api/settings')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Create a mock user
        self.mock_user = MagicMock()
        self.mock_user.id = 1
        self.mock_user.is_authenticated = True
        self.mock_user.settings = MagicMock()
        self.mock_user.settings.preferences = {}

        # Mock DB
        self.patcher_db = patch('backend.app.routes.settings.db')
        self.mock_db = self.patcher_db.start()

        self.client = self.app.test_client()

    def tearDown(self):
        self.patcher_db.stop()

    def test_update_settings_generic_error(self):
        """
        Test that update_settings returns a GENERIC error message on failure
        and does NOT leak exception details.
        """

        # Mock db.session.commit to raise an exception
        # We use a specific error message to verify it's being leaked
        secret_db_error = "CRITICAL_DATABASE_FAILURE_DETAILS_12345"
        self.mock_db.session.commit.side_effect = Exception(secret_db_error)

        with patch('flask_login.utils._get_user', return_value=self.mock_user):
            payload = {"theme": "dark"}

            response = self.client.put('/api/settings',
                                    data=json.dumps(payload),
                                    content_type='application/json')

            self.assertEqual(response.status_code, 500)

            data = json.loads(response.data)

            # SECURITY VERIFICATION:
            # 1. The specific exception detail should NOT be in the response
            self.assertNotIn(secret_db_error, data['error'], "Security Vulnerability: Exception details leaked!")

            # 2. The response should be the generic error message
            self.assertEqual(data['error'], "An error occurred while saving settings")

if __name__ == '__main__':
    unittest.main()
