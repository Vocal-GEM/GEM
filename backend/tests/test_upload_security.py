import os
import sys
import unittest
import io
import time
import unittest
import io
import sys
import os
from unittest.mock import MagicMock
from werkzeug.security import generate_password_hash

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock google.generativeai and other potentially slow modules before importing app
sys.modules['google.generativeai'] = MagicMock()
sys.modules['pypdf'] = MagicMock()
sys.modules['numpy'] = MagicMock()

# Mock load_knowledge_base to prevent slow initialization
import backend.app
backend.app.load_knowledge_base = MagicMock()
# Mock modules to prevent startup hang
mock_loader = MagicMock()
sys.modules['app.utils.auto_loader'] = mock_loader
sys.modules['backend.app.utils.auto_loader'] = mock_loader

# Mock RAG system
mock_rag = MagicMock()
sys.modules['app.utils.rag'] = mock_rag
sys.modules['backend.app.utils.rag'] = mock_rag

from app import create_app, db
from app.models import User

class TestUploadSecurity(unittest.TestCase):
    def setUp(self):
        # Mock load_knowledge_base
        mock_loader.load_knowledge_base = MagicMock()

        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            user = User(username='testuser')
            user.password_hash = generate_password_hash('password123')
            db.session.add(user)
            db.session.commit()
            # Create user if not exists
            if not User.query.filter_by(username='testuser').first():
                user = User(username='testuser', password_hash=generate_password_hash('password123'))
                db.session.add(user)
                db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def login(self):
        return self.client.post('/api/login', json={
            'username': 'testuser',
            'password': 'password123'
        })

    def test_upload_allowed_file(self):
        self.login()
        data = {
            'file': (io.BytesIO(b"dummy image content"), 'test.png')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)

    def test_upload_blocked_extension(self):
        self.login()
        data = {
            'file': (io.BytesIO(b"print('Exploit!')"), 'exploit.py')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        self.assertIn("File type not allowed", str(response.json))
    def test_upload_allowed_extension(self):
        self.login()
        data = {
            'file': (io.BytesIO(b"dummy content"), 'test.jpg')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        self.assertIn('url', response.json)

    def test_upload_forbidden_extension(self):
        self.login()
        extensions = ['py', 'exe', 'sh', 'php', 'html', 'js']
        for ext in extensions:
            data = {
                'file': (io.BytesIO(b"malicious content"), f'exploit.{ext}')
            }
            response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
            self.assertEqual(response.status_code, 400, f"Allowed upload of .{ext}")
            self.assertIn('error', response.json)

    def test_upload_no_extension(self):
        self.login()
        data = {
            'file': (io.BytesIO(b"content"), 'testfile')
            'file': (io.BytesIO(b"dummy content"), 'testfile')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()
