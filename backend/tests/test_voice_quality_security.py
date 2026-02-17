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
sys.modules['soundfile'] = MagicMock()

# Mock cleanup_file_after_request specifically since it's imported
sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

# Import the blueprint
from backend.app.routes import voice_quality

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.app.config['UPLOAD_FOLDER'] = self.test_dir
        self.app.config['SECRET_KEY'] = 'test'
        self.client = self.app.test_client()

        # Prepare mocks
        self.mock_file = FileStorage(
            stream=BytesIO(b'fake audio'),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_manipulate_file_success(self):
        """
        Test that a successful manipulation returns 200 OK.
        """
        # Mock manipulate_voice to return a mock Sound object
        mock_sound = MagicMock()
        mock_sound.save = MagicMock()

        with patch('backend.app.services.voicelab_service.manipulate_voice', return_value=mock_sound):
            with patch('parselmouth.Sound', return_value=MagicMock()):
                with patch('backend.app.routes.voice_quality.send_file', return_value='file_content'):
                    response = self.client.post(
                        '/api/voice-quality/manipulate',
                        data={'audio': self.mock_file, 'pitch_shift': '0.0'},
                        content_type='multipart/form-data'
                    )
                    self.assertEqual(response.status_code, 200)

    def test_manipulate_file_error_no_leak(self):
        """
        Test that an internal error in manipulation does NOT leak details.
        """
        # Force an error with a secret message
        secret = "INTERNAL_SECRET_ERROR"
        with patch('backend.app.services.voicelab_service.manipulate_voice', side_effect=ValueError(secret)):
             with patch('parselmouth.Sound', return_value=MagicMock()):
                # We need a new file stream because the previous one was consumed
                file_storage = FileStorage(
                    stream=BytesIO(b'fake audio'),
                    filename='test.wav',
                    name='audio',
                    content_type='audio/wav'
                )

                response = self.client.post(
                    '/api/voice-quality/manipulate',
                    data={'audio': file_storage, 'pitch_shift': '0.0'},
                    content_type='multipart/form-data'
                )

                self.assertEqual(response.status_code, 500)
                data = response.get_json()
                self.assertNotIn(secret, data.get('error', ''), "Error message leaked internal details!")
                self.assertEqual(data.get('error'), "An internal error occurred during voice manipulation.")

    def test_clean_audio_error_no_leak(self):
        """
        Test that an internal error in clean_audio does NOT leak details.
        """
        secret = "SENSITIVE_PATH_INFO"
        with patch('backend.app.routes.voice_quality.load_audio', side_effect=Exception(secret)):
             # We need a new file stream
             file_storage = FileStorage(
                 stream=BytesIO(b'fake audio'),
                 filename='test.wav',
                 name='audio',
                 content_type='audio/wav'
             )

             response = self.client.post(
                 '/api/voice-quality/clean',
                 data={'audio': file_storage},
                 content_type='multipart/form-data'
             )

             self.assertEqual(response.status_code, 500)
             data = response.get_json()
             self.assertNotIn(secret, data.get('error', ''), "Error message leaked internal details!")
             self.assertEqual(data.get('error'), "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
