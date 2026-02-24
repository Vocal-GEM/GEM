import unittest
import sys
import os
import tempfile
import shutil
from unittest.mock import MagicMock, patch

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies BEFORE importing the blueprint
sys.modules['flask'] = MagicMock()
sys.modules['flask_login'] = MagicMock()
sys.modules['flask_limiter'] = MagicMock()
sys.modules['flask_wtf'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['flask_migrate'] = MagicMock()
sys.modules['dotenv'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()
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

# Setup Flask mocks
mock_flask = sys.modules['flask']
mock_bp = MagicMock()
mock_flask.Blueprint.return_value = mock_bp

# Fix route decorator to return the original function
def route_side_effect(*args, **kwargs):
    def decorator(f):
        return f
    return decorator
mock_bp.route.side_effect = route_side_effect

# Fix limiter decorator
mock_ext = sys.modules['backend.app.extensions']
mock_ext.limiter = MagicMock()
mock_ext.limiter.limit.side_effect = route_side_effect

mock_flask.request = MagicMock()
mock_flask.jsonify = lambda x: (x, 500 if 'error' in x else 200)
mock_flask.current_app = MagicMock()

# Import the blueprint
from backend.app.routes.voice_quality import manipulate_file, clean_audio

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        mock_flask.request.files = {}
        mock_flask.request.form = {}
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_manipulate_file_security(self, mock_os, mock_tempfile):
        """Test that manipulate_file does not leak internal error details."""
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_flask.request.files = {'audio': mock_file}
        mock_flask.request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        mock_temp = MagicMock()
        mock_temp.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp

        # Force an error with SENSITIVE info
        SENSITIVE_INFO = "DB_PASSWORD_LEAK"
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = Exception(SENSITIVE_INFO)
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        ret = manipulate_file()

        if isinstance(ret, tuple) and len(ret) == 2:
            response, status = ret
            # Handle double wrapping due to jsonify mock returning a tuple
            if isinstance(response, tuple) and len(response) == 2:
                response = response[0]
        else:
            response = ret
            status = 200

        self.assertEqual(status, 500)
        self.assertIn('error', response)
        self.assertNotIn(SENSITIVE_INFO, str(response))
        self.assertEqual(response['error'], "An internal error occurred during voice manipulation.")

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_clean_audio_security(self, mock_os, mock_tempfile):
        """Test that clean_audio does not leak internal error details."""
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_flask.request.files = {'audio': mock_file}

        mock_temp = MagicMock()
        mock_temp.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp

        # Force an error with SENSITIVE info
        SENSITIVE_INFO = "INTERNAL_IP_LEAK"
        sys.modules['backend.app.voice_quality_analysis'].load_audio.side_effect = Exception(SENSITIVE_INFO)

        ret = clean_audio()

        if isinstance(ret, tuple) and len(ret) == 2:
            response, status = ret
            # Handle double wrapping due to jsonify mock returning a tuple
            if isinstance(response, tuple) and len(response) == 2:
                response = response[0]
        else:
            response = ret
            status = 200

        self.assertEqual(status, 500)
        self.assertIn('error', response)
        self.assertNotIn(SENSITIVE_INFO, str(response))
        self.assertEqual(response['error'], "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
