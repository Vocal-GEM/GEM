import unittest
import sys
import os
import tempfile
import shutil
from unittest.mock import MagicMock, patch
from flask import Flask

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
            'soundfile': MagicMock(),
            'backend.app.utils': MagicMock(),
            'backend.app.utils.cleanup': MagicMock(),
            # Mock flask_cors, flask_migrate, dotenv as they are likely used in app/__init__
            'flask_cors': MagicMock(),
            'flask_migrate': MagicMock(),
            'dotenv': MagicMock(),
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

    def test_manipulate_file_success(self):
        """
        Test that a successful manipulation returns 200 OK.
        """
        from io import BytesIO
        from werkzeug.datastructures import FileStorage

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

        # Mock Parsemouth Sound to return a mock object
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        # Mock the service
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.return_value = mock_sound
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = None # Clear any previous side effect

        # Mock send_file to avoid FileNotFoundError since we don't actually create files
        # We can't patch where it's imported easily if it's 'from flask import send_file'
        # But we can patch flask.send_file? No, because it's imported as 'send_file'
        # We can try to patch 'backend.app.routes.voice_quality.send_file'

        with patch('backend.app.routes.voice_quality.send_file') as mock_send_file:
            mock_send_file.return_value = 'file_content'

            response = self.client.post(
                '/api/voice-quality/manipulate',
                data={'audio': file_storage, 'pitch_shift': '0.0'},
                content_type='multipart/form-data'
            )

            self.assertEqual(response.status_code, 200, "Should return 200 OK")

    def test_manipulate_file_error_handling_leakage(self):
        """
        Test that an internal error returns a generic error message and does NOT leak details.
        """
        from io import BytesIO
        from werkzeug.datastructures import FileStorage

        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock manipulate_voice to RAISE an exception with a secret/internal message
        secret_message = "DB_CONNECTION_FAILED_SECRET_IP_1.2.3.4"

        # We need to patch where it is IMPORTED in the route file, or where it is defined if imported directly.
        # In voice_quality.py: from ..services.voicelab_service import manipulate_voice
        # Since we mocked backend.app.services.voicelab_service in sys.modules, we can configure it there.

        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = ValueError(secret_message)

        # Also mock Sound to avoid issues
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        # Also mock send_file because the route imports it from flask.
        # But wait, send_file is imported from flask in the route.
        # We can patch 'backend.app.routes.voice_quality.send_file' if needed, but we expect an error before send_file.

        response = self.client.post(
            '/api/voice-quality/manipulate',
            data={'audio': file_storage, 'pitch_shift': '0.0'},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 500)
        data = response.get_json()

        # SECURITY CHECK: It SHOULD NOT leak the secret message
        self.assertNotIn(secret_message, data.get('error', ''), "Should NOT leak internal error details")
        self.assertEqual(data.get('error'), "An internal error occurred during voice manipulation.")

if __name__ == '__main__':
    unittest.main()
