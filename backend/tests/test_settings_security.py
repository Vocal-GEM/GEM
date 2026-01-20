import unittest
import sys
import os
from unittest.mock import MagicMock, patch
from flask import Flask

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f

# Mock models
models_mock = MagicMock()
models_mock.db = MagicMock()
sys.modules['backend.app.models'] = models_mock

from backend.app.routes import settings

class TestSettingsSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(settings.settings_bp)
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    def test_update_settings_generic_error(self):
        """
        Test that update_settings returns a generic error message instead of leaking exception details.
        """
        # Mock current_user
        mock_user = MagicMock()
        # Ensure settings exist so it goes to update path
        mock_user.settings.preferences = {}
        mock_user.is_authenticated = True

        # We need to patch where flask_login gets the user
        with patch('flask_login.utils._get_user', return_value=mock_user):

            # Mock db.session.commit to fail
            # settings.py imports db from ..models
            # So we access it via the mock we set up
            mock_db = sys.modules['backend.app.models'].db
            secret_error = "DB_SECRET_STRUCTURE_ERROR"
            mock_db.session.commit.side_effect = Exception(secret_error)

            response = self.client.put('/api/settings', json={'theme': 'dark'})

            # Verify response
            self.assertEqual(response.status_code, 500)
            json_data = response.get_json()

            # Security Check
            self.assertNotIn(secret_error, str(json_data), "Exception details leaked!")
            self.assertEqual(json_data['error'], "Failed to update settings")

if __name__ == '__main__':
    unittest.main()
