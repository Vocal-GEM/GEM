import pytest
from unittest.mock import MagicMock, patch
import sys
import os
import importlib

# Adjust path to include backend
sys.path.append(os.path.abspath('backend'))

@pytest.fixture(scope="module", autouse=True)
def mock_app_dependencies():
    """
    Mock dependencies required to import community module without a full app context.
    We use patch.dict to ensure changes are undone after the test module completes.
    """
    mocks = {}

    # Mock flask_login
    mock_flask_login = MagicMock()
    mock_flask_login.login_required = lambda f: f
    mocks['flask_login'] = mock_flask_login

    # Mock app.extensions
    mock_extensions = MagicMock()
    mock_extensions.limiter.limit.return_value = lambda f: f
    mocks['app.extensions'] = mock_extensions

    mocks['app.models'] = MagicMock()

    with patch.dict(sys.modules, mocks):
        yield

def test_community_module_syntax():
    """Verify backend/app/routes/community.py can be imported (syntax check)"""
    try:
        from app.routes import community
        # Force reload to ensure we are testing the current file state with our mocks
        importlib.reload(community)
        assert community.community_bp is not None
    except ImportError as e:
        pytest.fail(f"Failed to import community module: {e}")
    except SyntaxError as e:
        pytest.fail(f"Syntax error in community module: {e}")

def test_sanitize_html_xss():
    """Test that HTML sanitization removes XSS vectors (re-verifying)"""
    from app.validators import sanitize_html

    payloads = [
        ("<script>alert('xss')</script>", "alert('xss')"),
        ("<img src=x onerror=alert(1)>", ""),
        ("<a href='javascript:alert(1)'>Click me</a>", "<a>Click me</a>"),
    ]
    for input_text, expected in payloads:
        sanitized = sanitize_html(input_text)
        assert "<script>" not in sanitized
        assert "onerror" not in sanitized
        assert sanitized == expected

def test_share_voice_logic_structure():
    """
    Introspect share_voice function to ensure it has the correct structure
    (try...finally block) without running it.
    """
    from app.routes import community
    import inspect

    # Reload module to ensure we get the patched version
    importlib.reload(community)

    source = inspect.getsource(community.share_voice)

    # Check that we have a try...finally block for cleanup
    assert "try:" in source
    assert "finally:" in source
    assert "os.remove(filepath)" in source
    # Ensure no duplicate finally blocks
    assert source.count("finally:") == 1
