from flask import Blueprint, request, jsonify, send_file, after_this_request
import os
import tempfile
import soundfile as sf
import logging
from ..voice_quality_analysis import analyze_file, analyze_file_with_transcript, GOAL_PRESETS, clean_audio_signal, load_audio
from ..asr_transcriber import transcribe_audio_with_words
from ..extensions import limiter

logger = logging.getLogger(__name__)
voice_quality_bp = Blueprint('voice_quality', __name__)


@voice_quality_bp.route('/api/voice-quality/analyze', methods=['POST'])
@limiter.limit("10 per minute")  # Rate limit expensive analysis operations
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded (field name 'audio' required)."}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    goal_name = request.form.get("goal", "transfem_soft_slightly_breathy")
    if goal_name not in GOAL_PRESETS:
        # Return error instead of silently substituting
        valid_goals = list(GOAL_PRESETS.keys())
        return jsonify({"error": f"Invalid goal. Valid options: {', '.join(valid_goals)}"}), 400

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
        # Log full error but return generic message
        logger.error(f"Voice quality analysis error: {e}")
        return jsonify({"error": "Voice analysis failed. Please ensure the audio file is valid."}), 500
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return jsonify(result)

@voice_quality_bp.route('/api/voice-quality/clean', methods=['POST'])
@limiter.limit("10 per minute")  # Rate limit audio processing operations
def clean_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)

        # Load, Clean, Save
        y, sr = load_audio(tmp_path)
        y_clean = clean_audio_signal(y, sr)

        # Save back to temp
        sf.write(tmp_path, y_clean, sr)

        # Schedule cleanup after response is sent
        @after_this_request
        def cleanup(response):
            try:
                if tmp_path and os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception as cleanup_err:
                logger.warning(f"Failed to cleanup temp file {tmp_path}: {cleanup_err}")
            return response

        return send_file(
            tmp_path,
            mimetype="audio/wav",
            as_attachment=True,
            download_name="cleaned_audio.wav"
        )

    except Exception as e:
        # Log full error but return generic message
        logger.error(f"Audio cleaning error: {e}")
        # Cleanup on error
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        return jsonify({'error': 'Audio cleaning failed. Please try again with a valid audio file.'}), 500

@voice_quality_bp.route('/api/voice-quality/goals', methods=['GET'])
def get_goals():
    return jsonify(GOAL_PRESETS)
