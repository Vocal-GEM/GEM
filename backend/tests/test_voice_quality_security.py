
import unittest
import sys
import os
import tempfile
import shutil
from unittest.mock import MagicMock, patch
from io import BytesIO

# Add repo root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Prepare mocks
        self.mock_limiter = MagicMock()
        self.mock_limiter.limit.return_value = lambda f: f

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
            'flask_limiter': MagicMock(),
        })
        self.modules_patcher.start()

        # Configure mocks
        sys.modules['backend.app.extensions'].limiter = self.mock_limiter
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Import blueprint inside test method or after patching
        # To avoid global import issues, we import here but ensure patching is active
        # We need to reload or clear the module if it was already imported?
        # Since we run this test in isolation or fresh process, it should be fine.
        # But if other tests ran before, we might have issues.
        # However, for this task, we assume fresh run.

        # We need to import Flask here because it might be mocked in other tests if we are not careful
        from flask import Flask
        from backend.app.routes import voice_quality

        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_clean_audio_leak(self):
        """Test that clean_audio does not leak exception details."""
        print("\nTesting clean_audio security leak...")

        with patch('backend.app.routes.voice_quality.load_audio', side_effect=Exception("SENSITIVE_DB_PASSWORD_123")):
            with patch('tempfile.NamedTemporaryFile') as mock_temp:
                mock_temp.return_value.__enter__.return_value.name = "/tmp/test.wav"

                data = {
                    'audio': (BytesIO(b'fake audio'), 'test.wav')
                }

                response = self.client.post('/api/voice-quality/clean', data=data, content_type='multipart/form-data')

                self.assertEqual(response.status_code, 500)
                response_json = response.get_json()
                self.assertNotIn("SENSITIVE_DB_PASSWORD_123", str(response_json), "Exception message leaked to client")
                self.assertEqual(response_json.get('error'), 'An internal error occurred during audio cleaning.')

    def test_manipulate_file_leak(self):
        """Test that manipulate_file does not leak exception details."""
        print("\nTesting manipulate_file security leak...")

        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = Exception("SENSITIVE_API_KEY_XYZ")
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        with patch('tempfile.NamedTemporaryFile') as mock_temp:
            mock_temp.return_value.__enter__.return_value.name = "/tmp/test.wav"

            data = {
                'audio': (BytesIO(b'fake audio'), 'test.wav'),
                'pitch_shift': '0.0',
                'formant_shift': '1.0'
            }

            response = self.client.post('/api/voice-quality/manipulate', data=data, content_type='multipart/form-data')

            self.assertEqual(response.status_code, 500)
            response_json = response.get_json()
            self.assertNotIn("SENSITIVE_API_KEY_XYZ", str(response_json), "Exception message leaked to client")
            self.assertEqual(response_json.get('error'), 'An internal error occurred during voice manipulation.')

if __name__ == '__main__':
    unittest.main()
