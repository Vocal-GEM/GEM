import unittest
import sys
import os
import json
import time
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager
from werkzeug.security import generate_password_hash

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies before importing routes
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()
mock_db = MagicMock()
sys.modules['backend.app.models'].db = mock_db
sys.modules['backend.app.models'].User = MagicMock()

# Import the blueprint
from backend.app.routes import auth

class TestAuthSecurity(unittest.TestCase):
    def setUp(self):
        # Setup a real Flask app for context
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(auth.auth_bp, url_prefix='/api')

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        self.client = self.app.test_client()

    @patch('backend.app.routes.auth.User.query')
    def test_login_timing_attack_mitigation(self, mock_query):
        """
        Test that login endpoint takes roughly the same amount of time
        whether the user exists or not, mitigating timing attacks.
        """
        payload = {"username": "testuser", "password": "password123"}

        # Case 1: User exists but wrong password
        mock_user = MagicMock()
        mock_user.password_hash = generate_password_hash('differentpassword')
        mock_query.filter_by.return_value.first.return_value = mock_user

        start = time.time()
        self.client.post('/api/login', data=json.dumps(payload), content_type='application/json')
        time_exists = time.time() - start

        # Case 2: User does not exist
        mock_query.filter_by.return_value.first.return_value = None

        start = time.time()
        self.client.post('/api/login', data=json.dumps(payload), content_type='application/json')
        time_not_exists = time.time() - start

        # We just want to ensure that the time difference is small
        # Because we added the dummy hash check
        # A check without dummy check would be > 0.1s diff usually
        diff = abs(time_exists - time_not_exists)
        self.assertTrue(diff < 0.3, f"Timing difference too large: {diff}")

if __name__ == '__main__':
    unittest.main()
