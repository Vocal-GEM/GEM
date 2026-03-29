import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Ensure repo root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        self.patcher = patch.dict(sys.modules)
        self.patcher.start()

        # Helper
        def mock_module(name):
            m = MagicMock()
            sys.modules[name] = m
            return m

        # Mock LEAF dependencies
        mock_module('backend.app.models')
        mock_module('backend.app.voice_quality_analysis')
        mock_module('backend.app.asr_transcriber')
        mock_module('backend.app.validators')
        mock_module('backend.app.extensions')
        mock_module('backend.app.utils')
        mock_module('backend.app.utils.cleanup')
        mock_module('backend.app.services')
        mock_module('backend.app.services.voicelab_service')

        # Mock external libs
        mock_module('soundfile')
        mock_module('parselmouth')
        mock_module('flask_cors')
        mock_module('flask_limiter')
        mock_module('dotenv')

        # Mock Flask
        self.mock_flask = mock_module('flask')

        # Setup Blueprint to be a transparent decorator
        mock_bp = MagicMock()
        mock_bp.route.return_value = lambda f: f
        self.mock_flask.Blueprint = MagicMock(return_value=mock_bp)

        self.mock_flask.request = MagicMock()
        self.mock_flask.jsonify = lambda x: (x, 500 if 'error' in x else 200)
        self.mock_flask.send_file = MagicMock()
        self.mock_flask.after_this_request = lambda f: f
        self.mock_flask.current_app = MagicMock()

        # Configure specific mocks
        sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

        # Force reload of the route module
        if 'backend.app.routes.voice_quality' in sys.modules:
            del sys.modules['backend.app.routes.voice_quality']

    def tearDown(self):
        self.patcher.stop()

    def test_manipulate_file_leakage(self):
        # Import inside test
        try:
            from backend.app.routes import voice_quality as vq
        except ImportError as e:
            self.fail(f"Failed to import module: {e}")

        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        self.mock_flask.request.files = {'audio': mock_file}
        self.mock_flask.request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        # Setup mocks to force an exception
        mock_service = sys.modules['backend.app.services.voicelab_service']
        SECRET = "DB_CONNECTION_STRING_WITH_PASSWORD"
        mock_service.manipulate_voice.side_effect = Exception(SECRET)

        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        with patch('backend.app.routes.voice_quality.tempfile.NamedTemporaryFile') as mock_temp:
            mock_temp.return_value.__enter__.return_value.name = "/tmp/test.wav"

            try:
                response = vq.manipulate_file()
                body, status = response

                # Check for leakage
                if SECRET in str(body):
                    self.fail(f"SECURITY FAILURE: Internal exception message leaked to client: {body}")

                if "An internal error occurred" not in str(body):
                    self.fail(f"Expected generic error message, got: {body}")

                self.assertEqual(status, 500)

            except Exception as e:
                self.fail(f"Unexpected exception: {e}")

if __name__ == '__main__':
    unittest.main()
