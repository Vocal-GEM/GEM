import unittest
import sys
import os
import types
from unittest.mock import MagicMock, patch

# --- Helper to mock modules ---
def create_mock_module(name):
    m = types.ModuleType(name)
    sys.modules[name] = m
    return m

# --- Mock dependencies BEFORE importing the blueprint ---
if 'backend.app.routes.voice_quality' in sys.modules:
    del sys.modules['backend.app.routes.voice_quality']

# Mock external libs
sys.modules['flask'] = MagicMock()
sys.modules['flask_login'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['werkzeug.security'] = MagicMock()
sys.modules['werkzeug.datastructures'] = MagicMock()

# Mock internal app structure
if 'backend' not in sys.modules:
    create_mock_module('backend')
if 'backend.app' not in sys.modules:
    m = create_mock_module('backend.app')
    # CRITICAL: Allow finding submodules by pointing to real path
    m.__path__ = [os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/app'))]

if 'backend.app.routes' not in sys.modules:
    m = create_mock_module('backend.app.routes')
    m.__path__ = [os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/app/routes'))]

# Mock specific modules used by voice_quality.py
vqa = create_mock_module('backend.app.voice_quality_analysis')
vqa.analyze_file = MagicMock()
vqa.analyze_file_with_transcript = MagicMock()
vqa.GOAL_PRESETS = {}
vqa.clean_audio_signal = MagicMock()
vqa.load_audio = MagicMock()

asr = create_mock_module('backend.app.asr_transcriber')
asr.transcribe_audio_with_words = MagicMock()

val = create_mock_module('backend.app.validators')
val.validate_file_upload = MagicMock()

ext = create_mock_module('backend.app.extensions')
ext.limiter = MagicMock()
ext.limiter.limit = lambda x: lambda f: f

utils = create_mock_module('backend.app.utils')
cleanup = create_mock_module('backend.app.utils.cleanup')
cleanup.cleanup_file_after_request = MagicMock()

services = create_mock_module('backend.app.services')
vl_service = create_mock_module('backend.app.services.voicelab_service')
vl_service.manipulate_voice = MagicMock()

# Configure Flask mocks
mock_flask = sys.modules['flask']
mock_bp = MagicMock()
# Mock Blueprint to return a decorator that returns the function (identity)
mock_bp.route.side_effect = lambda *args, **kwargs: lambda func: func
mock_flask.Blueprint.return_value = mock_bp

mock_flask.jsonify = lambda x: (x, 500 if isinstance(x, dict) and 'error' in x else 200)
mock_flask.send_file = MagicMock()
mock_flask.after_this_request = lambda f: f
mock_flask.request = MagicMock()
mock_flask.current_app = MagicMock()

# Add repo root to sys.path so we can import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Import the module under test
from backend.app.routes.voice_quality import manipulate_file, clean_audio, analyze

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.mock_request = mock_flask.request
        self.mock_request.files = {}
        self.mock_request.form = {}
        # Reset mocks
        sys.modules['backend.app.validators'].validate_file_upload.reset_mock()
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.reset_mock()
        sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal.reset_mock()

        # Default validation success
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_manipulate_file_exception_leakage(self, mock_os, mock_tempfile):
        """Test that manipulate_file does not leak internal exception details."""
        print("\nTesting manipulate_file exception leakage...")

        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_request.files = {'audio': mock_file}
        self.mock_request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        # Mock tempfile
        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        # Simulate sensitive error
        sensitive_msg = "SENSITIVE_DB_INFO"
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = Exception(sensitive_msg)

        # Call endpoint
        ret = manipulate_file()

        # Handle unpacking
        if isinstance(ret, tuple) and len(ret) == 2:
            resp_body, status_code = ret
            # Check if resp_body is also a tuple from our mock jsonify
            if isinstance(resp_body, tuple):
                 resp_data, _ = resp_body
            else:
                 resp_data = resp_body
        else:
             self.fail(f"Unexpected return format: {ret}")

        # Verify
        self.assertEqual(status_code, 500)
        self.assertNotIn(sensitive_msg, str(resp_data))
        self.assertIn("An internal error occurred", resp_data['error'])
        print("✅ manipulate_file passed security check.")

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_clean_audio_exception_leakage(self, mock_os, mock_tempfile):
        """Test that clean_audio does not leak internal exception details."""
        print("\nTesting clean_audio exception leakage...")

        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_request.files = {'audio': mock_file}

        # Mock tempfile
        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        # Simulate sensitive error
        sensitive_msg = "SENSITIVE_FS_INFO"
        sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal.side_effect = Exception(sensitive_msg)
        sys.modules['backend.app.voice_quality_analysis'].load_audio.return_value = (MagicMock(), MagicMock())

        # Call endpoint
        ret = clean_audio()

        # Handle unpacking
        if isinstance(ret, tuple) and len(ret) == 2:
            resp_body, status_code = ret
            # Check if resp_body is also a tuple from our mock jsonify
            if isinstance(resp_body, tuple):
                 resp_data, _ = resp_body
            else:
                 resp_data = resp_body
        else:
             self.fail(f"Unexpected return format: {ret}")

        # Verify
        self.assertEqual(status_code, 500)
        self.assertNotIn(sensitive_msg, str(resp_data))
        self.assertIn("An internal error occurred", resp_data['error'])
        print("✅ clean_audio passed security check.")

if __name__ == '__main__':
    unittest.main()
