import unittest
from flask import Flask
from io import BytesIO
from flask_login import LoginManager, UserMixin

# Mock the storage service to avoid S3 or filesystem writes during test
import sys
from unittest.mock import MagicMock

# We need to mock the backend.app imports before importing the route
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f

# Mock storage service
mock_storage = MagicMock()
mock_storage.upload_file.return_value = "http://mock-storage/file.wav"
sys.modules['backend.app.utils.storage'] = MagicMock()
sys.modules['backend.app.utils.storage'].storage_service = mock_storage

import os
# Adjust path to import the blueprint
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.routes.data import data_bp, allowed_file

class TestSecurityUpload(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test'
        self.app.register_blueprint(data_bp)

        # Setup LoginManager
        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Mock user
        class User(UserMixin):
            id = 1
            is_authenticated = True

        # This is the tricky part with Flask-Login and test_client.
        # We can bypass the login check by mocking login_required if we can't get the user loaded.
        # But we want to test that the route works.

        # Instead of fighting Flask-Login's session management, let's mock the current_user proxy
        # BUT flask_login.current_user is a proxy to _request_ctx_stack.top.user

        # Easier approach: Use a request context and manually push a user

        self.client = self.app.test_client()

    def test_allowed_file_helper(self):
        """Test the helper function for allowed extensions."""
        self.assertTrue(allowed_file("audio.wav"))
        self.assertTrue(allowed_file("song.mp3"))
        self.assertTrue(allowed_file("image.jpg"))
        self.assertFalse(allowed_file("script.js"))
        self.assertFalse(allowed_file("malicious.exe"))
        self.assertFalse(allowed_file("page.html"))
        self.assertFalse(allowed_file("noextension"))

    def test_upload_allowed_file(self):
        """Test uploading a valid file."""
        data = {
            'file': (BytesIO(b'fake audio data'), 'test.wav')
        }

        # We need to bypass login_required decorator logic or simulate a logged in user.
        # Since we can't easily modify the decorated function, we can trick Flask-Login
        # by pushing a user to the session? No, simpler is to mock the `login_required` decorator
        # before importing the blueprint, but we already imported it.

        # However, we can use test_request_context() to push a user.
        with self.app.test_request_context():
            # Mock current_user
            from flask_login import login_user
            class User(UserMixin):
                id = 1
            user = User()
            login_user(user)

            # Now call the view function directly to verify logic, bypassing the test_client routing which resets context
            # BUT the route is decorated.

            # Re-invoking via client loses the context user unless we use session_transaction.
            pass

        # Let's try to simulate login
        with self.client.session_transaction() as sess:
            sess['_user_id'] = '1'
            sess['_fresh'] = True

        # We need the user loader to work
        @self.login_manager.user_loader
        def load_user(user_id):
            class User(UserMixin):
                id = int(user_id)
            return User()

        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200)
        self.assertIn("url", response.json)

    def test_upload_disallowed_file(self):
        """Test uploading an invalid file."""
        data = {
            'file': (BytesIO(b'<html>alert(1)</html>'), 'exploit.html')
        }

        # Setup login
        with self.client.session_transaction() as sess:
            sess['_user_id'] = '1'
            sess['_fresh'] = True

        @self.login_manager.user_loader
        def load_user(user_id):
            class User(UserMixin):
                id = int(user_id)
            return User()

        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json['error'], "File type 'html' not allowed")

if __name__ == '__main__':
    unittest.main()
