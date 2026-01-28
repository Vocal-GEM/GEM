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

        # Mock voice_quality_analysis constants and functions
        sys.modules['backend.app.voice_quality_analysis'].GOAL_PRESETS = {
            'transfem_soft_slightly_breathy': {}
        }
        sys.modules['backend.app.voice_quality_analysis'].analyze_file = MagicMock(return_value={})
        sys.modules['backend.app.voice_quality_analysis'].analyze_file_with_transcript = MagicMock(return_value={})
        sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal = MagicMock(return_value=None)
        sys.modules['backend.app.voice_quality_analysis'].load_audio = MagicMock(return_value=(None, None))

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
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        self.modules_patcher.stop()
        # Clean up the module to prevent side effects on other tests
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

    def test_manipulate_file_success(self):
        """
        Test that a successful manipulation returns 200 OK.
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock manipulate_voice to return a mock Sound object
        mock_sound = MagicMock()
        mock_sound.save = MagicMock()

        # We need to mock send_file because we aren't creating real files
        # The route imports send_file from flask, but inside the function it uses the global one.
        # However, since we import the blueprint, we need to patch where it's used.
        # But `backend.app.routes.voice_quality` imports it as `from flask import ... send_file`
        # So we patch `backend.app.routes.voice_quality.send_file`

        with patch('backend.app.services.voicelab_service.manipulate_voice', return_value=mock_sound):
            with patch('parselmouth.Sound', return_value=MagicMock()):
                with patch('backend.app.routes.voice_quality.send_file') as mock_send_file:
                    mock_send_file.return_value = "file_sent"

                    response = self.client.post(
                        '/api/voice-quality/manipulate',
                        data={'audio': file_storage, 'pitch_shift': '0.0'},
                        content_type='multipart/form-data'
                    )

                    self.assertEqual(response.status_code, 200, "Should return 200 OK")

    def test_manipulate_file_exception_leakage(self):
        """
        Test that an internal error returns a generic error message and does NOT leak details.
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

        with patch('backend.app.services.voicelab_service.manipulate_voice', side_effect=ValueError(secret_message)):
             with patch('parselmouth.Sound', return_value=MagicMock()):
                response = self.client.post(
                    '/api/voice-quality/manipulate',
                    data={'audio': file_storage, 'pitch_shift': '0.0'},
                    content_type='multipart/form-data'
                )

                self.assertEqual(response.status_code, 500)
                data = response.get_json()

                # SECURITY CHECK: It SHOULD NOT leak the secret message
                self.assertNotIn(secret_message, data.get('error', ''), "Should NOT leak internal error details")
                self.assertIn("internal error", data.get('error', '').lower(), "Should return generic error message")

if __name__ == '__main__':
    unittest.main()
