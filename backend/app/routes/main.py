from flask import Blueprint, send_from_directory, jsonify, current_app, abort
from werkzeug.utils import secure_filename
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
    # Security: Validate filename to prevent path traversal attacks
    # Reject any path with .. or absolute paths
    if '..' in filename or filename.startswith('/') or filename.startswith('\\'):
        abort(400, description="Invalid filename")

    # Use secure_filename on the basename only (allows subdirectories but sanitizes each part)
    parts = filename.replace('\\', '/').split('/')
    safe_parts = [secure_filename(part) for part in parts if part]
    if not safe_parts or any(not part for part in safe_parts):
        abort(400, description="Invalid filename")

    safe_filename = os.path.join(*safe_parts)

    # Verify the file exists and is within the upload folder
    upload_folder = current_app.config['UPLOAD_FOLDER']
    full_path = os.path.realpath(os.path.join(upload_folder, safe_filename))
    upload_folder_real = os.path.realpath(upload_folder)

    if not full_path.startswith(upload_folder_real):
        abort(403, description="Access denied")

    if not os.path.isfile(full_path):
        abort(404, description="File not found")

    return send_from_directory(upload_folder, safe_filename)
