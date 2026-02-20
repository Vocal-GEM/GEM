import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Mock all dependencies BEFORE importing the module under test
sys.modules['flask'] = MagicMock()
sys.modules['flask_login'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['flask_socketio'] = MagicMock()
sys.modules['flask_migrate'] = MagicMock()
sys.modules['flask_wtf'] = MagicMock()
sys.modules['flask_wtf.csrf'] = MagicMock()
sys.modules['dotenv'] = MagicMock()
sys.modules['werkzeug.utils'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()

# Mock internal app modules
# We must mock backend.app.models because backend.app.__init__ imports it
sys.modules['backend.app.models'] = MagicMock()
# Also backend.app.extensions
sys.modules['backend.app.extensions'] = MagicMock()
# Mock the extensions content specifically so imports like "from .extensions import db" work
mock_extensions = MagicMock()
mock_db = MagicMock()
mock_db.Model = MagicMock # Just a class
mock_extensions.db = mock_db
mock_extensions.limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.extensions'] = mock_extensions

# Prevent backend.app.__init__ from running or failing
# But backend.app is a package. If we mock it entirely, we might break sub-imports.
# However, if we mock backend.app.models, the import inside __init__ should return the mock.

# Mock relative imports from within the package
# We need to ensure that when 'backend.app.routes.voice_quality' imports '..voice_quality_analysis', it gets a mock
# Since we will import it directly or via sys.modules hack

# Create mocks for the specific imports in voice_quality.py
mock_vqa = MagicMock()
mock_vqa.GOAL_PRESETS = {}
sys.modules['backend.app.voice_quality_analysis'] = mock_vqa

mock_asr = MagicMock()
sys.modules['backend.app.asr_transcriber'] = mock_asr

mock_validators = MagicMock()
mock_validators.validate_file_upload = MagicMock(return_value=(True, None))
sys.modules['backend.app.validators'] = mock_validators

mock_ext = MagicMock()
mock_ext.limiter = MagicMock()
mock_ext.limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.extensions'] = mock_ext

mock_cleanup = MagicMock()
sys.modules['backend.app.utils.cleanup'] = mock_cleanup

mock_services = MagicMock()
sys.modules['backend.app.services'] = mock_services
sys.modules['backend.app.services.voicelab_service'] = MagicMock()

# Setup Flask mocks
from flask import Blueprint
mock_bp = MagicMock()
# Mock the route decorator to just return the function (so we can call it)
def route_side_effect(*args, **kwargs):
    def decorator(f):
        return f
    return decorator
mock_bp.route.side_effect = route_side_effect
sys.modules['flask'].Blueprint.return_value = mock_bp

# Mock request
mock_request = MagicMock()
sys.modules['flask'].request = mock_request

# Mock jsonify
def mock_jsonify(data):
    return data # Just return the dict
sys.modules['flask'].jsonify = mock_jsonify

# Mock current_app
sys.modules['flask'].current_app = MagicMock()

# Add repo root to path so we can import backend
sys.path.append(os.getcwd())

# Import the module
import backend.app.routes.voice_quality as vq

class TestVoiceQualityLeak(unittest.TestCase):
    def setUp(self):
        # Reset mocks
        mock_request.files = {}
        mock_request.form = {}
        mock_validators.validate_file_upload.return_value = (True, None)

    def test_clean_audio_leak(self):
        print("Testing clean_audio for leaks...")
        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_request.files = {'audio': mock_file}

        # Setup exception
        mock_vqa.load_audio.side_effect = Exception("SECRET_DB_PASSWORD")

        # Call function
        result = vq.clean_audio()

        if isinstance(result, tuple):
            response, status = result
        else:
            response = result
            status = 200

        print(f"Response: {response}")

        self.assertIsInstance(response, dict, "Response should be a dict")
        self.assertIn('error', response, "Response should contain error key")

        error_msg = response['error']
        self.assertNotIn("SECRET_DB_PASSWORD", error_msg, "Secret leaked in error message!")
        self.assertIn("An internal error occurred", error_msg, "Generic error message not found")
        print("✅ PASS: Generic error message returned.")

    def test_manipulate_file_leak(self):
        print("Testing manipulate_file for leaks...")
        # Setup request
        mock_file = MagicMock()
        mock_file.filename = "test.wav"
        mock_request.files = {'audio': mock_file}
        mock_request.form = {'pitch_shift': '0.0'}

        # Setup exception
        mock_vl_service = sys.modules['backend.app.services.voicelab_service']
        mock_vl_service.manipulate_voice.side_effect = Exception("SECRET_API_KEY")

        # Also need parselmouth
        sys.modules['parselmouth'].Sound.return_value = MagicMock()

        # Call function
        result = vq.manipulate_file()

        if isinstance(result, tuple):
            response, status = result
        else:
            response = result
            status = 200

        print(f"Response: {response}")

        self.assertIsInstance(response, dict, "Response should be a dict")
        self.assertIn('error', response, "Response should contain error key")

        error_msg = response['error']
        self.assertNotIn("SECRET_API_KEY", error_msg, "Secret leaked in error message!")
        self.assertIn("An internal error occurred", error_msg, "Generic error message not found")
        print("✅ PASS: Generic error message returned.")

if __name__ == "__main__":
    unittest.main()
