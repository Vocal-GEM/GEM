import unittest
from unittest.mock import MagicMock, patch
import sys
import os
import types

# --- MOCKING INFRASTRUCTURE ---
# We need to mock everything that backend.app.routes.voice_quality imports
# BEFORE we import it, otherwise we'll get ImportErrors.

def create_mock_module(name):
    m = types.ModuleType(name)
    sys.modules[name] = m
    return m

# Mock dependencies
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

sys.modules['flask'] = MagicMock()
sys.modules['flask_login'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock()

mock_flask = sys.modules['flask']
mock_bp = MagicMock()
mock_flask.Blueprint.return_value = mock_bp
# Mock route decorator to return the function itself so we can call it directly
mock_bp.route.side_effect = lambda *args, **kwargs: lambda func: func
mock_flask.jsonify = lambda x: (x, 500 if 'error' in x else 200)
mock_flask.send_file = MagicMock()
mock_flask.after_this_request = lambda f: f
mock_flask.request = MagicMock()
mock_flask.current_app = MagicMock()

# Setup package structure for imports
if 'backend' not in sys.modules:
    create_mock_module('backend')
if 'backend.app' not in sys.modules:
    backend_app = create_mock_module('backend.app')
    # We need to point __path__ to the real directory so relative imports work if needed
    backend_app.__path__ = [os.path.abspath('backend/app')]
if 'backend.app.routes' not in sys.modules:
    backend_app_routes = create_mock_module('backend.app.routes')
    backend_app_routes.__path__ = [os.path.abspath('backend/app/routes')]

# Now import the module under test
from backend.app.routes.voice_quality import manipulate_file, clean_audio

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.mock_request = mock_flask.request
        self.mock_request.files = {}
        self.mock_request.form = {}
        sys.modules['backend.app.validators'].validate_file_upload.reset_mock()
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.reset_mock()

    @patch('backend.app.routes.voice_quality.validate_file_upload')
    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_manipulate_file_exception_leakage(self, mock_os, mock_tempfile, mock_validate):
        print("\nTesting manipulate_file for information leakage...")
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_request.files = {'audio': mock_file}
        self.mock_request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}
        mock_validate.return_value = (True, None)

        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        # Force an internal error with sensitive info
        SENSITIVE_INFO = "DB_PASSWORD_IS_12345"
        mock_service = sys.modules['backend.app.services.voicelab_service']
        mock_service.manipulate_voice.side_effect = Exception(SENSITIVE_INFO)

        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        try:
            ret = manipulate_file()
            # ret might be a tuple (response, status) or just response depending on implementation
            # Our mock jsonify returns (dict, status)

            response_body = ret[0] if isinstance(ret, tuple) else ret
            status_code = ret[1] if isinstance(ret, tuple) else 200

            print(f"Response: {response_body}")

            # CHECK FOR LEAKAGE
            if SENSITIVE_INFO in str(response_body):
                print("❌ VULNERABILITY CONFIRMED: Sensitive info leaked in error message!")
                self.fail("Sensitive info leaked in error message")

            if "An internal error occurred" in str(response_body) and status_code == 500:
                 print("✅ FIXED: Generic error message returned.")
            else:
                 print(f"⚠️ Unexpected response: {ret}")
                 self.fail(f"Unexpected response: {ret}")

        except UnboundLocalError as e:
             print(f"❌ SYNTAX/LOGIC ERROR: UnboundLocalError caught! {e}")
             self.fail(f"UnboundLocalError: {e} - Ensure variables are initialized.")
        except Exception as e:
            print(f"❌ Unexpected exception running test: {e}")
            self.fail(f"Execution failed: {e}")

    @patch('backend.app.routes.voice_quality.validate_file_upload')
    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_clean_audio_exception_leakage(self, mock_os, mock_tempfile, mock_validate):
        print("\nTesting clean_audio for information leakage...")
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_request.files = {'audio': mock_file}
        mock_validate.return_value = (True, None)

        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        SENSITIVE_INFO = "API_KEY_EXPIRED_XYZ"
        mock_vqa = sys.modules['backend.app.voice_quality_analysis']
        mock_vqa.load_audio.side_effect = Exception(SENSITIVE_INFO)

        try:
            ret = clean_audio()
            response_body = ret[0] if isinstance(ret, tuple) else ret
            status_code = ret[1] if isinstance(ret, tuple) else 200

            print(f"Response: {response_body}")

            if SENSITIVE_INFO in str(response_body):
                print("❌ VULNERABILITY CONFIRMED: Sensitive info leaked in error message!")
                self.fail("Sensitive info leaked in error message")

            if "An internal error occurred" in str(response_body) and status_code == 500:
                 print("✅ FIXED: Generic error message returned.")
            else:
                 self.fail(f"Unexpected response: {ret}")

        except UnboundLocalError as e:
             print(f"❌ SYNTAX/LOGIC ERROR: UnboundLocalError caught! {e}")
             self.fail(f"UnboundLocalError: {e} - Ensure variables are initialized.")
        except Exception as e:
            print(f"❌ Unexpected exception running test: {e}")
            self.fail(f"Execution failed: {e}")

if __name__ == '__main__':
    unittest.main()
