import unittest
from unittest.mock import MagicMock, patch
import sys
import os
import types

# ... (Helper and module mocks - same as before)
def create_mock_module(name):
    m = types.ModuleType(name)
    sys.modules[name] = m
    return m

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
mock_bp.route.side_effect = lambda *args, **kwargs: lambda func: func
mock_flask.jsonify = lambda x: (x, 500 if 'error' in x else 200)
mock_flask.send_file = MagicMock()
mock_flask.after_this_request = lambda f: f
mock_flask.request = MagicMock()
mock_flask.current_app = MagicMock()

if 'backend' not in sys.modules:
    create_mock_module('backend')
if 'backend.app' not in sys.modules:
    backend_app = create_mock_module('backend.app')
    backend_app.__path__ = [os.path.abspath('backend/app')]
if 'backend.app.routes' not in sys.modules:
    backend_app_routes = create_mock_module('backend.app.routes')
    backend_app_routes.__path__ = [os.path.abspath('backend/app/routes')]

from backend.app.routes.voice_quality import manipulate_file

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.mock_request = mock_flask.request
        self.mock_request.files = {}
        self.mock_request.form = {}
        sys.modules['backend.app.validators'].validate_file_upload.reset_mock()
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.reset_mock()

    def tearDown(self):
        pass

    @patch('backend.app.routes.voice_quality.validate_file_upload')
    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_manipulate_file_exception_leakage(self, mock_os, mock_tempfile, mock_validate):
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_request.files = {'audio': mock_file}
        self.mock_request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}
        mock_validate.return_value = (True, None)

        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        mock_service = sys.modules['backend.app.services.voicelab_service']
        mock_service.manipulate_voice.side_effect = Exception("SENSITIVE_INTERNAL_INFO")

        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        try:
            ret = manipulate_file()
            response, status_code = ret

            # Now we expect generic error message
            if "SENSITIVE_INTERNAL_INFO" in str(response):
                self.fail("SECURITY VULNERABILITY: Exception message leaked to client!")

            if "An internal error occurred" in str(response) and status_code == 500:
                 print("Success: Generic error returned.")
            else:
                 self.fail(f"Expected generic 500 error, got: {ret}")

        except UnboundLocalError:
             self.fail("UnboundLocalError caught! Fix failed.")
        except Exception as e:
            self.fail(f"Unexpected exception: {e}")

if __name__ == '__main__':
    unittest.main()
