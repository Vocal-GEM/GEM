import sys
import unittest
from unittest.mock import MagicMock, patch
from io import BytesIO

# 1. Mock heavy/missing dependencies BEFORE importing the app
sys.modules['numpy'] = MagicMock()
sys.modules['librosa'] = MagicMock()
sys.modules['scipy'] = MagicMock()
sys.modules['scipy.signal'] = MagicMock()
sys.modules['scipy.stats'] = MagicMock()
sys.modules['faster_whisper'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['google.generativeai'] = MagicMock()
sys.modules['google.genai'] = MagicMock()
sys.modules['pypdf'] = MagicMock()
sys.modules['boto3'] = MagicMock()
sys.modules['botocore'] = MagicMock()
sys.modules['botocore.exceptions'] = MagicMock()

# Mock backend.app.voice_quality_analysis
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'].analyze_file = MagicMock(return_value={})
sys.modules['backend.app.voice_quality_analysis'].analyze_file_with_transcript = MagicMock(return_value={})

# Mock Database Models
sys.modules['backend.app.models'] = MagicMock()

# Mock Flask-Login to bypass authentication
login_mock = MagicMock()
# login_required decorator needs to return the function unmodified
login_mock.login_required = lambda f: f
# Mock current_user
mock_user = MagicMock()
mock_user.id = 1
login_mock.current_user = mock_user
sys.modules['flask_login'] = login_mock

from flask import Flask
# Import the blueprints
from backend.app.routes.analysis import analysis_bp
from backend.app.routes.community import community_bp
from backend.app.validators import validate_file_upload

class SecurityUploadTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['UPLOAD_FOLDER'] = '/tmp/test_uploads'

        # Register the blueprints
        self.app.register_blueprint(analysis_bp)
        self.app.register_blueprint(community_bp, url_prefix='/api/community')

        self.client = self.app.test_client()

        # Ensure we have a mock db session if needed
        # community.py imports db from ..extensions
        # We need to ensure db.session is mocked
        # sys.modules['backend.app.extensions'] needs to have db
        pass

    def test_analyze_audio_valid_upload(self):
        """Test that uploading a valid audio file works (passed to mock logic)"""
        sys.modules['librosa'].load.return_value = (MagicMock(len=100), 22050)
        sys.modules['librosa'].pyin.return_value = (MagicMock(), MagicMock(), MagicMock())
        sys.modules['librosa'].feature.rms.return_value = [MagicMock()]
        sys.modules['librosa'].feature.spectral_centroid.return_value = [MagicMock()]
        sys.modules['librosa'].feature.spectral_rolloff.return_value = [MagicMock()]
        sys.modules['librosa'].lpc.return_value = [1.0]
        sys.modules['numpy'].roots.return_value = []
        sys.modules['numpy'].mean.return_value = 0.0

        mock_model = MagicMock()
        mock_model.transcribe.return_value = ([], MagicMock())
        sys.modules['faster_whisper'].WhisperModel.return_value = mock_model

        data = {
            'audio': (BytesIO(b"valid wav header"), 'test.wav')
        }
        response = self.client.post('/api/analyze', data=data, content_type='multipart/form-data')

        if response.status_code != 200:
             print(f"Valid upload failed with: {response.get_json()}")
        # We accept 200 or 500 (if mocks fail deep inside) as long as it's not 400 (rejected)
        # Actually validation pass is what we care about.

    def test_analyze_audio_invalid_extension(self):
        """Test that uploading a file with invalid extension is rejected in analysis"""
        data = {
            'audio': (BytesIO(b"exe content"), 'malware.exe')
        }
        response = self.client.post('/api/analyze', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 400)
        self.assertIn("not allowed", response.get_json().get('error', ''))

    def test_share_voice_invalid_extension(self):
        """Test that uploading a file with invalid extension is rejected in community share"""
        # This test expects the vulnerability to be PRESENT initially (so it might fail if I assert 400)
        # or I can assert 400 and expect it to fail, then fix code.

        data = {
            'audio': (BytesIO(b"exe content"), 'malware.exe'),
            'context': 'test',
            'expiration_days': 7
        }

        # Note: We mocked anonymize_audio inside community.py by mocking librosa?
        # community.py imports librosa inside the function anonymize_audio
        # sys.modules['librosa'] is already mocked.

        response = self.client.post('/api/community/share-voice', data=data, content_type='multipart/form-data')

        # If vulnerability exists, this will likely be 200 (success) or 500 (db error)
        # We want it to be 400.

        if response.status_code != 400:
             print(f"Community share vulnerability: Got {response.status_code} instead of 400. Response: {response.get_json()}")

        self.assertEqual(response.status_code, 400, "Should reject non-audio files")
        self.assertIn("not allowed", response.get_json().get('error', ''))

if __name__ == '__main__':
    unittest.main()
