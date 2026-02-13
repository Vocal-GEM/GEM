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

        # 1. Setup global mocks for dependencies to avoid ImportErrors and external calls
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
            'soundfile': MagicMock(),
            'numpy': MagicMock(),
            'librosa': MagicMock(),
        })
        self.modules_patcher.start()

        # 2. Configure specific mock behaviors
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Mock load_audio to return dummy data
        sys.modules['backend.app.voice_quality_analysis'].load_audio.return_value = (MagicMock(), 22050)

        # 3. Import the blueprint (reloading to ensure mocks are used)
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

        from backend.app.routes import voice_quality
        self.voice_quality = voice_quality

        # 4. Setup Flask app with the blueprint
        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

    def test_clean_audio_exception_leakage(self):
        """
        Test that an exception in clean_audio does NOT leak internal error details.
        """
        # Create dummy file
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Define a secret that should NOT be leaked
        SECRET_ERROR = "DB_CONNECTION_FAILED_SECRET_IP_1.2.3.4"

        # Mock clean_audio_signal to raise an exception with the secret
        # We need to mock it on the IMPORTED module because that's what the route uses
        self.voice_quality.clean_audio_signal.side_effect = Exception(SECRET_ERROR)

        # Also ensure load_audio works
        self.voice_quality.load_audio.return_value = (MagicMock(), 22050)

        # Make the request
        response = self.client.post(
            '/api/voice-quality/clean',
            data={'audio': file_storage},
            content_type='multipart/form-data'
        )

        # Check response
        self.assertEqual(response.status_code, 500)
        data = response.get_json()

        # THE VULNERABILITY CHECK:
        # If the secret is present, we are leaking info.
        self.assertNotIn(SECRET_ERROR, str(data), "Security Vulnerability: Exception message leaked to client!")
        self.assertIn("An internal error occurred", str(data), "Expected generic error message")

    def test_manipulate_file_exception_leakage(self):
        """
        Test that an exception in manipulate_file does NOT leak internal error details.
        """
        # Create dummy file
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test_manipulate.wav',
            name='audio',
            content_type='audio/wav'
        )

        SECRET_ERROR = "MANIPULATE_SECRET_ERROR"

        # Configure mock to raise exception
        # Note: manipulate_file imports manipulate_voice inside the function,
        # so it will pick up our sys.modules mock at runtime.
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = Exception(SECRET_ERROR)

        # Ensure parselmouth.Sound doesn't crash before manipulate_voice is called
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        # Make the request
        response = self.client.post(
            '/api/voice-quality/manipulate',
            data={'audio': file_storage, 'pitch_shift': '0.0'},
            content_type='multipart/form-data'
        )

        # Check response
        self.assertEqual(response.status_code, 500)
        data = response.get_json()

        self.assertNotIn(SECRET_ERROR, str(data), "Security Vulnerability: Exception message leaked to client!")
        self.assertIn("An internal error occurred", str(data), "Expected generic error message")

if __name__ == '__main__':
    unittest.main()
