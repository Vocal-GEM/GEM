import pytest
import os
import sys
from flask import request

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

@pytest.fixture(autouse=True)
def clean_env():
    """Ensure environment variables are clean before each test"""
    old_env = os.environ.copy()
    if 'RENDER' in os.environ: del os.environ['RENDER']
    if 'VERCEL' in os.environ: del os.environ['VERCEL']
    if 'FLASK_ENV' in os.environ: del os.environ['FLASK_ENV']
    if 'ENABLE_PROXY_FIX' in os.environ: del os.environ['ENABLE_PROXY_FIX']
    yield
    os.environ.clear()
    os.environ.update(old_env)

@pytest.fixture
def mock_loader(monkeypatch):
    """Mock load_knowledge_base to speed up app creation"""
    try:
        import backend.app.utils.auto_loader
        monkeypatch.setattr(backend.app.utils.auto_loader, 'load_knowledge_base', lambda app: None)
    except ImportError:
        pass

def test_proxy_fix_applied(mock_loader):
    """
    Verifies that ProxyFix middleware is applied when RENDER env var is set.
    """
    os.environ['RENDER'] = 'true'

    from backend.app import create_app
    app = create_app()
    client = app.test_client()

    @app.route('/debug-ip')
    def debug_ip():
        return request.remote_addr

    response = client.get('/debug-ip', headers={'X-Forwarded-For': '10.0.0.1'})
    assert response.data.decode() == '10.0.0.1'

def test_proxy_fix_not_applied_by_default(mock_loader):
    """
    Verifies that ProxyFix middleware is NOT applied by default (local dev).
    """
    from backend.app import create_app
    app = create_app()
    client = app.test_client()

    @app.route('/debug-ip')
    def debug_ip():
        return request.remote_addr

    response = client.get('/debug-ip', headers={'X-Forwarded-For': '10.0.0.1'})
    # Should be 127.0.0.1 because ProxyFix is disabled
    assert response.data.decode() == '127.0.0.1'
