import pytest
from unittest.mock import MagicMock, patch, ANY
import sys
import os
from flask import Flask
from flask_login import LoginManager, login_user, UserMixin

# Ensure backend is in path
sys.path.append(os.path.abspath('backend'))

# Mock extensions and models before importing blueprint
from backend.app.validators import sanitize_html

def test_sanitize_html_xss():
    """Test that HTML sanitization removes XSS vectors"""

    # Test cases
    payloads = [
        # Input, Expected (Bleach strips tags but keeps text content by default)
        ("<script>alert('xss')</script>", "alert('xss')"),
        ("<img src=x onerror=alert(1)>", ""), # img is not allowed, no content, so it disappears
        ("<a href='javascript:alert(1)'>Click me</a>", "<a>Click me</a>"), # href sanitization removes unsafe scheme
        ("Hello <script>bad</script> World", "Hello bad World"),
        ("<b>Bold</b> and <i>Italic</i>", "<b>Bold</b> and <i>Italic</i>"), # Allowed tags
    ]

    for input_text, expected in payloads:
        sanitized = sanitize_html(input_text)

        # Security Assertions
        assert "<script>" not in sanitized
        assert "javascript:" not in sanitized
        assert "onerror" not in sanitized

        # Functional Assertions
        assert sanitized == expected

def test_community_module_integrity():
    """Verify backend.app.routes.community can be imported (syntax check)"""
    try:
        from backend.app.routes import community
        assert community.community_bp is not None
    except ImportError as e:
        pytest.fail(f"Failed to import community module: {e}")
    except SyntaxError as e:
        pytest.fail(f"Syntax error in community module: {e}")

@patch('backend.app.routes.community.db.session')
def test_submit_story_sanitization(mock_session):
    """Test that submit_success_story sanitizes inputs before saving to DB"""
    # Create a minimal app
    app = Flask(__name__)
    app.secret_key = 'secret'

    # Setup LoginManager
    login_manager = LoginManager()
    login_manager.init_app(app)

    class MockUser(UserMixin):
        id = 1

    @login_manager.user_loader
    def load_user(user_id):
        return MockUser()

    # Import inside test
    from backend.app.routes.community import submit_success_story
    from backend.app.models import SuccessStory

    json_data = {
        'title': '<h1>Hacked Title</h1><script>alert(1)</script>',
        'story': '<img src=x onerror=alert(1)>My Story',
        'voice_goal': 'feminine',
        'timeline_months': 6,
        'techniques_used': ['<script>bad()</script>', '<b>good</b>'],
        'consent_public': True
    }

    with app.test_request_context(json=json_data):
        login_user(MockUser())

        # We mock jsonify to just return the dictionary for simpler assertion if needed
        # But mostly to avoid any serialization issues.
        with patch('backend.app.routes.community.jsonify', side_effect=lambda x: x):
             submit_success_story()

    # Check that db.session.add was called
    assert mock_session.add.called

    # Find the SuccessStory object in the add calls
    saved_story = None
    for call in mock_session.add.call_args_list:
        arg = call[0][0]
        if isinstance(arg, SuccessStory):
            saved_story = arg
            break

    assert saved_story is not None, "SuccessStory object was not added to session"

    # Verify Sanitization
    print(f"Saved Title: {saved_story.title}")
    print(f"Saved Story: {saved_story.story}")
    print(f"Saved Techniques: {saved_story.techniques_used}")

    assert "<script>" not in saved_story.title
    assert "<h1>" not in saved_story.title

    assert "onerror" not in saved_story.story
    assert "<img" not in saved_story.story

    assert "<script>" not in saved_story.techniques_used[0]
    assert "<b>good</b>" == saved_story.techniques_used[1]
