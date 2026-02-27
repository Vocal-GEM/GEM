import unittest
import sys
import os
import tempfile
import shutil
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from werkzeug.datastructures import FileStorage
from io import BytesIO

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies BEFORE importing the blueprint
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()

# Mock cleanup_file_after_request specifically since it's imported
sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

# Import the blueprint
from backend.app.routes import voice_quality

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Configure mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

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

        # Mock send_file to return something
        with patch('backend.app.routes.voice_quality.send_file', return_value='file_content'):
             # We need to mock 'parselmouth.Sound' inside the route
             with patch.dict(sys.modules, {'parselmouth': MagicMock()}):
                 sys.modules['parselmouth'].Sound.return_value = MagicMock()

                 # Mock manipulate_voice inside the service module
                 with patch('backend.app.services.voicelab_service.manipulate_voice', return_value=mock_sound):
                        response = self.client.post(
                            '/api/voice-quality/manipulate',
                            data={'audio': file_storage, 'pitch_shift': '0.0'},
                            content_type='multipart/form-data'
                        )

                        self.assertEqual(response.status_code, 200, "Should return 200 OK")

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

        secret_message = "DB_CONNECTION_FAILED_SECRET_IP_1.2.3.4"

        with patch.dict(sys.modules, {'parselmouth': MagicMock()}):
             sys.modules['parselmouth'].Sound.return_value = MagicMock()

             with patch('backend.app.services.voicelab_service.manipulate_voice', side_effect=ValueError(secret_message)):
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
