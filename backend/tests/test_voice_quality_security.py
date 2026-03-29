import unittest
from unittest.mock import MagicMock, patch
import sys
import os
import types
import importlib.util

# --- MOCKING INFRASTRUCTURE START ---
def create_mock_module(name):
    m = types.ModuleType(name)
    sys.modules[name] = m
    return m

# Mock dependencies
create_mock_module('backend')
create_mock_module('backend.app')
create_mock_module('backend.app.routes')
create_mock_module('backend.app.voice_quality_analysis')
create_mock_module('backend.app.asr_transcriber')
create_mock_module('backend.app.validators')
create_mock_module('backend.app.extensions')
create_mock_module('backend.app.utils')
create_mock_module('backend.app.utils.cleanup')
create_mock_module('backend.app.services')
create_mock_module('backend.app.services.voicelab_service')

# Set attributes on mocks
sys.modules['backend.app.voice_quality_analysis'].analyze_file = MagicMock()
sys.modules['backend.app.voice_quality_analysis'].analyze_file_with_transcript = MagicMock()
sys.modules['backend.app.voice_quality_analysis'].GOAL_PRESETS = {}
sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal = MagicMock()
sys.modules['backend.app.voice_quality_analysis'].load_audio = MagicMock()

sys.modules['backend.app.asr_transcriber'].transcribe_audio_with_words = MagicMock()
sys.modules['backend.app.validators'].validate_file_upload = MagicMock()
sys.modules['backend.app.extensions'].limiter = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
sys.modules['backend.app.services.voicelab_service'].manipulate_voice = MagicMock()

# Mock external libs
sys.modules['flask'] = MagicMock()
sys.modules['flask_login'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['numpy'] = MagicMock()

# Setup Flask mocks
mock_flask = sys.modules['flask']
mock_bp = MagicMock()
mock_flask.Blueprint.return_value = mock_bp
mock_bp.route.side_effect = lambda *args, **kwargs: lambda func: func
mock_flask.jsonify = lambda x: (x, 500 if 'error' in x else 200)
mock_flask.send_file = MagicMock()
mock_flask.after_this_request = lambda f: f
mock_flask.current_app = MagicMock()
mock_flask.current_app.logger = MagicMock()
mock_flask.request = MagicMock()

# Manually load the module
file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../app/routes/voice_quality.py'))
spec = importlib.util.spec_from_file_location("backend.app.routes.voice_quality", file_path)
voice_quality = importlib.util.module_from_spec(spec)
sys.modules["backend.app.routes.voice_quality"] = voice_quality
spec.loader.exec_module(voice_quality)

from backend.app.routes.voice_quality import manipulate_file, clean_audio

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.mock_request = mock_flask.request
        self.mock_request.files = {}
        self.mock_request.form = {}

        # Reset mocks
        sys.modules['backend.app.validators'].validate_file_upload.reset_mock()
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.reset_mock()
        sys.modules['backend.app.voice_quality_analysis'].load_audio.reset_mock()

    def test_manipulate_file_exception_leakage(self):
        print("\nTesting manipulate_file security...")

        with patch.object(voice_quality, 'validate_file_upload', return_value=(True, None)), \
             patch.object(voice_quality, 'tempfile') as mock_tempfile, \
             patch.object(voice_quality, 'os'):

            # Setup request
            mock_file = MagicMock()
            mock_file.filename = "test.wav"
            self.mock_request.files = {'audio': mock_file}
            self.mock_request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

            # Setup tempfile
            mock_temp_obj = MagicMock()
            mock_temp_obj.name = "/tmp/test.wav"
            mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

            # Setup FORCE EXCEPTION with SENSITIVE INFO
            sensitive_info = "DB_PASSWORD_LEAKED_123"
            sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = Exception(sensitive_info)

            # Mock Sound object creation
            sys.modules['parselmouth'].Sound.return_value = MagicMock()

            try:
                # Call the function directly
                ret = manipulate_file()
                response, status_code = ret

                # Check if sensitive info leaked
                if sensitive_info in str(response):
                    self.fail("❌ VULNERABILITY CONFIRMED: Sensitive info leaked in error message.")

                # Check if generic error is used
                if "An internal error occurred" not in str(response):
                    self.fail(f"⚠️ WARNING: Generic error message NOT returned. Got: {response}")

            except Exception as e:
                self.fail(f"❌ TEST ERROR: {e}")

    def test_clean_audio_exception_leakage(self):
        print("\nTesting clean_audio security...")

        with patch.object(voice_quality, 'validate_file_upload', return_value=(True, None)), \
             patch.object(voice_quality, 'tempfile') as mock_tempfile, \
             patch.object(voice_quality, 'os'):

            # Setup request
            mock_file = MagicMock()
            mock_file.filename = "test.wav"
            self.mock_request.files = {'audio': mock_file}

            # Setup tempfile
            mock_temp_obj = MagicMock()
            mock_temp_obj.name = "/tmp/test.wav"
            mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

            # Setup FORCE EXCEPTION with SENSITIVE INFO
            sensitive_info = "API_KEY_LEAKED_XYZ"
            sys.modules['backend.app.voice_quality_analysis'].load_audio.side_effect = Exception(sensitive_info)

            try:
                # Call the function directly
                ret = clean_audio()
                response, status_code = ret

                # Check if sensitive info leaked
                if sensitive_info in str(response):
                    self.fail("❌ VULNERABILITY CONFIRMED: Sensitive info leaked in error message.")

                # Check if generic error is used
                if "An internal error occurred" not in str(response):
                    self.fail(f"⚠️ WARNING: Generic error message NOT returned. Got: {response}")

            except Exception as e:
                self.fail(f"❌ TEST ERROR: {e}")

if __name__ == '__main__':
    unittest.main()
