import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock modules that might be missing or need mocking
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['flask_login'] = MagicMock()
sys.modules['flask_login'].login_required = lambda f: f

# Setup specific mocks
sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

from flask import Flask
from werkzeug.datastructures import FileStorage
from io import BytesIO

# Import the blueprint
# We need to ensure we can import it even if we've mocked stuff
from backend.app.routes import voice_quality

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def test_manipulate_file_error_leakage(self):
        """Test that manipulate_file does not leak internal error details."""
        # Mock the service to raise an exception with sensitive info
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = ValueError("SENSITIVE_DB_INFO_123")
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        data = {
            'audio': (BytesIO(b'fake audio'), 'test.wav'),
            'pitch_shift': 0.0
        }

        # We expect a 500 because the service raises an error
        try:
            response = self.client.post(
                '/api/voice-quality/manipulate',
                data=data,
                content_type='multipart/form-data'
            )
        except Exception as e:
            # If the code crashes due to syntax error, catch it
            self.fail(f"Code crashed with exception: {e}")

        self.assertEqual(response.status_code, 500)
        json_data = response.get_json()

        # This assertion will fail currently because the code returns str(e)
        self.assertNotIn("SENSITIVE_DB_INFO_123", json_data.get('error', ''), "Internal error details leaked to client!")
        self.assertEqual(json_data.get('error'), "An internal error occurred during voice manipulation.")

    def test_clean_audio_error_leakage(self):
        """Test that clean_audio does not leak internal error details."""
        # Mock load_audio to raise exception
        sys.modules['backend.app.voice_quality_analysis'].load_audio.side_effect = ValueError("SENSITIVE_PATH_INFO_XYZ")

        data = {
            'audio': (BytesIO(b'fake audio'), 'test.wav')
        }

        try:
            response = self.client.post(
                '/api/voice-quality/clean',
                data=data,
                content_type='multipart/form-data'
            )
        except Exception as e:
             self.fail(f"Code crashed with exception: {e}")

        self.assertEqual(response.status_code, 500)
        json_data = response.get_json()

        # This assertion will fail currently
        self.assertNotIn("SENSITIVE_PATH_INFO_XYZ", json_data.get('error', ''), "Internal error details leaked to client!")
        self.assertEqual(json_data.get('error'), "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
