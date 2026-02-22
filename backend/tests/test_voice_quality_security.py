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
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        # Clean up the module to prevent side effects on other tests
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

    def test_manipulate_file_leak(self):
        """
        Test that an error in manipulation is handled safely (generic error, no leak).
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock manipulate_voice to RAISE an exception with a secret/internal message
        secret_message = "DB_CONNECTION_FAILED_SECRET_IP_1.2.3.4"

        # We need to mock the service inside the module we imported
        # But since we patched sys.modules, we should update the mock there
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = ValueError(secret_message)

        # Also mock Sound to not crash
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        response = self.client.post(
            '/api/voice-quality/manipulate',
            data={'audio': file_storage, 'pitch_shift': '0.0'},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 500)
        data = response.get_json()

        # SECURITY CHECK: It SHOULD NOT leak the secret message
        # If the vulnerability exists, this assertion will FAIL because the secret message will be present
        if secret_message in data.get('error', ''):
             self.fail(f"SECURITY VULNERABILITY: Exception message leaked to client! Got: {data.get('error')}")

        self.assertEqual(data.get('error'), "An internal error occurred during voice manipulation.")

    def test_clean_audio_leak(self):
        """
        Test that an error in cleaning is handled safely (generic error, no leak).
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        secret_message = "INTERNAL_PATH_STRUCTURE_LEAK"

        # Mock load_audio to raise exception
        # load_audio is imported directly in voice_quality.py, so we need to mock it where it's imported
        # But wait, we imported voice_quality inside setUp.
        # It imports: from ..voice_quality_analysis import ..., clean_audio_signal, load_audio

        # We mocked 'backend.app.voice_quality_analysis' in sys.modules
        # so voice_quality.py should have imported the mock.

        sys.modules['backend.app.voice_quality_analysis'].load_audio.side_effect = Exception(secret_message)

        response = self.client.post(
            '/api/voice-quality/clean',
            data={'audio': file_storage},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 500)
        data = response.get_json()

        if secret_message in data.get('error', ''):
             self.fail(f"SECURITY VULNERABILITY: Exception message leaked to client! Got: {data.get('error')}")

        self.assertEqual(data.get('error'), "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
