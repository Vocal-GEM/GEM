import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies BEFORE importing routes
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()

# Now we can import the blueprint
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

    def test_update_settings_error_leak(self):
        """
        Test that update_settings currently leaks internal exception details.
        """
        payload = {"theme": "dark"}

        sensitive_error = "Database connection failed: secret_host:5432 user=admin password=secret"

        # Mock current_user
        mock_user = MagicMock()
        mock_user.is_authenticated = True
        mock_user.settings = MagicMock()
        mock_user.settings.preferences = {}

        with patch('flask_login.utils._get_user', return_value=mock_user):
            # Make commit raise an exception with sensitive info
            self.mock_db.session.commit.side_effect = Exception(sensitive_error)

            response = self.client.put('/api/settings',
                                      data=json.dumps(payload),
                                      content_type='application/json')

            self.assertEqual(response.status_code, 500)
            data = json.loads(response.data)

            # VERIFICATION:
            # We assert that the sensitive error is NOT present in the response.
            self.assertNotIn(sensitive_error, data['error'], "Vulnerability found: Sensitive exception details leaked!")
            self.assertEqual(data['error'], "An error occurred while updating settings")

if __name__ == '__main__':
    unittest.main()
