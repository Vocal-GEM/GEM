from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Settings
from ..extensions import limiter

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@settings_bp.route('', methods=['GET'])
@login_required
def get_settings():
    settings = current_user.settings
    return jsonify(settings.preferences if settings else {})

@settings_bp.route('', methods=['PUT'])
@login_required
@limiter.limit("10 per minute")
def update_settings():
    data = request.json
    
    if not current_user.settings:
        current_user.settings = Settings(user=current_user, preferences={})
    
    # Update preferences
    # We can either replace entirely or merge. 
    # Usually for a PUT to /settings, we might expect a full replacement or a merge.
    # Let's do a merge for better UX (partial updates).
    current_prefs = current_user.settings.preferences or {}
    updated_prefs = {**current_prefs, **data}
    
    current_user.settings.preferences = updated_prefs
    
    try:
        db.session.commit()
        return jsonify(updated_prefs)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
