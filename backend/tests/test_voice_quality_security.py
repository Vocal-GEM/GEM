import unittest
import sys
import os
import tempfile
import shutil
from unittest.mock import MagicMock, patch
from flask import Flask, jsonify
from werkzeug.datastructures import FileStorage
from io import BytesIO

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        # Create a fresh app for each test
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.test_dir = tempfile.mkdtemp()
        self.app.config['UPLOAD_FOLDER'] = self.test_dir

        # Mock extensions and other modules before importing blueprint
        self.modules_patcher = patch.dict(sys.modules, {
            'backend.app.extensions': MagicMock(),
            'backend.app.models': MagicMock(),
            'backend.app.validators': MagicMock(),
            'backend.app.voice_quality_analysis': MagicMock(),
            'backend.app.asr_transcriber': MagicMock(),
            'backend.app.utils': MagicMock(),
            'backend.app.utils.cleanup': MagicMock(),
            'backend.app.services': MagicMock(),
            'backend.app.services.voicelab_service': MagicMock(),
            'parselmouth': MagicMock(),
            'soundfile': MagicMock(),
        })
        self.modules_patcher.start()

        # Configure mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Reload blueprint to apply mocks
        if 'backend.app.routes.voice_quality' in sys.modules:
            del sys.modules['backend.app.routes.voice_quality']

        from backend.app.routes.voice_quality import voice_quality_bp
        self.app.register_blueprint(voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_manipulate_file_exception_leakage(self):
        """Test that manipulate_file endpoint does not leak exception details."""
        # Setup request data
        data = {
            'audio': (BytesIO(b'fake audio'), 'test.wav'),
            'pitch_shift': '0.0'
        }

        # Mock service to raise a sensitive exception
        secret_message = "DB_PASSWORD_IS_HUNTER2"
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = Exception(secret_message)

        # Mock parselmouth Sound to avoid actual file processing
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        response = self.client.post('/api/voice-quality/manipulate',
                                  data=data,
                                  content_type='multipart/form-data')

        self.assertEqual(response.status_code, 500)
        response_json = response.get_json()

        # The test fails if the secret message is in the response error
        if secret_message in response_json.get('error', ''):
            self.fail(f"SECURITY VULNERABILITY: Exception message leaked to client! Got: {response_json['error']}")

        self.assertEqual(response_json.get('error'), 'An internal error occurred during voice manipulation.')

    def test_clean_audio_exception_leakage(self):
        """Test that clean_audio endpoint does not leak exception details."""
        # Setup request data
        data = {
            'audio': (BytesIO(b'fake audio'), 'test.wav')
        }

        # Mock load_audio to raise a sensitive exception
        secret_message = "API_KEY_IS_12345"
        sys.modules['backend.app.voice_quality_analysis'].load_audio.side_effect = Exception(secret_message)

        response = self.client.post('/api/voice-quality/clean',
                                  data=data,
                                  content_type='multipart/form-data')

        self.assertEqual(response.status_code, 500)
        response_json = response.get_json()

        # The test fails if the secret message is in the response error
        if secret_message in response_json.get('error', ''):
            self.fail(f"SECURITY VULNERABILITY: Exception message leaked to client! Got: {response_json['error']}")

        self.assertEqual(response_json.get('error'), 'An internal error occurred during audio cleaning.')

if __name__ == '__main__':
    unittest.main()
