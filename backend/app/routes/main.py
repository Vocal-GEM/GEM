from flask import Blueprint, send_from_directory, jsonify, current_app
import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    if os.path.exists(os.path.join(current_app.static_folder, 'index.html')):
        return send_from_directory(current_app.static_folder, 'index.html')
    return jsonify({
        "status": "online",
        "message": "Vocal GEM Backend is running. Access the frontend via your Vercel URL.",
        "service": "api"
    })

@main_bp.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(current_app.static_folder, path)):
        return send_from_directory(current_app.static_folder, path)
    # Fallback to index.html for SPA routing
    return index()

@main_bp.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "Vocal GEM Backend Running"})

@main_bp.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
