from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
from flask_socketio import SocketIO
from flask_migrate import Migrate

db = SQLAlchemy()
login_manager = LoginManager()
# Rate limiter initialization
limiter = Limiter(key_func=get_remote_address)
csrf = CSRFProtect()
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading') # Allow all for now, restrict in prod
migrate = Migrate()
