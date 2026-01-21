import sys
import os
import unittest
from unittest.mock import MagicMock, patch
from io import BytesIO

# Add backend to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# --- MOCKING MODULES BEFORE IMPORTING APP CODE ---
# We mock all external dependencies and internal services to isolate the route logic

# Mock extensions first
mock_extensions = MagicMock()
mock_limiter = MagicMock()
mock_limiter.limit = lambda x: lambda f: f
mock_extensions.limiter = mock_limiter
sys.modules['backend.app.extensions'] = mock_extensions

# Mock models
sys.modules['backend.app.models'] = MagicMock()

# Mock parselmouth
sys.modules['parselmouth'] = MagicMock()

# Mock voice_quality_analysis
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()

# Mock asr_transcriber
sys.modules['backend.app.asr_transcriber'] = MagicMock()

# Mock voicelab_service
mock_voicelab = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = mock_voicelab
sys.modules['backend.app.services'] = MagicMock()

# Mock validators
mock_validators = MagicMock()
mock_validators.validate_file_upload.return_value = (True, None)
sys.modules['backend.app.validators'] = mock_validators

# Mock utils.cleanup
mock_cleanup = MagicMock()
sys.modules['backend.app.utils.cleanup'] = mock_cleanup
sys.modules['backend.app.utils'] = MagicMock()

# Now we can import flask and the blueprint
from flask import Flask
from backend.app.routes.voice_quality import voice_quality_bp

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality_bp)
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True
        # Ensure exceptions are propagated so we can catch crashes or see 500s
        self.app.config['PROPAGATE_EXCEPTIONS'] = True

    def test_manipulate_file_leak_on_error(self):
        """
        Security Test: Verify that the endpoint leaks the exception message
        instead of returning a generic error when an exception occurs.
        """
        secret_error_message = "DB_PASSWORD=secret123: Connection failed"
        mock_voicelab.manipulate_voice.side_effect = ValueError(secret_error_message)

        data = {
            'audio': (BytesIO(b"fake audio data"), 'test.wav')
        }

        try:
            response = self.client.post(
                '/api/voice-quality/manipulate',
                data=data,
                content_type='multipart/form-data'
            )

            print(f"\nResponse status: {response.status_code}")
            print(f"Response data: {response.get_data(as_text=True)}")

            self.assertEqual(response.status_code, 500)

            # This should PASS if we fixed the code (Generic error present)
            # This fails if we have the vulnerability (Specific error present)
            self.assertIn("An internal error occurred", response.get_data(as_text=True))
            self.assertNotIn(secret_error_message, response.get_data(as_text=True))

        except UnboundLocalError:
            self.fail("Security Vulnerability/Bug: UnboundLocalError crashed the server (and masked the info leak intent)")
        except Exception as e:
            if secret_error_message in str(e):
                 self.fail(f"Security Vulnerability: Exception leaked secret message: {e}")
            else:
                 raise e

if __name__ == '__main__':
    unittest.main()
