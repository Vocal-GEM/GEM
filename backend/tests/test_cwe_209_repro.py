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

class TestCWE209Repro(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Patch sys.modules to mock dependencies BEFORE importing the blueprint
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
        })
        self.modules_patcher.start()

        # Configure mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Mock specific functions used in routes
        self.mock_vqa = sys.modules['backend.app.voice_quality_analysis']
        self.mock_vqa.GOAL_PRESETS = {}

        # Import the blueprint (reloading to ensure mocks are used)
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

    def test_clean_audio_does_not_leak_exception(self):
        """
        Test that /api/voice-quality/clean DOES NOT leak exception details (CWE-209).
        """
        # Prepare a dummy file
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock clean_audio_signal to raise an exception with SENSITIVE info
        sensitive_info = "DB_PASSWORD_12345"
        self.mock_vqa.load_audio.return_value = (MagicMock(), 16000)
        self.mock_vqa.clean_audio_signal.side_effect = Exception(sensitive_info)

        # We also need to mock os.remove and os.path.exists to avoid actual file ops failing
        with patch('os.remove'), patch('os.path.exists', return_value=True):
             # Also mock tempfile to avoid writing to disk
            with patch('tempfile.NamedTemporaryFile') as mock_temp:
                mock_temp.return_value.__enter__.return_value.name = "/tmp/fake.wav"

                response = self.client.post(
                    '/api/voice-quality/clean',
                    data={'audio': file_storage},
                    content_type='multipart/form-data'
                )

                self.assertEqual(response.status_code, 500)
                # The fix: response should NOT contain the sensitive string
                self.assertNotIn(sensitive_info.encode(), response.data)
                # And should contain generic message
                self.assertIn(b"An internal error occurred", response.data)

    def test_manipulate_file_does_not_leak_exception(self):
        """
        Test that /api/voice-quality/manipulate DOES NOT leak exception details (CWE-209).
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock manipulate_voice to raise an exception with SENSITIVE info
        sensitive_info = "API_KEY_SECRET_ABC"

        mock_service = sys.modules['backend.app.services.voicelab_service']
        mock_service.manipulate_voice.side_effect = Exception(sensitive_info)

        with patch('os.remove'), patch('os.path.exists', return_value=True):
             with patch('tempfile.NamedTemporaryFile') as mock_temp:
                mock_temp.return_value.__enter__.return_value.name = "/tmp/fake.wav"

                response = self.client.post(
                    '/api/voice-quality/manipulate',
                    data={'audio': file_storage, 'pitch_shift': '0.0'},
                    content_type='multipart/form-data'
                )

                self.assertEqual(response.status_code, 500)
                # The fix: response should NOT contain the sensitive string
                self.assertNotIn(sensitive_info.encode(), response.data)
                # And should contain generic message
                self.assertIn(b"An internal error occurred", response.data)

if __name__ == '__main__':
    unittest.main()
