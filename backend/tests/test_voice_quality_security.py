import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock modules that might not be importable in test env
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()

# Import Flask related mocks
from flask import Flask
from werkzeug.datastructures import FileStorage
from io import BytesIO

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        # Create a fresh app for each test
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True

        # Import the blueprint inside setup to ensure mocks are active
        # We need to patch the blueprint import in the test file if it's already imported?
        # Or just import it here.

        # We need to make sure we can import the blueprint.
        # The blueprint imports other things.

        with patch('backend.app.extensions.limiter') as mock_limiter:
            mock_limiter.limit.return_value = lambda x: x

            with patch('backend.app.validators.validate_file_upload') as mock_validate:
                mock_validate.return_value = (True, None)

                # Import the blueprint module
                from backend.app.routes.voice_quality import voice_quality_bp
                self.voice_quality_bp = voice_quality_bp

        self.app.register_blueprint(self.voice_quality_bp)
        self.client = self.app.test_client()

    def test_manipulate_file_error_handling(self):
        """
        Test that an internal error returns a generic error message and does NOT leak details.
        """
        # Mock validate to pass
        with patch('backend.app.validators.validate_file_upload', return_value=(True, None)):
            # Mock tempfile to avoid FS ops
            with patch('tempfile.NamedTemporaryFile') as mock_temp:
                mock_temp.return_value.__enter__.return_value.name = "/tmp/test.wav"

                # Mock parselmouth
                with patch('parselmouth.Sound') as mock_sound:
                    # Force an error with a secret message
                    secret_message = "DB_CONNECTION_FAILED_SECRET_IP_1.2.3.4"

                    # Mock manipulate_voice to raise exception
                    with patch('backend.app.services.voicelab_service.manipulate_voice', side_effect=ValueError(secret_message)):

                        data = {
                            'audio': (BytesIO(b'fake audio'), 'test.wav'),
                            'pitch_shift': '0.0'
                        }

                        response = self.client.post(
                            '/api/voice-quality/manipulate',
                            data=data,
                            content_type='multipart/form-data'
                        )

                        self.assertEqual(response.status_code, 500)
                        json_data = response.get_json()

                        # SECURITY CHECK: It SHOULD NOT leak the secret message
                        self.assertNotIn(secret_message, str(json_data), "Should NOT leak internal error details")
                        self.assertEqual(json_data.get('error'), "An internal error occurred during voice manipulation.")

    def test_clean_audio_error_handling(self):
        """
        Test clean_audio error handling prevents leakage.
        """
        with patch('backend.app.validators.validate_file_upload', return_value=(True, None)):
             with patch('tempfile.NamedTemporaryFile') as mock_temp:
                mock_temp.return_value.__enter__.return_value.name = "/tmp/test.wav"

                # Mock load_audio to raise exception
                with patch('backend.app.voice_quality_analysis.load_audio', side_effect=Exception("SECRET_PATH_ERROR")):

                    data = {
                        'audio': (BytesIO(b'fake audio'), 'test.wav')
                    }

                    response = self.client.post(
                        '/api/voice-quality/clean',
                        data=data,
                        content_type='multipart/form-data'
                    )

                    self.assertEqual(response.status_code, 500)
                    json_data = response.get_json()

                    self.assertNotIn("SECRET_PATH_ERROR", str(json_data))
                    self.assertEqual(json_data.get('error'), "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
