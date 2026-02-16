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

        # Import needs to happen inside setUp or after patches are active
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

        # We need to mock 'send_file' because in a real Flask app it tries to open the file
        # But our temp file might not exist or be empty in this mocked env
        with patch('backend.app.routes.voice_quality.send_file') as mock_send:
            # Mock return value of send_file to be something serializable or ignored by test client logic if needed,
            # but usually client follows it.
            # Actually, let's mock open/write if needed.
            # But the easiest way is to mock send_file to return a simple response
            mock_send.return_value = "file_content"

            with patch('backend.app.services.voicelab_service.manipulate_voice', return_value=mock_sound):
                with patch('parselmouth.Sound', return_value=MagicMock()):
                     response = self.client.post(
                        '/api/voice-quality/manipulate',
                        data={'audio': file_storage, 'pitch_shift': '0.0'},
                        content_type='multipart/form-data'
                    )
                     # Since we mocked send_file to return string "file_content",
                     # Flask will likely treat it as valid response body.
                     self.assertEqual(response.status_code, 200)

    def test_manipulate_file_error_handling(self):
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

        # We mock the service that raises the exception
        # Note: We need to ensure we are patching the object that is actually used.
        # Since we imported voice_quality, it imported voicelab_service.

        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = ValueError(secret_message)

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
            self.assertEqual(data.get('error'), "An internal error occurred during voice manipulation.")

if __name__ == '__main__':
    unittest.main()
