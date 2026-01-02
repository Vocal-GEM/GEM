from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from .extensions import db, login_manager, limiter, csrf, socketio, migrate
from .models import User
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_app():
    print("Backend Starting...")
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
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB limit

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # CORS Configuration
    # Wildcard (*) doesn't work with credentials, so we need explicit origins
    import re
    allowed_origins = [
        'https://vocalgem.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]
    
    # Add any additional origins from env var
    env_origins = os.environ.get('ALLOWED_ORIGINS', '')
    if env_origins:
        allowed_origins.extend([o.strip() for o in env_origins.split(',') if o.strip()])
    
    # Add regex for Vercel preview deployments
    allowed_origins.append(re.compile(r'^https://vocal-.*\.vercel\.app$'))
    
    CORS(app, 
         supports_credentials=True,
         origins=allowed_origins,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
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
    migrate.init_app(app, db)

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
    from .routes.settings import settings_bp

    csrf.exempt(auth_bp)
    csrf.exempt(data_bp)
    csrf.exempt(ai_bp)
    csrf.exempt(main_bp)
    csrf.exempt(analysis_bp)
    csrf.exempt(tts_bp)
    csrf.exempt(settings_bp)

    app.register_blueprint(auth_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(tts_bp)
    app.register_blueprint(settings_bp)

    from .routes.voice_quality import voice_quality_bp
    csrf.exempt(voice_quality_bp)
    app.register_blueprint(voice_quality_bp)

    from .routes.community import community_bp
    csrf.exempt(community_bp)
    app.register_blueprint(community_bp, url_prefix='/api/community')

    from .routes.marketplace import marketplace_bp
    csrf.exempt(marketplace_bp)
    app.register_blueprint(marketplace_bp, url_prefix='/api/marketplace')

    socketio.init_app(app)
    
    # Import socket handlers to register them
    from . import sockets
    from .utils.auto_loader import load_knowledge_base

    with app.app_context():
        db.create_all()
        # Auto-load knowledge base files
        load_knowledge_base(app)

    return app
