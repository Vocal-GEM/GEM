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
        self.test_dir = tempfile.mkdtemp()

        # Patch sys.modules to mock dependencies
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
        })
        self.modules_patcher.start()

        # Configure specific mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Reload the module under test
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
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

    def test_manipulate_file_error_handling_no_leak(self):
        """
        Test that an internal error in manipulation returns a generic error message
        and does NOT leak details (e.g. stack trace or sensitive info).
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

        # We need to mock the service that is imported inside the route or at module level
        # In voice_quality.py: `from ..services.voicelab_service import manipulate_voice`
        mock_service = sys.modules['backend.app.services.voicelab_service']
        mock_service.manipulate_voice.side_effect = ValueError(secret_message)

        # Also mock parselmouth.Sound to avoid errors before the exception
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

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
