from flask import Blueprint, request, jsonify
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import db, User, Stats
from ..validators import validate_username, validate_password
from ..extensions import limiter

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/signup', methods=['POST'])
@limiter.limit("3 per hour")
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Input Validation
    is_valid_user, user_error = validate_username(username)
    if not is_valid_user:
        return jsonify({"error": user_error}), 400

    is_valid_pass, pass_error = validate_password(password)
    if not is_valid_pass:
        return jsonify({"error": pass_error}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username is not available. Please choose a different one."}), 400

    new_user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    
    # Init stats
    new_stats = Stats(user=new_user, total_points=0, high_scores={})
    db.session.add(new_stats)
    
    db.session.commit()
    
    login_user(new_user)
    return jsonify({"message": "User created", "user": {"id": new_user.id, "username": new_user.username}})

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        login_user(user)
        return jsonify({"message": "Logged in", "user": {"id": user.id, "username": user.username}})
    
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

@auth_bp.route('/me')
def me():
    if current_user.is_authenticated:
        return jsonify({"user": {"id": current_user.id, "username": current_user.username}})
    return jsonify({"user": None})
