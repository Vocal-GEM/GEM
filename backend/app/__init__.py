from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from .models import db, User
import os

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_app():
    # Gunicorn runs from root, so 'build' should be in os.getcwd()
    static_folder = os.path.join(os.getcwd(), 'build')
    app = Flask(__name__, static_folder=static_folder, static_url_path='')

    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-prod'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gem.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    CORS(app, supports_credentials=True)
    
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
