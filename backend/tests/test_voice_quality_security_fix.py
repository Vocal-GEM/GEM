import sys
import unittest
from unittest.mock import MagicMock, patch
import json
from io import BytesIO

# Mock external dependencies that might not be installed or are heavy
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()

# Mock specific functions/variables imported from these modules
sys.modules['backend.app.voice_quality_analysis'].GOAL_PRESETS = {"transfem_soft_slightly_breathy": {}}
sys.modules['backend.app.voice_quality_analysis'].analyze_file = MagicMock(side_effect=Exception("Internal Analysis Error"))
sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal = MagicMock(side_effect=Exception("Internal Cleaning Error"))
sys.modules['backend.app.services.voicelab_service'].manipulate_voice = MagicMock(side_effect=Exception("Internal Manipulation Error"))

# Mock validator to pass
# returns (is_valid, error_message)
sys.modules['backend.app.validators'].validate_file_upload = MagicMock(return_value=(True, None))

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        # We need to patch the blueprint import or the app creation
        from flask import Flask
        self.app = Flask(__name__)

        # Mock limiter to avoid errors
        self.limiter_mock = MagicMock()
        self.limiter_mock.limit = lambda x: lambda f: f

        # Patch the imports inside voice_quality.py context
        with patch('backend.app.extensions.limiter', self.limiter_mock):
             try:
                 from backend.app.routes import voice_quality
                 self.bp = voice_quality.voice_quality_bp
                 self.app.register_blueprint(self.bp)
             except Exception as e:
                 self.fail(f"Failed to import voice_quality blueprint: {e}")

        self.client = self.app.test_client()

    def test_clean_audio_error_handling(self):
        """Test that /clean handles errors without leaking info"""
        # Mock file upload
        data = {
            'audio': (BytesIO(b'dummy audio data'), 'test.wav')
        }

        # calling the endpoint
        response = self.client.post('/api/voice-quality/clean', data=data, content_type='multipart/form-data')

        if response.status_code != 500:
             print(f"FAILED Clean Audio Response: {response.get_json()}")

        # We expect 500 error
        self.assertEqual(response.status_code, 500)

        # We expect a generic error message, NOT "Internal Cleaning Error"
        json_response = response.get_json()

        # Check for CWE-209: The error message should NOT contain the specific exception string
        self.assertNotIn("Internal Cleaning Error", json_response.get('error', ''))
        self.assertEqual(json_response.get('error'), "An internal error occurred during audio cleaning.")

    def test_manipulate_file_error_handling(self):
        """Test that /manipulate handles errors without leaking info"""
        # Mock file upload
        data = {
            'audio': (BytesIO(b'dummy audio data'), 'test.wav'),
            'pitch_shift': 1.0,
            'formant_shift': 1.0
        }

        # calling the endpoint
        response = self.client.post('/api/voice-quality/manipulate', data=data, content_type='multipart/form-data')

        if response.status_code != 500:
             print(f"FAILED Manipulate Audio Response: {response.get_json()}")

        # We expect 500 error
        self.assertEqual(response.status_code, 500)

        # We expect a generic error message, NOT "Internal Manipulation Error"
        json_response = response.get_json()

        self.assertNotIn("Internal Manipulation Error", json_response.get('error', ''))
        self.assertEqual(json_response.get('error'), "An internal error occurred during voice manipulation.")

if __name__ == '__main__':
    unittest.main()
