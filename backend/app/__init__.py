from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from .extensions import db, login_manager, limiter, csrf, socketio
from .models import User
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_app():
    # Gunicorn runs from root, so 'build' should be in os.getcwd()
    static_folder = os.path.join(os.getcwd(), 'build')
    app = Flask(__name__, static_folder=static_folder, static_url_path='')

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod')
    app.config['WTF_CSRF_ENABLED'] = False # Disable CSRF for API-only backend
    
    # Database - support both PostgreSQL (production) and SQLite (development)
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Render.com provides postgres:// but SQLAlchemy needs postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gem.db'
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # CORS Configuration with Vercel preview support
    def is_allowed_origin(origin):
        allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
        
        # Check exact matches
        if origin in allowed_origins or '*' in allowed_origins:
            return True
        
        # Allow Vercel preview deployments (vocal-*.vercel.app)
        if origin and origin.endswith('.vercel.app'):
            return True
        
        return False
    
    # Custom CORS handler
    @app.after_request
    def handle_cors(response):
        origin = request.headers.get('Origin')
        if origin and is_allowed_origin(origin):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response
    
    # Security Headers
    @app.after_request
    def add_security_headers(response):
        # HTTPS redirect in production
        if os.environ.get('FLASK_ENV') == 'production' and request.headers.get('X-Forwarded-Proto') == 'http':
            return redirect(request.url.replace('http://', 'https://'), code=301)
        
        # Security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # CSP - adjust based on your needs
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://generativelanguage.googleapis.com; "
            "media-src 'self' blob:; "
            "worker-src 'self' blob:;"
        )
        response.headers['Content-Security-Policy'] = csp
        
        return response
    
    # Session Security
    app.config['SESSION_COOKIE_SECURE'] = True # Required for SameSite=None
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'None' # Allow cross-origin (localhost -> render)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

    db.init_app(app)
    login_manager.init_app(app)
    limiter.init_app(app)
    csrf.init_app(app)

    @app.errorhandler(400)
    def bad_request(e):
        if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
            return jsonify(error=str(e)), 400
        return jsonify(error="Bad Request"), 400


    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.data import data_bp
    from .routes.ai import ai_bp
    from .routes.main import main_bp
    from .routes.analysis import analysis_bp
    from .routes.tts import tts_bp

    csrf.exempt(auth_bp)
    csrf.exempt(data_bp)
    csrf.exempt(ai_bp)
    csrf.exempt(main_bp)
    csrf.exempt(analysis_bp)
    csrf.exempt(tts_bp)

    app.register_blueprint(auth_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(tts_bp)

    from .routes.voice_quality import voice_quality_bp
    csrf.exempt(voice_quality_bp)
    app.register_blueprint(voice_quality_bp)

    socketio.init_app(app)
    
    # Import socket handlers to register them
    from . import sockets

    with app.app_context():
        db.create_all()

    return app
