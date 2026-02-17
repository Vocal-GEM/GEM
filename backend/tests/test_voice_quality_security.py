import unittest
import sys
import os
from unittest.mock import MagicMock, patch

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies
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
sys.modules['soundfile'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['dotenv'] = MagicMock()

# Import the function to test
# We need to mock 'flask' before importing the route
mock_flask = MagicMock()
sys.modules['flask'] = mock_flask
mock_bp = MagicMock()
mock_flask.Blueprint.return_value = mock_bp
mock_bp.route.side_effect = lambda *args, **kwargs: lambda func: func

# Mock request and jsonify
mock_request = MagicMock()
mock_flask.request = mock_request
def mock_jsonify(data):
    return data
mock_flask.jsonify = mock_jsonify
mock_flask.current_app = MagicMock()

from backend.app.routes.voice_quality import manipulate_file, clean_audio

class TestVoiceQualityFix(unittest.TestCase):
    def setUp(self):
        # Reset mocks
        mock_request.files = {}
        mock_request.form = {}
        sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    def test_manipulate_file_leak(self, mock_os, mock_tempfile):
        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_request.files = {'audio': mock_file}
        mock_request.form = {'pitch_shift': '0.0', 'formant_shift': '1.0'}

        # Setup tempfile
        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        # Setup service to raise exception
        mock_service = sys.modules['backend.app.services.voicelab_service']
        mock_service.manipulate_voice.side_effect = Exception("SECRET_DB_PASSWORD")

        # Run function
        try:
            response, status = manipulate_file()
        except Exception as e:
            # If the code crashes, that's also a fail, but we expect it to return a tuple
            self.fail(f"Function raised exception: {e}")

        # check for leak
        self.assertEqual(status, 500)
        print(f"Response: {response}")

        if "SECRET_DB_PASSWORD" in str(response):
             self.fail("VULNERABILITY: Exception message leaked to client!")

        self.assertEqual(response.get('error'), "An internal error occurred during voice manipulation.")

    @patch('backend.app.routes.voice_quality.tempfile')
    @patch('backend.app.routes.voice_quality.os')
    @patch('backend.app.routes.voice_quality.load_audio')
    @patch('backend.app.routes.voice_quality.clean_audio_signal')
    @patch('backend.app.routes.voice_quality.sf')
    def test_clean_audio_leak(self, mock_sf, mock_clean, mock_load, mock_os, mock_tempfile):
        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_request.files = {'audio': mock_file}

        # Setup tempfile
        mock_temp_obj = MagicMock()
        mock_temp_obj.name = "/tmp/test.wav"
        mock_tempfile.NamedTemporaryFile.return_value.__enter__.return_value = mock_temp_obj

        # Setup exception
        mock_load.side_effect = Exception("SECRET_API_KEY")

        # Run function
        try:
            response, status = clean_audio()
        except Exception as e:
            self.fail(f"Function raised exception: {e}")

        # check for leak
        self.assertEqual(status, 500)
        print(f"Response: {response}")

        if "SECRET_API_KEY" in str(response):
             self.fail("VULNERABILITY: Exception message leaked to client!")

        self.assertEqual(response.get('error'), "An internal error occurred during audio cleaning.")

if __name__ == '__main__':
    unittest.main()
