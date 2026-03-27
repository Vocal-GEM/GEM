import unittest
import sys
import os
import tempfile
import shutil
import io
from unittest.mock import MagicMock, patch
from flask import Flask

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestVoiceQualityFix(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Patch modules BEFORE importing the blueprint
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

        # IMPORTANT: Set return value on the module mock itself
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Force reload of the module to apply mocks
        if 'backend.app.routes.voice_quality' in sys.modules:
            del sys.modules['backend.app.routes.voice_quality']

        from backend.app.routes import voice_quality
        self.voice_quality = voice_quality

        self.app = Flask(__name__)
        self.app.config['UPLOAD_FOLDER'] = self.test_dir
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        if 'backend.app.routes.voice_quality' in sys.modules:
            del sys.modules['backend.app.routes.voice_quality']

    def test_manipulate_file_exception_leakage(self):
        """
        Test that an internal error in manipulate_file returns a generic error
        and does NOT leak internal exception details.
        """
        # Mock the service to raise an exception with a sensitive message
        sensitive_msg = "SENSITIVE_DB_PASSWORD_LEAK"
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = ValueError(sensitive_msg)

        # Create a dummy file for upload
        data = {
            'audio': (io.BytesIO(os.urandom(100)), 'test.wav')
        }

        response = self.client.post(
            '/api/voice-quality/manipulate',
            data=data,
            content_type='multipart/form-data'
        )

        if response.status_code != 500:
            print(f"Test Failed Status Code: {response.status_code}")
            print(f"Response Data: {response.get_data(as_text=True)}")

        self.assertEqual(response.status_code, 500)
        json_data = response.get_json()

        # Verify generic error
        self.assertIn('error', json_data)
        self.assertEqual(json_data['error'], 'An internal error occurred during voice manipulation.')

        # Verify NO leakage
        self.assertNotIn(sensitive_msg, json_data['error'])

    def test_clean_audio_exception_leakage(self):
        """
        Test that an internal error in clean_audio returns a generic error
        and does NOT leak internal exception details.
        """
        # Mock load_audio to raise an exception
        sensitive_msg = "INTERNAL_PATH_STRUCTURE_LEAK"
        sys.modules['backend.app.voice_quality_analysis'].load_audio.side_effect = RuntimeError(sensitive_msg)

        data = {
            'audio': (io.BytesIO(os.urandom(100)), 'test.wav')
        }

        response = self.client.post(
            '/api/voice-quality/clean',
            data=data,
            content_type='multipart/form-data'
        )

        if response.status_code != 500:
            print(f"Test Failed Status Code: {response.status_code}")
            print(f"Response Data: {response.get_data(as_text=True)}")

        self.assertEqual(response.status_code, 500)
        json_data = response.get_json()

        # Verify generic error
        self.assertIn('error', json_data)
        self.assertEqual(json_data['error'], 'An internal error occurred during audio cleaning.')

        # Verify NO leakage
        self.assertNotIn(sensitive_msg, json_data['error'])

if __name__ == '__main__':
    unittest.main()
