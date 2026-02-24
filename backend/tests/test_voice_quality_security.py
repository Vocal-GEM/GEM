import unittest
import sys
import os
from unittest.mock import MagicMock, patch

# 1. Mock external dependencies FIRST
sys.modules['flask'] = MagicMock()
sys.modules['flask_login'] = MagicMock()
sys.modules['werkzeug'] = MagicMock()
sys.modules['werkzeug.security'] = MagicMock()
sys.modules['werkzeug.exceptions'] = MagicMock()
sys.modules['sqlalchemy'] = MagicMock()
sys.modules['flask_sqlalchemy'] = MagicMock()
sys.modules['flask_socketio'] = MagicMock()
sys.modules['flask_limiter'] = MagicMock()
sys.modules['flask_limiter.util'] = MagicMock()
sys.modules['flask_wtf'] = MagicMock()
sys.modules['flask_wtf.csrf'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['flask_migrate'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['librosa'] = MagicMock()
sys.modules['numpy'] = MagicMock()
sys.modules['scipy'] = MagicMock()
sys.modules['scipy.io'] = MagicMock()
sys.modules['scipy.io.wavfile'] = MagicMock()
sys.modules['requests'] = MagicMock()
sys.modules['dotenv'] = MagicMock()

# Define decorator side effect
def identity_decorator(*args, **kwargs):
    def decorator(f):
        return f
    return decorator

# Mock Blueprint
mock_flask = sys.modules['flask']
mock_bp = MagicMock()
mock_bp.route.side_effect = identity_decorator
mock_flask.Blueprint.return_value = mock_bp

mock_flask.request = MagicMock()

class MockResponse(dict):
    pass
def mock_jsonify(data):
    return MockResponse(data)
mock_flask.jsonify = mock_jsonify
mock_flask.current_app = MagicMock()
mock_flask.after_this_request = identity_decorator # mocking @after_this_request

# Mock limiter
mock_extensions = MagicMock()
mock_limiter = MagicMock()
mock_limiter.limit.side_effect = identity_decorator
mock_extensions.limiter = mock_limiter
sys.modules['backend.app.extensions'] = mock_extensions

# 2. Mock internal siblings
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()
sys.modules['backend.app.models'] = MagicMock()

# 3. Add repo root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# 4. Import the module under test
try:
    from backend.app.routes.voice_quality import manipulate_file, clean_audio
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        # Reset mocks
        mock_flask.request.files = {}
        mock_flask.request.form = {}
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_manipulate_file_leaks_exception(self, mock_os, mock_tempfile):
        """Test that manipulate_file does not leak sensitive exception details."""

        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_flask.request.files = {'audio': mock_file}
        mock_flask.request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        # Setup tempfile
        mock_temp = MagicMock()
        mock_temp.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp

        # Setup service to fail with SENSITIVE info
        mock_service = sys.modules['backend.app.services.voicelab_service']
        SENSITIVE_INFO = "DB_PASSWORD_IS_12345"
        mock_service.manipulate_voice.side_effect = Exception(SENSITIVE_INFO)

        # Setup Parselmouth
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        try:
            ret = manipulate_file()

            # Check if tuple (response, status)
            if isinstance(ret, tuple):
                response = ret[0]
                status = ret[1]
            else:
                response = ret
                status = 200

            # Verify security
            self.assertNotIn(SENSITIVE_INFO, str(response), "SECURITY VULNERABILITY: Sensitive info leaked in error message!")
            self.assertIn("An internal error occurred", str(response), "Expected generic error message")
            self.assertEqual(status, 500, "Expected 500 status code")

        except Exception as e:
            self.fail(f"Execution failed: {e}")

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_clean_audio_leaks_exception(self, mock_os, mock_tempfile):
        """Test that clean_audio does not leak sensitive exception details."""

        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_flask.request.files = {'audio': mock_file}

        # Setup tempfile
        mock_temp = MagicMock()
        mock_temp.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp

        # Setup load_audio to fail with SENSITIVE info
        mock_vqa = sys.modules['backend.app.voice_quality_analysis']
        SENSITIVE_INFO = "INTERNAL_SERVER_IP_10.0.0.1"
        mock_vqa.load_audio.side_effect = Exception(SENSITIVE_INFO)

        try:
            ret = clean_audio()

            if isinstance(ret, tuple):
                response = ret[0]
                status = ret[1]
            else:
                response = ret
                status = 200

            # Verify security
            self.assertNotIn(SENSITIVE_INFO, str(response), "SECURITY VULNERABILITY: Sensitive info leaked in error message!")
            self.assertIn("An internal error occurred", str(response), "Expected generic error message")
            self.assertEqual(status, 500, "Expected 500 status code")

        except Exception as e:
            self.fail(f"Execution failed: {e}")

if __name__ == '__main__':
    unittest.main()
