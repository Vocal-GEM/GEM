import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Mock dependencies BEFORE imports
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()

# Setup app context
from flask import Flask
from flask_login import LoginManager, UserMixin

# Ensure we can import the blueprint.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.routes.tts import tts_bp

class TestTTSSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-key'
        self.app.config['LOGIN_DISABLED'] = False # Ensure login is enabled

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Simple mock user
        class MockUser(UserMixin):
            def get_id(self):
                return "1"

        @self.login_manager.user_loader
        def load_user(user_id):
            return MockUser()

        self.app.register_blueprint(tts_bp)
        self.client = self.app.test_client()

    @patch('backend.app.routes.tts.ELEVENLABS_API_KEY', 'fake-key')
    @patch('backend.app.routes.tts.requests.post')
    def test_synthesize_no_auth(self, mock_post):
        """
        Demonstrate that synthesize endpoint requires authentication.
        """
        mock_post.return_value.ok = True
        mock_post.return_value.content = b'audio'

        response = self.client.post('/api/tts/synthesize', json={
            'text': 'Hello world'
        })
        # Should be 401 Unauthorized
        self.assertEqual(response.status_code, 401)

    @patch('backend.app.routes.tts.ELEVENLABS_API_KEY', 'fake-key')
    @patch('backend.app.routes.tts.requests.get')
    def test_get_voices_no_auth(self, mock_get):
        """
        Demonstrate that voices endpoint requires authentication.
        """
        mock_get.return_value.ok = True
        mock_get.return_value.json.return_value = []

        response = self.client.get('/api/tts/voices')
        # Should be 401 Unauthorized
        self.assertEqual(response.status_code, 401)

    @patch('backend.app.routes.tts.ELEVENLABS_API_KEY', 'fake-key')
    @patch('backend.app.routes.tts.requests.post')
    def test_synthesize_invalid_input(self, mock_post):
        """
        Test that invalid voice_id/model_id are rejected.
        """
        # Mock successful response for when validation passes (though it shouldn't reach here for invalid input)
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.content = b'audio-data'
        mock_post.return_value = mock_response

        # Mock login
        with self.client.session_transaction() as sess:
            sess['_user_id'] = '1'
            sess['_fresh'] = True

        # Malicious voice_id
        response = self.client.post('/api/tts/synthesize', json={
            'text': 'Hello',
            'voiceId': '../../etc/passwd'
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid voiceId format', str(response.get_json().get('error', '')))

        # Malicious model_id
        response = self.client.post('/api/tts/synthesize', json={
            'text': 'Hello',
            'modelId': '$(whoami)'
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid modelId format', str(response.get_json().get('error', '')))

if __name__ == '__main__':
    unittest.main()
