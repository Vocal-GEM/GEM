from flask import Blueprint, request, jsonify, send_file
import os
import tempfile
import soundfile as sf
from ..voice_quality_analysis import analyze_file, analyze_file_with_transcript, GOAL_PRESETS, clean_audio_signal, load_audio
from ..asr_transcriber import transcribe_audio_with_words
from ..validators import validate_file_upload

voice_quality_bp = Blueprint('voice_quality', __name__)

@voice_quality_bp.route('/api/voice-quality/analyze', methods=['POST'])
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded (field name 'audio' required)."}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    # Security: Validate file type (only audio allowed)
    is_valid, error = validate_file_upload(file.filename, allowed_types=['audio'])
    # Security check - Audio only
    is_valid, error_msg = validate_file_upload(file.filename, allowed_types=['audio'])
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    # Security Validation
    is_valid, error = validate_file_upload(file.filename, file.content_type)
    if not is_valid:
        return jsonify({"error": error}), 400

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

@voice_quality_bp.route('/api/voice-quality/clean', methods=['POST'])
def clean_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Security: Validate file type (only audio allowed)
    is_valid, error = validate_file_upload(file.filename, allowed_types=['audio'])
    if not is_valid:
        return jsonify({"error": error}), 400
    # Security check - Audio only
    is_valid, error_msg = validate_file_upload(file.filename, allowed_types=['audio'])
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)
            
        # Load, Clean, Save
        y, sr = load_audio(tmp_path)
        y_clean = clean_audio_signal(y, sr)
        
        # Save back to temp
        sf.write(tmp_path, y_clean, sr)
        
        return send_file(
            tmp_path, 
            mimetype="audio/wav", 
            as_attachment=True, 
            download_name="cleaned_audio.wav"
        )

    except Exception as e:
        print(f"Cleaning error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        # send_file requires the file to exist when it returns.
        # We perform cleanup only if exception occurred or rely on OS temp cleaning.
        # ideally we'd use after_request to delete.
        pass

# ----------------------
# Voice Manipulation (Voice Lab / PSOLA)
# ----------------------

@voice_quality_bp.route('/api/voice-quality/manipulate', methods=['POST'])
def manipulate_file():
    """
    Endpoint to shift pitch and formants of an uploaded file.
    Proposed usage: "Goal Preview" - letting users hear themselves higher/brighter.
    """
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Security check
    is_valid, error_msg = validate_file_upload(file.filename, allowed_types=['audio'])
    if not is_valid:
        return jsonify({"error": error_msg}), 400
        
    # Parameters
    try:
        pitch_shift = float(request.form.get("pitch_shift", 0.0))  # semitones
        formant_shift = float(request.form.get("formant_shift", 1.0)) # ratio (e.g. 1.1)
    except ValueError:
        return jsonify({"error": "Invalid numerical parameters"}), 400
        
    tmp_path = None
    processed_path = None
    
    try:
        # Save temp
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
            file.save(tmp_path)
            
        # Load via Parselmouth
        import parselmouth
        from ..services.voicelab_service import manipulate_voice
        
        sound = parselmouth.Sound(tmp_path)
        manipulated = manipulate_voice(sound, pitch_shift, formant_shift)
        
        if manipulated is None:
             return jsonify({"error": "Manipulation failed"}), 500
             
        # Save output
        processed_path = tmp_path.replace(".wav", "_manipulated.wav")
        manipulated.save(processed_path, "WAV")
        
        return send_file(
            processed_path,
            mimetype="audio/wav",
            as_attachment=True,
            download_name="manipulated_voice.wav"
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Cleanup
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        # Note: We can't delete processed_path here because send_file needs it.
        # In production, use a background task or temp dir cleanup policy.

@voice_quality_bp.route('/api/voice-quality/goals', methods=['GET'])
def get_goals():
    return jsonify(GOAL_PRESETS)
