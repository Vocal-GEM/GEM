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
from backend.app.routes import tts

class TestTTSSecurity(unittest.TestCase):
    def setUp(self):
        # Setup a real Flask app for context
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test'
        self.app.config['LOGIN_DISABLED'] = False # Ensure login is required checks run
        self.app.register_blueprint(tts.tts_bp)

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        @self.login_manager.request_loader
        def load_user_from_request(request):
            return None # Simulate anonymous user

        self.client = self.app.test_client()

        # Patch the API key to ensure we don't hit 503 check
        patcher = patch('backend.app.routes.tts.ELEVENLABS_API_KEY', 'test_key')
        self.addCleanup(patcher.stop)
        patcher.start()

    def test_synthesize_unauthenticated(self):
        """
        Test that synthesize endpoint requires authentication.
        Currently it does not, so this test expects success (200) until fixed.
        """
        with patch('backend.app.routes.tts.requests.post') as mock_post:
            mock_post.return_value.ok = True
            mock_post.return_value.content = b'audio data'
            mock_post.return_value.status_code = 200

            # Simulate anonymous request
            payload = {"text": "Hello", "voiceId": "test_voice"}
            response = self.client.post('/api/tts/synthesize',
                                     data=json.dumps(payload),
                                     content_type='application/json')

            # Expect 401 Unauthorized
            print(f"Synthesize Response Status: {response.status_code}")
            self.assertEqual(response.status_code, 401)

    def test_voices_unauthenticated(self):
        """
        Test that voices endpoint requires authentication.
        """
        with patch('backend.app.routes.tts.requests.get') as mock_get:
            mock_get.return_value.ok = True
            mock_get.return_value.json.return_value = {"voices": []}
            mock_get.return_value.status_code = 200

            response = self.client.get('/api/tts/voices')

            # Expect 401 Unauthorized
            print(f"Voices Response Status: {response.status_code}")
            self.assertEqual(response.status_code, 401)

    def test_malicious_voice_id(self):
        """
        Test path traversal in voice_id.
        """
        with patch('backend.app.routes.tts.requests.post') as mock_post:
            mock_post.return_value.ok = True
            mock_post.return_value.content = b'audio data'

            # Need to simulate a logged-in user to pass the login check (once implemented)
            # But here we assume we are using a logged in user simulation if we were to fix it fully.
            # However, since we mock 'load_user_from_request' to return None in setUp, we are anonymous.
            # We need to override that for this test.
            pass

        # We will create a new test client for authenticated user
        # or patch flask_login.utils._get_user

        with patch('flask_login.utils._get_user') as mock_get_user:
            mock_user = MagicMock()
            mock_user.is_authenticated = True
            mock_get_user.return_value = mock_user

            payload = {"text": "Hello", "voiceId": "../../../etc/passwd"}
            response = self.client.post('/api/tts/synthesize',
                                     data=json.dumps(payload),
                                     content_type='application/json')

            # Expect 400 Bad Request due to validation failure
            print(f"Malicious Voice Response Status: {response.status_code}")
            self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
