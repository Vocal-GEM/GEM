import unittest
import sys
import os
import tempfile
import shutil
from unittest.mock import MagicMock, patch
from flask import Flask
from flask_login import LoginManager
from werkzeug.datastructures import FileStorage
from io import BytesIO

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()

from backend.app.routes import community

class TestCommunitySecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Setup a real Flask app for context
        self.app = Flask(__name__)
        self.app.config['UPLOAD_FOLDER'] = self.test_dir
        self.app.config['SECRET_KEY'] = 'test'

        self.login_manager = LoginManager()
        self.login_manager.init_app(self.app)

        # Mock DB
        self.patcher_db = patch('backend.app.routes.community.db')
        self.mock_db = self.patcher_db.start()

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        self.patcher_db.stop()

    def test_share_voice_secure_cleanup(self):
        """
        Test that share_voice securely cleans up the original raw audio file.
        """
        file_content = b'fake audio data'
        file_storage = FileStorage(
            stream=BytesIO(file_content),
            filename='test.wav',
            name='audio',
            content_type='audio/wav'
        )

        data = {
            'audio': file_storage,
            'context': 'test',
            'expiration_days': '7'
        }

        with self.app.test_request_context('/share-voice', method='POST', data=data, content_type='multipart/form-data'):

            mock_user = MagicMock()
            mock_user.id = 'user123'
            mock_user.is_authenticated = True

            with patch('flask_login.utils._get_user', return_value=mock_user):

                # Mock validators
                with patch('backend.app.routes.community.validate_file_upload', return_value=(True, None)):

                    def side_effect_anonymize(path):
                        anon_path = path.replace('.', '_anon.')
                        with open(anon_path, 'w') as f:
                            f.write('anonymized data')
                        return anon_path

                    with patch('backend.app.routes.community.anonymize_audio', side_effect=side_effect_anonymize):
                        # Call the endpoint
                        community.share_voice()

                        files = os.listdir(self.test_dir)
                        original_files = [f for f in files if '_anon.' not in f]
                        anon_files = [f for f in files if '_anon.' in f]

                        self.assertTrue(len(anon_files) > 0, "Anonymized file should be created")

                        # SECURITY VERIFICATION: Original raw file must be deleted
                        self.assertEqual(len(original_files), 0, "Original raw file should be deleted!")

if __name__ == '__main__':
    unittest.main()
