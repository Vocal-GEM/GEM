
import pytest
import io
from unittest.mock import MagicMock, patch
from flask import Flask, jsonify, current_app
from flask_login import LoginManager, UserMixin

# Import blueprints
from backend.app.routes.settings import settings_bp
from backend.app.routes.data import data_bp
from backend.app.routes.voice_quality import voice_quality_bp
from backend.app.routes.analysis import analysis_bp
from backend.app.routes.ai import ai_bp

class MockUser(UserMixin):
    def __init__(self):
        self.id = 1
        self.username = "test_user"
        self.settings = MagicMock()
        self.settings.preferences = {}
        self.stats = MagicMock()

class TestLoggingSecurity:

    @pytest.fixture
    def app(self):
        app = Flask(__name__)
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test_key'
        app.config['WTF_CSRF_ENABLED'] = False

        # Init LoginManager
        login_manager = LoginManager()
        login_manager.init_app(app)
        app.login_manager = login_manager # Ensure it's attached?

        @login_manager.user_loader
        def load_user(user_id):
            return MockUser()

        # Mock database
        app.db = MagicMock()

        # Register blueprints
        app.register_blueprint(settings_bp)
        app.register_blueprint(data_bp)
        app.register_blueprint(voice_quality_bp)
        app.register_blueprint(analysis_bp, url_prefix='/api')
        app.register_blueprint(ai_bp)

        return app

    @pytest.fixture
    def client(self, app):
        return app.test_client()

    @patch('backend.app.routes.settings.db')
    @patch('flask_login.utils._get_user')
    def test_settings_error_logging(self, mock_get_user, mock_db, client, app):
        """Verify settings update logs error but returns generic message"""
        # Setup mock user
        user = MockUser()
        mock_get_user.return_value = user

        # Simulate DB error
        mock_db.session.commit.side_effect = Exception("Database connection failed: confidential_db_url")

        # Mock logger
        with patch.object(app.logger, 'error') as mock_logger:
            response = client.put('/api/settings', json={"theme": "dark"})

            # Check response - should be generic
            assert response.status_code == 500
            assert response.json == {"error": "Failed to update settings"}

            # Check log - should contain specific error
            mock_logger.assert_called_with("Settings update error: Database connection failed: confidential_db_url")

    @patch('backend.app.routes.data.db')
    @patch('flask_login.utils._get_user')
    def test_sync_error_logging(self, mock_get_user, mock_db, client, app):
        """Verify sync logs error but returns generic message"""
        user = MockUser()
        mock_get_user.return_value = user

        # Simulate DB error
        mock_db.session.commit.side_effect = Exception("Sync fatal error: detailed info")

        # Mock logger
        with patch.object(app.logger, 'error') as mock_logger:
            response = client.post('/api/sync', json={"queue": []})

            assert response.status_code == 500
            assert response.json == {"error": "Sync failed"}

            mock_logger.assert_called_with("Sync Error: Sync fatal error: detailed info")

    @patch('backend.app.routes.voice_quality.validate_file_upload')
    @patch('backend.app.routes.voice_quality.analyze_file')
    def test_voice_quality_error_logging(self, mock_analyze, mock_validate, client, app):
        """Verify voice analysis logs error but returns generic message"""
        # Ensure file upload is valid
        mock_validate.return_value = (True, None)

        # Force analyze_file to raise exception
        mock_analyze.side_effect = Exception("Librosa failed: internal stack trace")

        # Mock logger
        with patch.object(app.logger, 'error') as mock_logger:
            data = {
                'audio': (io.BytesIO(b'fake_audio_content'), 'test.wav')
            }
            # We must use proper content type and data
            response = client.post('/api/voice-quality/analyze', data=data, content_type='multipart/form-data')

            # If 400, it means validation failed or file not found.
            if response.status_code == 400:
                print(response.json)

            assert response.status_code == 500
            assert response.json == {"error": "An internal error occurred during voice quality analysis."}

            mock_logger.assert_called_with("Voice quality analysis error: Librosa failed: internal stack trace")
