
import unittest
import sys
from unittest.mock import MagicMock

# MOCK EVERYTHING HEAVY BEFORE IMPORTING APP
sys.modules['backend.app.utils.auto_loader'] = MagicMock()
sys.modules['backend.app.utils.auto_loader'].load_knowledge_base = MagicMock()

# Mock google.generativeai to prevent connection attempts
sys.modules['google.generativeai'] = MagicMock()
sys.modules['google.genai'] = MagicMock()

# Mock pypdf
sys.modules['pypdf'] = MagicMock()

# Mock numpy and soundfile if needed, but they are usually fast enough if just imported.
# But voice_quality_analysis might load models.
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'].analyze_file = MagicMock(return_value={})
sys.modules['backend.app.voice_quality_analysis'].analyze_file_with_transcript = MagicMock(return_value={})
sys.modules['backend.app.voice_quality_analysis'].load_audio = MagicMock(return_value=(MagicMock(), 22050))
sys.modules['backend.app.voice_quality_analysis'].clean_audio_signal = MagicMock(return_value=MagicMock())
sys.modules['backend.app.voice_quality_analysis'].GOAL_PRESETS = {}

# Now we can safely import create_app
from app import create_app

class SecurityUploadTestCase(unittest.TestCase):
    def setUp(self):
        # Patch load_knowledge_base again just to be sure
        self.patcher = unittest.mock.patch('app.utils.auto_loader.load_knowledge_base')
        self.mock_loader = self.patcher.start()

        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        # Initialize db
        with self.app.app_context():
            from app.models import db, User
            db.create_all()

            # Create test user if not exists
            if not User.query.filter_by(username='testuser_sec').first():
                from werkzeug.security import generate_password_hash
                user = User(username='testuser_sec', password_hash=generate_password_hash('Password123'))
                db.session.add(user)
                db.session.commit()

    def tearDown(self):
        self.patcher.stop()
        with self.app.app_context():
             from app.models import db
             db.drop_all()

    def login(self):
        return self.client.post('/api/login', json={
            'username': 'testuser_sec',
            'password': 'Password123'
        })

    def test_upload_allowed_file_type_txt(self):
        self.login()
        from io import BytesIO
        data = {
            'file': (BytesIO(b"dummy content"), 'test.txt')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)

    def test_upload_disallowed_file_type_exe(self):
        self.login()
        from io import BytesIO
        data = {
            'file': (BytesIO(b"malicious content"), 'malware.exe')
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')

        if response.status_code == 200:
            print("\n[VULNERABILITY CONFIRMED] Uploaded .exe file successfully.")
        else:
            print("\n[SECURE] Upload of .exe file blocked.")

        self.assertEqual(response.status_code, 400, "Should block .exe files")

    def test_voice_analyze_upload_invalid_type(self):
        from io import BytesIO
        data = {
            'audio': (BytesIO(b"text content"), 'notes.txt')
        }
        response = self.client.post('/api/voice-quality/analyze', data=data, content_type='multipart/form-data')

        if response.status_code == 200:
             print("\n[VULNERABILITY CONFIRMED] Analyzed .txt file successfully.")
        elif response.status_code == 500:
             print("\n[INFO] Crashed on .txt file (500).")
        else:
             print(f"\n[SECURE] Blocked .txt file with status {response.status_code}.")

        self.assertEqual(response.status_code, 400, "Should block non-audio files")

if __name__ == '__main__':
    unittest.main()
