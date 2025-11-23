from flask import Flask, request, redirect
from flask_cors import CORS
from flask_login import LoginManager
from .models import db, User
import os
from dotenv import load_dotenv

load_dotenv()

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_app():
    # Gunicorn runs from root, so 'build' should be in os.getcwd()
    static_folder = os.path.join(os.getcwd(), 'build')
    app = Flask(__name__, static_folder=static_folder, static_url_path='')

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod')
    
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

    # CORS Configuration
    # In production, restrict to your frontend domain
    allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
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
    
    db.init_app(app)
    login_manager.init_app(app)

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.data import data_bp
    from .routes.ai import ai_bp
    from .routes.main import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(main_bp)

    with app.app_context():
        db.create_all()

    return app
