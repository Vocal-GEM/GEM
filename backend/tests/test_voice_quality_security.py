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
# We need to mock these modules because they are imported by voice_quality.py or its dependencies
# and we want to isolate the tests from the actual implementation of these dependencies.

sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock() # Mock soundfile too
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()

# Mock cleanup_file_after_request specifically since it's imported
sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)


class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        # Reset global mocks
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.reset_mock(return_value=True, side_effect=True)
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = None

        # We must reload the module to ensure fresh mocks are used if other tests ran before
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

        from backend.app.routes import voice_quality
        self.voice_quality = voice_quality

        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

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

        # We need to patch where it is IMPORTED in the route file
        mock_service = sys.modules['backend.app.services.voicelab_service']
        mock_service.manipulate_voice.return_value = mock_sound
        mock_service.manipulate_voice.side_effect = None # Clear any previous side effects

        # Mock parselmouth.Sound
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        # Mock send_file to avoid FileNotFoundError since we don't actually create files
        # We patch the 'send_file' attribute on the module object explicitly
        with patch.object(self.voice_quality, 'send_file', return_value='file_content'):
            response = self.client.post(
                '/api/voice-quality/manipulate',
                data={'audio': file_storage, 'pitch_shift': '0.0'},
                content_type='multipart/form-data'
            )

            self.assertEqual(response.status_code, 200, f"Should return 200 OK, got {response.status_code}")

    def test_manipulate_file_error_handling_security(self):
        """
        Test that an internal error returns a generic error message and does NOT leak details (CWE-209).
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

        mock_service = sys.modules['backend.app.services.voicelab_service']
        mock_service.manipulate_voice.side_effect = ValueError(secret_message)

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

    def test_clean_audio_error_handling_security(self):
        """
        Test that an internal error in clean_audio returns a generic error message and does NOT leak details.
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock load_audio to raise exception
        secret_message = "PATH_TRAVERSAL_ATTEMPT_DETECTED"

        # Patch load_audio on the module object explicitly
        with patch.object(self.voice_quality, 'load_audio', side_effect=ValueError(secret_message)):
             response = self.client.post(
                '/api/voice-quality/clean',
                data={'audio': file_storage},
                content_type='multipart/form-data'
            )

             self.assertEqual(response.status_code, 500)
             data = response.get_json()

             self.assertNotIn(secret_message, data.get('error', ''), "Should NOT leak internal error details")
             self.assertEqual(data.get('error'), "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
