import unittest
from flask import Flask
from io import BytesIO
from flask_login import LoginManager, UserMixin
import sys
from unittest.mock import MagicMock

# 1. Mock dependencies that cause side effects or require DB
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()
# Mock limiter to just pass through
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f

# Mock storage service
mock_storage = MagicMock()
mock_storage.upload_file.return_value = "http://mock-storage/file.wav"
sys.modules['backend.app.utils.storage'] = MagicMock()
sys.modules['backend.app.utils.storage'].storage_service = mock_storage

# IMPORTANT: Do NOT mock backend.app.validators! We want to test the real one.

import os
# Adjust path to import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.routes.data import data_bp
from app.routes.ai import ai_bp
from app.validators import validate_file_upload

class TestRealValidation(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(data_bp)
        self.app.register_blueprint(ai_bp)

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)
        self.client = self.app.test_client()

    def test_upload_magic_number_validation(self):
        """Test that upload endpoint rejects fake content (magic number check)."""
        # Fake PDF content
        data = {
            'file': (BytesIO(b'This is not a PDF'), 'fake.pdf')
        }

        # Setup login
        with self.client.session_transaction() as sess:
            sess['_user_id'] = '1'
            sess['_fresh'] = True

        @self.login_manager.user_loader
        def load_user(user_id):
            class User(UserMixin):
                id = int(user_id)
                username = 'admin' # For AI route
            return User()

        # Test against data endpoint (generic upload)
        # Note: data.py's upload endpoint checks allowed_file which is limited to images/audio.
        # So submitting a PDF to /api/upload (data_bp) might fail due to extension check first?
        # data.py allowed_file: {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'm4a', 'ogg', 'webm'}
        # So PDF is not allowed there regardless of magic number.

        # Let's try a fake JPG.
        fake_jpg = (BytesIO(b'Not a JPG'), 'fake.jpg')
        data_jpg = {'file': fake_jpg}

        response = self.client.post('/api/upload', data=data_jpg, content_type='multipart/form-data')

        # It should fail with 400
        self.assertEqual(response.status_code, 400)
        # Check error message
        self.assertIn("File content does not match extension", response.json['error'])

    def test_ai_train_validation_fix(self):
        """Test that AI train endpoint works with valid PDF (logic fix)."""
        # Valid PDF content header
        valid_pdf = (BytesIO(b'%PDF-1.4\nSome content'), 'valid.pdf')
        data = {'file': valid_pdf}

        # Mock rag_system
        with unittest.mock.patch('app.routes.ai.rag_system') as mock_rag:
            mock_rag.add_pdf.return_value = 5

            # Setup login (admin)
            with self.client.session_transaction() as sess:
                sess['_user_id'] = '1'
                sess['_fresh'] = True

            os.environ['ADMIN_USERNAME'] = 'admin'

            @self.login_manager.user_loader
            def load_user(user_id):
                class User(UserMixin):
                    id = int(user_id)
                    username = 'admin'
                return User()

            response = self.client.post('/api/train', data=data, content_type='multipart/form-data')

            # If the logic was still broken (passing extensions), this would return 400 "Invalid category..."
            # If fixed, it should return 200 (Success)
            if response.status_code != 200:
                print(f"AI Train failed: {response.json}")

            self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
