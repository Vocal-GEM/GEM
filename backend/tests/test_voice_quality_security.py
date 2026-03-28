import unittest
import sys
import os
import tempfile
from unittest.mock import MagicMock, patch
from flask import Flask
from werkzeug.datastructures import FileStorage
from io import BytesIO

# Ensure we can import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestSecurityLeak(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Prepare mocks for dependencies
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

        # Setup specific mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Mock the service used in manipulate_file
        self.mock_voicelab = MagicMock()
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice = self.mock_voicelab

        # Mock voice_quality_analysis for clean_audio
        self.mock_vqa = MagicMock()
        sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal = self.mock_vqa
        sys.modules['backend.app.voice_quality_analysis'].load_audio.return_value = (MagicMock(), 22050)

        # Import the blueprint (it will use the mocks)
        # We reload it to ensure fresh import with our mocks
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
            try:
                import shutil
                shutil.rmtree(self.test_dir)
            except:
                pass

    def test_manipulate_file_leakage(self):
        """
        Test that manipulate_file does NOT leak the exception message.
        """
        # Arrange
        file_storage = FileStorage(
            stream=BytesIO(b'fake_wav_data'),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Make the service raise an exception with a secret
        secret = "INTERNAL_DB_SECRET_123"
        self.mock_voicelab.side_effect = Exception(secret)

        # Act
        response = self.client.post(
            '/api/voice-quality/manipulate',
            data={'audio': file_storage, 'pitch_shift': 0},
            content_type='multipart/form-data'
        )

        # Assert
        self.assertEqual(response.status_code, 500)
        response_json = response.get_json()

        print(f"Response: {response_json}")

        # Security Assertion: Secret must NOT be in the error message
        self.assertNotIn(secret, response_json.get('error', ''))
        self.assertIn('internal error', response_json.get('error', ''))

    def test_clean_audio_leakage(self):
        """
        Test that clean_audio does NOT leak the exception message.
        """
        # Arrange
        file_storage = FileStorage(
            stream=BytesIO(b'fake_wav_data'),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Make the service raise an exception with a secret
        secret = "INTERNAL_PATH_SECRET_456"
        self.mock_vqa.side_effect = Exception(secret)

        # Act
        response = self.client.post(
            '/api/voice-quality/clean',
            data={'audio': file_storage},
            content_type='multipart/form-data'
        )

        # Assert
        self.assertEqual(response.status_code, 500)
        response_json = response.get_json()

        print(f"Response: {response_json}")

        # Security Assertion: Secret must NOT be in the error message
        self.assertNotIn(secret, response_json.get('error', ''))
        self.assertIn('internal error', response_json.get('error', ''))

if __name__ == '__main__':
    unittest.main()
