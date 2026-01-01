
import sys
import unittest
from unittest.mock import MagicMock, patch
from io import BytesIO

# Mock heavy dependencies BEFORE importing app
sys.modules['google.generativeai'] = MagicMock()
sys.modules['pypdf'] = MagicMock()
sys.modules['numpy'] = MagicMock()
sys.modules['soundfile'] = MagicMock()
sys.modules['librosa'] = MagicMock()
sys.modules['faster_whisper'] = MagicMock()

# Mock the auto_loader to prevent knowledge base loading
with patch('backend.app.utils.auto_loader.load_knowledge_base') as mock_load:
    from app import create_app, db
    from app.models import User

class SecurityUploadTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            from werkzeug.security import generate_password_hash
            user = User(username='testuser_sec', password_hash=generate_password_hash('Password123'))
            db.session.add(user)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def login(self):
        return self.client.post('/api/login', json={
            'username': 'testuser_sec',
            'password': 'Password123'
        })

    def test_upload_allowed_file_type(self):
        self.login()

        # Test valid upload (txt) - assuming txt is allowed or we will make it allowed
        data = {
            'file': (BytesIO(b"dummy content"), 'test.txt')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        # If it fails, it might be due to S3 mock missing, but let's see.
        # StorageService might try to save locally if S3 is not configured.
        if response.status_code != 200:
            print(f"Upload failed: {response.data}")
        self.assertEqual(response.status_code, 200)

    def test_upload_disallowed_file_type(self):
        self.login()

        # Test invalid upload (exe)
        data = {
            'file': (BytesIO(b"malicious content"), 'malware.exe')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')

        # NOW we expect 400 Bad Request
        self.assertEqual(response.status_code, 400, "Validation failed: executable file should be rejected")
        self.assertIn(b"File type 'exe' not allowed", response.data)

    def test_voice_analyze_upload_invalid_type(self):
        # Voice quality endpoint
        data = {
            'audio': (BytesIO(b"text content"), 'notes.txt')
        }
        response = self.client.post('/api/voice-quality/analyze', data=data, content_type='multipart/form-data')

        # NOW we expect 400 Bad Request because 'txt' is not allowed for 'audio' endpoint
        self.assertEqual(response.status_code, 400, "Validation failed: non-audio file should be rejected")
        self.assertIn(b"File type 'txt' not allowed", response.data)

if __name__ == '__main__':
    unittest.main()
