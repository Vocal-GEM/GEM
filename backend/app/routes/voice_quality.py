from flask import Blueprint, request, jsonify
import os
import tempfile
from ..voice_quality_analysis import analyze_file, analyze_file_with_transcript, GOAL_PRESETS
from ..asr_transcriber import transcribe_audio_with_words

voice_quality_bp = Blueprint('voice_quality', __name__)

@voice_quality_bp.route('/api/voice-quality/analyze', methods=['POST'])
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded (field name 'audio' required)."}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    goal_name = request.form.get("goal", "transfem_soft_slightly_breathy")
    if goal_name not in GOAL_PRESETS:
        goal_name = "transfem_soft_slightly_breathy"

    include_transcript = request.form.get("include_transcript", "false").lower() == "true"

    # Save to temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
        file.save(tmp_path)

    try:
        if include_transcript:
            result = analyze_file_with_transcript(
                tmp_path,
                goal_name=goal_name,
                transcriber=transcribe_audio_with_words,
                language="en"
            )
        else:
            result = analyze_file(tmp_path, goal_name=goal_name)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return jsonify(result)

@voice_quality_bp.route('/api/voice-quality/goals', methods=['GET'])
def get_goals():
    return jsonify(GOAL_PRESETS)
