import unittest
import sys
import os
import tempfile
from unittest.mock import MagicMock, patch
from flask import Flask
from io import BytesIO

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# --- MOCKING STRATEGY ---
# Mock dependencies BEFORE any import from backend.app happens.

# Mock extensions
extensions_mock = MagicMock()
extensions_mock.db = MagicMock()
extensions_mock.login_manager = MagicMock()
extensions_mock.limiter.limit = lambda x: lambda f: f # Mock limiter decorator
extensions_mock.csrf = MagicMock()
extensions_mock.socketio = MagicMock()
extensions_mock.migrate = MagicMock()
sys.modules['backend.app.extensions'] = extensions_mock

# Mock models
sys.modules['backend.app.models'] = MagicMock()

# Mock internal modules
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()

# Mock services
services_mock = MagicMock()
voicelab_service_mock = MagicMock()
sys.modules['backend.app.services'] = services_mock
sys.modules['backend.app.services.voicelab_service'] = voicelab_service_mock

# Mock external libs
sys.modules['parselmouth'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['flask_socketio'] = MagicMock()
sys.modules['flask_migrate'] = MagicMock()

from backend.app.routes import voice_quality

class TestVoiceSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    def test_manipulate_file_leak_vulnerability(self):
        """
        Test that the manipulate_file endpoint NO LONGER leaks exception details.
        """
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        mock_service = sys.modules['backend.app.services.voicelab_service']
        secret_message = "CRITICAL_DATABASE_CONNECTION_STRING_LEAKED"
        mock_service.manipulate_voice.side_effect = Exception(secret_message)

        data = {
            'audio': (BytesIO(b'fake audio content'), 'test.wav'),
            'pitch_shift': '1.0'
        }

        response = self.client.post('/api/voice-quality/manipulate',
                                    data=data,
                                    content_type='multipart/form-data')

        json_data = response.get_json()
        print(f"\nResponse JSON: {json_data}")

        # VERIFICATION: The secret message must NOT be in the response
        self.assertNotIn(secret_message, str(json_data), "Security Check Failed: Exception message leaked!")

        # VERIFICATION: The generic error message SHOULD be present
        self.assertIn("An internal error occurred", json_data['error'], "Generic error message not found")

        self.assertEqual(response.status_code, 500)

    def test_manipulate_file_success_fixed(self):
        """
        Test that the endpoint now works correctly on success (no longer crashes).
        """
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        mock_service = sys.modules['backend.app.services.voicelab_service']

        # Mock sound object to support save method
        mock_sound = MagicMock()

        # When save is called, create the file so send_file can find it
        def side_effect_save(path, format):
            with open(path, 'wb') as f:
                f.write(b'processed audio content')
        mock_sound.save.side_effect = side_effect_save

        mock_service.manipulate_voice.return_value = mock_sound
        mock_service.manipulate_voice.side_effect = None # Reset side effect

        data = {
            'audio': (BytesIO(b'fake audio content'), 'test.wav'),
            'pitch_shift': '1.0'
        }

        # We need to ensure we don't mock open completely since we use it in side_effect
        # But we mocked os.remove previously.
        # We can just let os.remove fail or pass.

        response = self.client.post('/api/voice-quality/manipulate',
                                    data=data,
                                    content_type='multipart/form-data')

        print(f"\nSuccess Case Response status: {response.status_code}")
        if response.status_code != 200:
             print(f"Response Data: {response.get_data()}")

        # VERIFICATION: Should return 200 OK
        self.assertEqual(response.status_code, 200, "Success case failed (likely crashed)")
        self.assertEqual(response.mimetype, 'audio/wav')

if __name__ == '__main__':
    unittest.main()
