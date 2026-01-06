import sys
import unittest
from unittest.mock import MagicMock, patch
from io import BytesIO

# --- MOCK HEAVY DEPENDENCIES BEFORE IMPORTING APP ---
sys.modules['google.generativeai'] = MagicMock()
sys.modules['google.genai'] = MagicMock()
sys.modules['pypdf'] = MagicMock()
sys.modules['numpy'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['librosa'] = MagicMock()
sys.modules['scipy'] = MagicMock()
sys.modules['scipy.signal'] = MagicMock()
sys.modules['scipy.io'] = MagicMock()
sys.modules['scipy.io.wavfile'] = MagicMock()
sys.modules['faster_whisper'] = MagicMock()
sys.modules['boto3'] = MagicMock()
sys.modules['botocore'] = MagicMock()

# Mock internal heavy modules
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'].analyze_file = MagicMock(return_value={})
sys.modules['backend.app.voice_quality_analysis'].analyze_file_with_transcript = MagicMock(return_value={})
sys.modules['backend.app.voice_quality_analysis'].load_audio = MagicMock(return_value=(MagicMock(), 22050))
sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal = MagicMock(return_value=MagicMock())
sys.modules['backend.app.voice_quality_analysis'].GOAL_PRESETS = {}

# Now we can safely import create_app
with patch('backend.app.utils.auto_loader.load_knowledge_base'):
    from backend.app import create_app, db
    from backend.app.models import User

class SecurityUploadTestCase(unittest.TestCase):
    def setUp(self):
        self.patcher = patch('backend.app.utils.auto_loader.load_knowledge_base')
        self.mock_loader = self.patcher.start()

        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        # Enable rate limiting for tests
        self.app.config['RATELIMIT_ENABLED'] = True
        self.app.config['RATELIMIT_STORAGE_URI'] = 'memory://'

        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            from werkzeug.security import generate_password_hash
            user = User(username='testuser_sec', password_hash=generate_password_hash('Password123'))
            db.session.add(user)
            db.session.commit()

    def tearDown(self):
        self.patcher.stop()
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def login(self):
        return self.client.post('/api/login', json={
            'username': 'testuser_sec',
            'password': 'Password123'
        })

    def test_upload_allowed_file_type_txt(self):
        self.login()
        data = {
            'file': (BytesIO(b"dummy content"), 'test.txt')
        }
        with patch('backend.app.utils.storage.storage_service.upload_file') as mock_upload:
            mock_upload.return_value = "http://mock-url/test.txt"
            response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')

        # Expect 400 because 'txt' is NOT in data.py's ALLOWED_EXTENSIONS
        self.assertEqual(response.status_code, 400)

    def test_upload_allowed_file_type_mp3(self):
        self.login()
        data = {
            'file': (BytesIO(b"audio content"), 'test.mp3')
        }
        with patch('backend.app.utils.storage.storage_service.upload_file') as mock_upload:
            mock_upload.return_value = "http://mock-url/test.mp3"
            response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200)

    def test_upload_disallowed_file_type_exe(self):
        self.login()
        data = {
            'file': (BytesIO(b"malicious content"), 'malware.exe')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 400)
        self.assertIn(b"File type 'exe' not allowed", response.data)

    def test_voice_analyze_upload_invalid_type(self):
        self.login()
        data = {
            'audio': (BytesIO(b"text content"), 'notes.txt')
        }
        response = self.client.post('/api/voice-quality/analyze', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 400)
        self.assertIn(b"File type 'txt' not allowed", response.data)

    def test_upload_rate_limit(self):
        """Test that upload endpoint is rate limited"""
        self.login()
        data = {
            'file': (BytesIO(b"audio content"), 'test.mp3')
        }

        # Limit is 10 per minute
        with patch('backend.app.utils.storage.storage_service.upload_file') as mock_upload:
            mock_upload.return_value = "http://mock-url/test.mp3"

            # 10 allowed requests
            for _ in range(10):
                # We need to seek buffer back to 0 or use new buffer each time
                data['file'] = (BytesIO(b"audio content"), 'test.mp3')
                response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
                self.assertEqual(response.status_code, 200)

            # 11th request should fail
            data['file'] = (BytesIO(b"audio content"), 'test.mp3')
            response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
            self.assertEqual(response.status_code, 429)

if __name__ == '__main__':
    unittest.main()
