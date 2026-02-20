import unittest
import sys
import os
import tempfile
import shutil
import json
from unittest.mock import MagicMock, patch
from io import BytesIO

# Add repo root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Mock dependencies BEFORE importing blueprints
sys.modules['backend.app.extensions'] = MagicMock()
sys.modules['backend.app.extensions'].limiter.limit = lambda x: lambda f: f
sys.modules['backend.app.models'] = MagicMock()
sys.modules['backend.app.validators'] = MagicMock()
sys.modules['backend.app.voice_quality_analysis'] = MagicMock()
sys.modules['backend.app.asr_transcriber'] = MagicMock()
sys.modules['backend.app.utils'] = MagicMock()
sys.modules['backend.app.utils.cleanup'] = MagicMock()
sys.modules['backend.app.utils.storage'] = MagicMock()
sys.modules['parselmouth'] = MagicMock()
sys.modules['backend.app.services'] = MagicMock()
sys.modules['backend.app.services.voicelab_service'] = MagicMock()
sys.modules['google.generativeai'] = MagicMock()
sys.modules['backend.app.utils.rag'] = MagicMock()
sys.modules['soundfile'] = MagicMock()

# Mock specific functions
sys.modules['backend.app.utils.cleanup'].cleanup_file_after_request = MagicMock()
sys.modules['backend.app.validators'].validate_file_upload.return_value = (True, None)

# Import Flask AFTER mocking sys.modules to ensure clean state
from flask import Flask

# Import blueprints
from backend.app.routes import voice_quality
from backend.app.routes import data
from backend.app.routes import ai

class TestSecurityErrorHandling(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.app = Flask(__name__)
        self.app.config['UPLOAD_FOLDER'] = self.test_dir
        self.app.config['SECRET_KEY'] = 'test'

        # Register blueprints
        self.app.register_blueprint(voice_quality.voice_quality_bp)
        self.app.register_blueprint(data.data_bp)
        self.app.register_blueprint(ai.ai_bp)

        self.client = self.app.test_client()

        # Mock current_user for login_required routes
        self.patcher = patch('flask_login.utils._get_user')
        self.mock_current_user = self.patcher.start()
        self.mock_current_user.return_value = MagicMock(is_authenticated=True)

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        self.patcher.stop()

    def test_voice_quality_analyze_error_leakage(self):
        # Mock analyze_file to raise exception with sensitive info
        with patch('backend.app.routes.voice_quality.analyze_file', side_effect=ValueError("SENSITIVE_DB_INFO")):
            # We need to mock request.files
            data = {'audio': (BytesIO(b'fake'), 'test.wav')}
            response = self.client.post('/api/voice-quality/analyze',
                                      data=data,
                                      content_type='multipart/form-data')

            self.assertEqual(response.status_code, 500)
            self.assertIn("An internal error occurred", response.get_json().get('error', ''))
            self.assertNotIn("SENSITIVE_DB_INFO", response.get_json().get('error', ''))

    def test_voice_quality_clean_error_leakage(self):
        # Mock load_audio to raise exception
        with patch('backend.app.routes.voice_quality.load_audio', side_effect=Exception("SENSITIVE_PATH_INFO")):
            data = {'audio': (BytesIO(b'fake'), 'test.wav')}
            response = self.client.post('/api/voice-quality/clean',
                                      data=data,
                                      content_type='multipart/form-data')

            self.assertEqual(response.status_code, 500)
            self.assertIn("An internal error occurred", response.get_json().get('error', ''))
            self.assertNotIn("SENSITIVE_PATH_INFO", response.get_json().get('error', ''))

    def test_voice_quality_manipulate_error_leakage(self):
        # We assume parselmouth is mocked in sys.modules
        mock_sound = sys.modules['parselmouth'].Sound

        # We need to mock manipulate_voice
        sys.modules['backend.app.services.voicelab_service'].manipulate_voice.side_effect = RuntimeError("SENSITIVE_LIB_VERSION")

        data = {'audio': (BytesIO(b'fake'), 'test.wav'), 'pitch_shift': '0.0'}
        response = self.client.post('/api/voice-quality/manipulate',
                                  data=data,
                                  content_type='multipart/form-data')

        self.assertEqual(response.status_code, 500)
        self.assertIn("An internal error occurred", response.get_json().get('error', ''))
        self.assertNotIn("SENSITIVE_LIB_VERSION", response.get_json().get('error', ''))

    def test_data_sync_error_leakage(self):
        # Mock db.session.commit to raise exception
        with patch('backend.app.routes.data.db.session.commit', side_effect=Exception("SENSITIVE_SQL_SYNTAX")):
            response = self.client.post('/api/sync',
                                      json={'queue': [{'type': 'STATS_UPDATE', 'payload': {}}]})

            self.assertEqual(response.status_code, 500)
            self.assertEqual(response.get_json().get('error'), "Sync failed")
            self.assertNotIn("SENSITIVE_SQL_SYNTAX", response.get_json().get('error'))

    def test_data_save_user_data_error_leakage(self):
        # We need to setup user_data property on current_user mock
        self.mock_current_user.return_value.user_data = MagicMock()

        with patch('backend.app.routes.data.db.session.commit', side_effect=Exception("SENSITIVE_TABLE_NAME")):
            response = self.client.post('/api/user-data',
                                      json={'journeyProgress': {}})

            self.assertEqual(response.status_code, 500)
            self.assertEqual(response.get_json().get('error'), "Failed to save user data")
            self.assertNotIn("SENSITIVE_TABLE_NAME", response.get_json().get('error'))

    def test_ai_chat_error_leakage(self):
        # Mock model.start_chat to raise exception
        # model is global in ai.py, so we need to patch genai.GenerativeModel or similar
        # ai.py: model = genai.GenerativeModel('gemini-pro')

        # We need to ensure GEMINI_API_KEY is mocked so model is not None
        with patch('backend.app.routes.ai.model') as mock_model:
             mock_model.start_chat.side_effect = Exception("SENSITIVE_API_KEY_LEAK")

             response = self.client.post('/api/chat',
                                       json={'message': 'hello'})

             self.assertEqual(response.status_code, 500)
             # ai.py returns a role/content json
             content = response.get_json().get('content')
             self.assertIn("Sorry, I'm having trouble", content)
             self.assertNotIn("SENSITIVE_API_KEY_LEAK", content)

if __name__ == '__main__':
    unittest.main()
