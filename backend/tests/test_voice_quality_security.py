import unittest
import sys
import os
import tempfile
import shutil
import json
from unittest.mock import MagicMock, patch
from flask import Flask
from werkzeug.datastructures import FileStorage
from io import BytesIO

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies BEFORE importing the blueprint
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()

# Mock cleanup_file_after_request specifically since it's imported
sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

# Import the blueprint
from backend.app.routes import voice_quality

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.app = Flask(__name__)
        self.app.config['UPLOAD_FOLDER'] = self.test_dir
        self.app.config['SECRET_KEY'] = 'test'
        # Blueprint routes are already absolute paths
class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Prepare mocks using patch.dict to avoid global pollution
        self.modules_patcher = patch.dict(sys.modules, {
            'backend.app.models': MagicMock(),
            'backend.app.extensions': MagicMock(),
            'backend.app.voice_quality_analysis': MagicMock(),
            'backend.app.asr_transcriber': MagicMock(),
            'backend.app.validators': MagicMock(),
            'backend.app.services': MagicMock(),
            'backend.app.services.voicelab_service': MagicMock(),
            'parselmouth': MagicMock(),
            'backend.app.utils': MagicMock(),
            'backend.app.utils.cleanup': MagicMock(),
        })
        self.modules_patcher.start()

        # Configure mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Import module under test
        # Ensure it's reloaded to use our mocks
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

        from backend.app.routes import voice_quality
        self.voice_quality = voice_quality

        self.app = Flask(__name__)
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        # Clean up the module to prevent side effects on other tests
        if 'backend.app.routes.voice_quality' in sys.modules:
             del sys.modules['backend.app.routes.voice_quality']

    def test_manipulate_file_success(self):
        """
        Test that a successful manipulation returns 200 OK.
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock manipulate_voice to return a mock Sound object
        mock_sound = MagicMock()
        mock_sound.save = MagicMock()

        with patch('backend.app.services.voicelab_service.manipulate_voice', return_value=mock_sound):
            with patch('parselmouth.Sound', return_value=MagicMock()):
                # Mock send_file to avoid FileNotFoundError since we don't actually create files
                with patch('backend.app.routes.voice_quality.send_file', return_value='file_content') as mock_send_file:
                    response = self.client.post(
                        '/api/voice-quality/manipulate',
                        data={'audio': file_storage, 'pitch_shift': '0.0'},
                        content_type='multipart/form-data'
                    )

                    self.assertEqual(response.status_code, 200, "Should return 200 OK")
                # Since send_file is used, we expect file content
                # We can't easily check 'get_json()' here as it might be binary

    def test_manipulate_file_error_handling_mock(self):
        """
        Test that an internal error returns a generic error message and does NOT leak details.
        """
        mock_sound = MagicMock()

        def side_effect_save(path, format):
            # Create a dummy file so send_file can find it
            with open(path, 'w') as f:
                f.write("dummy audio")

        mock_sound.save.side_effect = side_effect_save

        # Setup services mock
        sys.modules['parselmouth'].Sound.return_value = mock_sound
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.return_value = mock_sound

        response = self.client.post('/api/voice-quality/manipulate',
                                data={'audio': file_storage, 'pitch_shift': '1.0'},
                                content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200, f"Expected 200 OK, got {response.status_code}. Response: {response.data}")
        self.assertEqual(response.data, b"dummy audio")

    def test_manipulate_file_error_handling(self):
        """
        Test that an error in manipulation is handled safely (generic error, no leak).
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        # Mock manipulate_voice to RAISE an exception with a secret/internal message
        secret_message = "DB_CONNECTION_FAILED_SECRET_IP_1.2.3.4"
        with patch('backend.app.services.voicelab_service.manipulate_voice', side_effect=ValueError(secret_message)):
             with patch('parselmouth.Sound', return_value=MagicMock()):
                response = self.client.post(
                    '/api/voice-quality/manipulate',
                    data={'audio': file_storage, 'pitch_shift': '0.0'},
                    content_type='multipart/form-data'
                )

                self.assertEqual(response.status_code, 500)
                data = response.get_json()

                # SECURITY CHECK: It SHOULD NOT leak the secret message
                self.assertNotIn(secret_message, data.get('error', ''), "Should NOT leak internal error details")
                self.assertEqual(data.get('error'), "An internal error occurred during voice manipulation.")
        # Force an error with a secret message
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = ValueError("INTERNAL_SECRET_ERROR")

        response = self.client.post('/api/voice-quality/manipulate',
                                data={'audio': file_storage},
                                content_type='multipart/form-data')

        self.assertEqual(response.status_code, 500)
        self.assertNotIn("INTERNAL_SECRET_ERROR", response.data.decode(), "Error message leaked internal details!")
        self.assertIn("An internal error occurred", response.data.decode(), "Expected generic error message")
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
