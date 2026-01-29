import unittest
import sys
import os
import tempfile
import shutil
from unittest.mock import MagicMock, patch
from flask import Flask
from werkzeug.datastructures import FileStorage
from io import BytesIO

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Prepare mocks using patch.dict to avoid global pollution
        self.modules_patcher = patch.dict(sys.modules, {
            'backend.app.models': MagicMock(),
            'backend.app.extensions': MagicMock(),
            'backend.app.voice_quality_analysis': MagicMock(),
            'backend.app.asr_transcriber': MagicMock(),
            'backend.app.validators': MagicMock(),
            'backend.app.services': MagicMock(),
            'backend.app.services.voicelab_service': MagicMock(),
            'parselmouth': MagicMock(),
            'backend.app.utils': MagicMock(),
            'backend.app.utils.cleanup': MagicMock(),
        })
        self.modules_patcher.start()

        # Configure mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Import module under test
        # Ensure it's reloaded to use our mocks
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

        from backend.app.routes import voice_quality
        self.voice_quality = voice_quality

        self.app = Flask(__name__)
        self.app.config['UPLOAD_FOLDER'] = self.test_dir
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        # Clean up the module
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

    def test_manipulate_file_leakage(self):
        """
        Test that an internal error in manipulate_file does NOT leak exception details.
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock manipulate_voice to RAISE an exception with a secret message
        secret_message = "SENSITIVE_DB_CREDENTIALS_LEAK"

        # We need to mock the service function specifically
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = ValueError(secret_message)
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        response = self.client.post(
            '/api/voice-quality/manipulate',
            data={'audio': file_storage, 'pitch_shift': '0.0'},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 500)

        # Check that we got a JSON response
        data = response.get_json()
        self.assertIsNotNone(data, "Response should be JSON")

        error_msg = data.get('error', '')

        # SECURITY ASSERTION:
        self.assertNotIn(secret_message, error_msg, "CRITICAL: Exception message leaked to client!")
        self.assertEqual(error_msg, "An internal error occurred during voice manipulation.", "Should return generic error message")

    def test_clean_audio_leakage(self):
        """
        Test that an internal error in clean_audio does NOT leak exception details.
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock load_audio to RAISE an exception with a secret message
        secret_message = "SENSITIVE_PATH_LEAK"
        sys.modules['backend.app.voice_quality_analysis'].load_audio.side_effect = ValueError(secret_message)

        response = self.client.post(
            '/api/voice-quality/clean',
            data={'audio': file_storage},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 500)

        data = response.get_json()
        self.assertIsNotNone(data, "Response should be JSON")

        error_msg = data.get('error', '')

        # SECURITY ASSERTION:
        self.assertNotIn(secret_message, error_msg, "CRITICAL: Exception message leaked to client!")
        self.assertEqual(error_msg, "An internal error occurred during audio cleaning.", "Should return generic error message")

if __name__ == '__main__':
    unittest.main()
