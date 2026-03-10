import pytest
from unittest.mock import MagicMock, patch
import sys
import os

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
        import importlib
        sys.modules['backend.app.extensions'] = MagicMock()
        sys.modules['backend.app.models'] = MagicMock()

        community = importlib.import_module('backend.app.routes.community')
        assert community.community_bp is not None
    except ImportError as e:
        pytest.fail(f"Failed to import community module: {e}")
    except SyntaxError as e:
        pytest.fail(f"Syntax error in community module: {e}")
