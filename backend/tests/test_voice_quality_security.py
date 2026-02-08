import unittest
import sys
import os
import types
from unittest.mock import MagicMock, patch

# --- Mocking Helper ---
def create_mock_module(name):
    m = types.ModuleType(name)
    sys.modules[name] = m
    return m

# --- Mock Dependencies ---
# We need to mock everything imported in backend/app/routes/voice_quality.py AND used in the test

# 1. Flask & related
sys.modules['flask'] = MagicMock()
mock_flask = sys.modules['flask']
mock_bp = MagicMock()
mock_flask.Blueprint.return_value = mock_bp
mock_bp.route.side_effect = lambda *args, **kwargs: lambda func: func # Decorator mock
mock_flask.jsonify = lambda x: (x, 500 if 'error' in x else 200)
mock_flask.send_file = MagicMock()
mock_flask.after_this_request = lambda f: f
mock_flask.current_app = MagicMock()
# Create a dummy Flask app class for the test
class MockFlask:
    def __init__(self, name):
        pass
    def register_blueprint(self, bp):
        pass
    def test_client(self):
        return MockClient()

mock_flask.Flask = MockFlask

class MockClient:
    def post(self, url, data=None, content_type=None):
        # We need to route this to the actual function
        # This is tricky without a real Flask app.
        # But we can just invoke the function directly in our tests if we mock the request object
        pass

mock_flask.request = MagicMock()

sys.modules['flask_login'] = MagicMock()
sys.modules['werkzeug'] = MagicMock()
sys.modules['werkzeug.utils'] = MagicMock()
sys.modules['werkzeug.datastructures'] = MagicMock()

# 2. Internal modules
if 'backend' not in sys.modules:
    create_mock_module('backend')
if 'backend.app' not in sys.modules:
    create_mock_module('backend.app')

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

# 3. External libs
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['numpy'] = MagicMock()
sys.modules['librosa'] = MagicMock()

# --- Import Function Under Test ---
# We import specifically what we need AFTER mocking
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# We need to ensure backend.app.routes exists
if 'backend.app.routes' not in sys.modules:
    create_mock_module('backend.app.routes')

# Now import the module. We use exec to load it because of the complex mocking
import importlib.util
spec = importlib.util.spec_from_file_location("backend.app.routes.voice_quality", "backend/app/routes/voice_quality.py")
voice_quality_module = importlib.util.module_from_spec(spec)
sys.modules["backend.app.routes.voice_quality"] = voice_quality_module
spec.loader.exec_module(voice_quality_module)

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.mock_request = mock_flask.request
        self.mock_request.files = {}
        self.mock_request.form = {}
        # Reset mocks
        val.validate_file_upload.reset_mock()
        vl_service.manipulate_voice.reset_mock()
        vqa.clean_audio_signal.reset_mock()
        vqa.load_audio.reset_mock()

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_manipulate_file_leakage(self, mock_os, mock_tempfile):
        print("\n--- Testing manipulate_file for Information Leakage ---")

        # Setup Request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_request.files = {'audio': mock_file}
        self.mock_request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        # Setup Validator (valid file)
        val.validate_file_upload.return_value = (True, None)

        # Setup Temp File
        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        # TRIGGER THE VULNERABILITY:
        # Make the service raise an exception with sensitive info
        SENSITIVE_INFO = "CRITICAL_DB_CONNECTION_STRING_LEAKED_123"
        vl_service.manipulate_voice.side_effect = Exception(SENSITIVE_INFO)

        # Call the function directly (since we can't easily mock the Flask app routing in this env)
        try:
            response, status_code = voice_quality_module.manipulate_file()

            # Check response
            print(f"Response: {response}")

            # Assert SECURITY FIX
            self.assertNotIn(SENSITIVE_INFO, str(response), "Secret info leaked in error message.")

            # Verify generic message
            self.assertIn("An internal error occurred", str(response), "Generic error message NOT returned.")
            self.assertEqual(status_code, 500)

        except Exception as e:
            self.fail(f"Test crashed: {e}")

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_clean_audio_leakage(self, mock_os, mock_tempfile):
        print("\n--- Testing clean_audio for Information Leakage ---")

        # Setup Request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_request.files = {'audio': mock_file}

        # Setup Validator
        val.validate_file_upload.return_value = (True, None)

        # Setup Temp File
        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        # TRIGGER THE VULNERABILITY:
        # Make load_audio raise an exception with sensitive info
        SENSITIVE_INFO = "PATH_TRAVERSAL_ATTEMPT_DETECTED_IN_LOGS"
        vqa.load_audio.side_effect = Exception(SENSITIVE_INFO)

        # Call the function
        try:
            response, status_code = voice_quality_module.clean_audio()

            # Check response
            print(f"Response: {response}")

            # Assert SECURITY FIX
            self.assertNotIn(SENSITIVE_INFO, str(response), "Secret info leaked in error message.")

            # Verify generic message
            self.assertIn("An internal error occurred", str(response), "Generic error message NOT returned.")
            self.assertEqual(status_code, 500)

        except Exception as e:
            self.fail(f"Test crashed: {e}")

if __name__ == '__main__':
    unittest.main()
