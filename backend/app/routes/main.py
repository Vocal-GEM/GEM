from flask import Blueprint, send_from_directory, jsonify, current_app
import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    if os.path.exists(os.path.join(current_app.static_folder, 'index.html')):
        return send_from_directory(current_app.static_folder, 'index.html')
    return "Frontend build not found. Please ensure 'npm run build' ran successfully.", 404

@main_bp.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(current_app.static_folder, path)):
        return send_from_directory(current_app.static_folder, path)
    # Fallback to index.html for SPA routing
    return index()

@main_bp.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "Vocal GEM Backend Running"})
