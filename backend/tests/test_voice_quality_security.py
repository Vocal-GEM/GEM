import unittest
import sys
import os
import shutil
import tempfile
from unittest.mock import MagicMock, patch
from io import BytesIO

# Helper to ensure we have a clean slate for imports
def clear_sys_modules(prefix='backend.app.routes.voice_quality'):
    if prefix in sys.modules:
        del sys.modules[prefix]

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Prepare mocks
        self.mock_models = MagicMock()
        self.mock_extensions = MagicMock()
        self.mock_extensions.limiter.limit = lambda x: lambda f: f

        self.mock_cleanup = MagicMock()
        self.mock_validators = MagicMock()
        self.mock_services = MagicMock()
        self.mock_parselmouth = MagicMock()
        self.mock_vqa = MagicMock()

        # Mock Flask and Werkzeug
        self.mock_flask = MagicMock()
        self.mock_werkzeug = MagicMock()
        self.mock_werkzeug_security = MagicMock()

        # Mock FileStorage
        self.mock_file_storage_class = MagicMock()
        self.mock_werkzeug.datastructures.FileStorage = self.mock_file_storage_class

        # Mock Flask App and Client
        self.mock_app = MagicMock()
        self.mock_app.config = {'UPLOAD_FOLDER': self.test_dir, 'SECRET_KEY': 'test'}
        self.mock_client = MagicMock()
        self.mock_app.test_client.return_value = self.mock_client
        self.mock_flask.Flask.return_value = self.mock_app

        # Mock Blueprint
        self.mock_bp = MagicMock()
        self.mock_bp.route.side_effect = lambda *args, **kwargs: lambda func: func
        self.mock_flask.Blueprint.return_value = self.mock_bp

        # IMPORTANT: jsonify returns the data directly so (data, status) logic works
        self.mock_flask.jsonify = lambda x: x

        self.mock_flask.send_file = MagicMock()
        self.mock_flask.after_this_request = lambda f: f

        # Current app and request
        self.mock_flask.current_app = MagicMock()
        self.mock_flask.request = MagicMock()

        # Patch sys.modules to mock dependencies
        self.modules_patcher = patch.dict(sys.modules, {
            'flask': self.mock_flask,
            'werkzeug': self.mock_werkzeug,
            'werkzeug.datastructures': self.mock_werkzeug.datastructures,
            'backend.app.models': self.mock_models,
            'backend.app.extensions': self.mock_extensions,
            'backend.app.voice_quality_analysis': self.mock_vqa,
            'backend.app.asr_transcriber': MagicMock(),
            'backend.app.validators': self.mock_validators,
            'backend.app.services': self.mock_services,
            'backend.app.services.voicelab_service': self.mock_services,
            'parselmouth': self.mock_parselmouth,
            'backend.app.utils': MagicMock(),
            'backend.app.utils.cleanup': MagicMock(),
            # Ensure these are mocked if they don't exist
            'flask_cors': MagicMock(),
            'flask_login': MagicMock(),
            'flask_sqlalchemy': MagicMock(),
            'flask_socketio': MagicMock(),
            'flask_limiter': MagicMock(),
            'flask_wtf': MagicMock(),
            'sqlalchemy': MagicMock(),
            'dotenv': MagicMock(),
            'bleach': MagicMock(),
            'soundfile': MagicMock(),
            'librosa': MagicMock(),
            'faster_whisper': MagicMock(),
            'boto3': MagicMock(),
            'filetype': MagicMock(),
        })
        self.modules_patcher.start()

        # Specific mocks setup
        self.mock_validators.validate_file_upload.return_value = (True, None)
        sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()

        # Reload blueprint to use mocks
        clear_sys_modules('backend.app.routes.voice_quality')
        import backend.app.routes.voice_quality as vq
        self.vq = vq

    def tearDown(self):
        self.modules_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        clear_sys_modules('backend.app.routes.voice_quality')

    def test_manipulate_file_success(self):
        """Test successful manipulation (mocked)."""
        # Setup request
        mock_file = MagicMock()
        mock_file.filename = 'test.wav'
        self.mock_flask.request.files = {'audio': mock_file}
        self.mock_flask.request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        # Mock validation
        self.mock_validators.validate_file_upload.return_value = (True, None)

        # Mock tempfile
        self.vq.tempfile = MagicMock()
        mock_temp_cm = MagicMock()
        mock_temp_file = MagicMock()
        mock_temp_file.name = "temp.wav"
        mock_temp_cm.__enter__.return_value = mock_temp_file
        self.vq.tempfile.NamedTemporaryFile.return_value = mock_temp_cm

        # Mock manipulation success
        mock_sound = MagicMock()
        mock_sound.save = MagicMock()
        self.mock_services.manipulate_voice.return_value = mock_sound
        self.mock_parselmouth.Sound.return_value = MagicMock()

        # Mock send_file
        self.mock_flask.send_file.return_value = "file_content"

        # Call the function directly
        with patch.object(self.vq.os.path, 'exists', return_value=True):
             with patch.object(self.vq.os, 'remove', MagicMock()):
                response = self.vq.manipulate_file()

                self.assertEqual(response, "file_content")

    def test_manipulate_file_leakage(self):
        """Test security fix: internal error details should not leak."""
        # Setup request
        mock_file = MagicMock()
        mock_file.filename = 'test.wav'
        self.mock_flask.request.files = {'audio': mock_file}
        self.mock_flask.request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        # Mock tempfile
        self.vq.tempfile = MagicMock()
        mock_temp_cm = MagicMock()
        mock_temp_file = MagicMock()
        mock_temp_file.name = "temp.wav"
        mock_temp_cm.__enter__.return_value = mock_temp_file
        self.vq.tempfile.NamedTemporaryFile.return_value = mock_temp_cm

        SECRET = "SENSITIVE_DB_INFO_LEAK"
        self.mock_services.manipulate_voice.side_effect = Exception(SECRET)
        self.mock_parselmouth.Sound.return_value = MagicMock()

        with patch.object(self.vq.os.path, 'exists', return_value=True):
             with patch.object(self.vq.os, 'remove', MagicMock()):
                result = self.vq.manipulate_file()

                # Check result
                if isinstance(result, tuple):
                    data, status = result
                else:
                    data = result
                    status = 200

                self.assertEqual(status, 500)
                error_message = data.get('error', '')
                self.assertNotIn(SECRET, error_message, "Error message leaked internal details!")
                self.assertEqual(error_message, "An internal error occurred during voice manipulation.")

    def test_clean_audio_leakage(self):
        """Test security fix: clean_audio error details should not leak."""
        # Setup request
        mock_file = MagicMock()
        mock_file.filename = 'test.wav'
        self.mock_flask.request.files = {'audio': mock_file}

        # Mock tempfile
        self.vq.tempfile = MagicMock()
        mock_temp_cm = MagicMock()
        mock_temp_file = MagicMock()
        mock_temp_file.name = "temp.wav"
        mock_temp_cm.__enter__.return_value = mock_temp_file
        self.vq.tempfile.NamedTemporaryFile.return_value = mock_temp_cm

        SECRET = "CLEANING_INTERNAL_ERROR"
        # Mock load_audio
        self.mock_vqa.load_audio.side_effect = Exception(SECRET)

        with patch.object(self.vq.os.path, 'exists', return_value=True):
             with patch.object(self.vq.os, 'remove', MagicMock()):
                result = self.vq.clean_audio()

                # Check result
                if isinstance(result, tuple):
                    data, status = result
                else:
                    data = result
                    status = 200

                self.assertEqual(status, 500)
                error_message = data.get('error', '')
                self.assertNotIn(SECRET, error_message, "Error message leaked internal details!")
                self.assertEqual(error_message, "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
