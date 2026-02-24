import unittest
import sys
import os
import io
from unittest.mock import MagicMock, patch

# Mock heavy dependencies BEFORE importing the module under test
# This prevents ImportError or execution of module-level code that requires dependencies

# We need to mock backend.app.extensions because backend.app.__init__ imports it
# AND backend.app.models imports db from it.
mock_extensions = MagicMock()
mock_db = MagicMock()
# Mock db.Model to be a simple class so we don't get metaclass conflicts
class MockModel:
    pass
mock_db.Model = MockModel
mock_extensions.db = mock_db
sys.modules['backend.app.extensions'] = mock_extensions

# Mock backend.app.models to avoid the metaclass conflict in User class
sys.modules['backend.app.models'] = MagicMock()

# Other dependencies
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['soundfile'] = MagicMock()

# Mock validators to always return True for simplicity unless overridden
sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

# Mock extensions (limiter needs to be a decorator)
# Note: Since we mocked backend.app.extensions above, we need to set the limiter attribute on it
# The limit function is called with a string argument (e.g. "10 per minute") and must return a decorator.
# The decorator takes the function (f) and returns it.
# So limit("10") returns `lambda f: f`.
mock_extensions.limiter.limit.return_value = lambda f: f

# Now we can safely import the blueprint
try:
    from backend.app.routes.voice_quality import voice_quality_bp

    # We also need to configure the mocks that are used INSIDE the module.
    # Since we mocked the modules before import, the imported module 'voice_quality'
    # holds references to the mocks we created.

    # We can access them via sys.modules
    mock_cleanup = sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request
    mock_load_audio = sys.modules['backend.app.voice_quality_analysis'].load_audio
    mock_manipulate = sys.modules['backend.app.services.voicelab_service'].manipulate_voice
    mock_validate = sys.modules['backend.app.validators'].validate_file_upload

except ImportError:
    voice_quality_bp = None
    print("ImportError: Could not import voice_quality_bp (likely due to syntax errors)")
except Exception as e:
    voice_quality_bp = None
    print(f"Exception during import: {e}")

from flask import Flask

class TestVoiceQualitySecurity(unittest.TestCase):
    def setUp(self):
        # Create a clean Flask app for each test
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True

        if voice_quality_bp:
            self.app.register_blueprint(voice_quality_bp)

        self.client = self.app.test_client()

        # Reset mocks before each test
        if voice_quality_bp:
            mock_cleanup.reset_mock()
            mock_load_audio.reset_mock()
            mock_manipulate.reset_mock()
            mock_validate.reset_mock()
            mock_validate.return_value = (True, None)

    def test_clean_audio_exception_handling(self):
        """Test that exceptions in clean_audio are handled securely (CWE-209)."""
        if not voice_quality_bp:
            # We expect this to fail initially due to syntax errors in the target file
            self.fail("Could not import voice_quality_bp. If this is the initial run, this is expected due to syntax errors.")

        # Setup mock to raise exception with sensitive info
        mock_load_audio.side_effect = Exception("Sensitive DB Info: Connection failed at 192.168.1.5")

        # Create a dummy file for upload
        data = {
            'audio': (io.BytesIO(b"dummy wav content"), 'test.wav')
        }

        response = self.client.post('/api/voice-quality/clean', data=data, content_type='multipart/form-data')

        # Verify response status
        self.assertEqual(response.status_code, 500)

        # Verify JSON content
        json_data = response.get_json()
        self.assertIsNotNone(json_data, "Response should be JSON")

        # CRITICAL CHECK: Ensure sensitive info is NOT in the error message
        error_msg = json_data.get('error', '')
        self.assertNotIn("Sensitive DB Info", error_msg)
        self.assertEqual(error_msg, "An internal error occurred during audio cleaning.")

    def test_manipulate_file_exception_handling(self):
        """Test that exceptions in manipulate_file are handled securely (CWE-209)."""
        if not voice_quality_bp:
            self.fail("Could not import voice_quality_bp")

        # Mock manipulate_voice to raise exception
        mock_manipulate.side_effect = Exception("Sensitive File Path: /var/secret/keys.pem not found")

        data = {
            'audio': (io.BytesIO(b"dummy wav content"), 'test.wav'),
            'pitch_shift': '2.0'
        }

        response = self.client.post('/api/voice-quality/manipulate', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 500)
        json_data = response.get_json()

        self.assertNotIn("Sensitive File Path", json_data.get('error', ''))
        self.assertEqual(json_data.get('error'), "An internal error occurred during voice manipulation.")

    def test_cleanup_on_error(self):
        """Verify that temporary files are cleaned up even when errors occur."""
        if not voice_quality_bp:
            self.fail("Could not import voice_quality_bp")

        # We need to verify os.remove is called.
        # We can mock os.remove in the target module if possible, or global os.
        # Since voice_quality.py imports os, it has a reference to the os module.
        # Patching 'os.remove' patches it globally which is fine for single threaded tests.

        with patch('os.remove') as mock_remove, \
             patch('os.path.exists', return_value=True):

            mock_load_audio.side_effect = Exception("Fail")

            data = {'audio': (io.BytesIO(b"dummy"), 'test.wav')}
            self.client.post('/api/voice-quality/clean', data=data, content_type='multipart/form-data')

            # Verify remove was called at least once (for temp file)
            mock_remove.assert_called()

if __name__ == '__main__':
    unittest.main()
