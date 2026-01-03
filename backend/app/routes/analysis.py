"""
Voice Analysis Route - Lightweight Version
Provides endpoints for analyzing recorded audio with voice metrics.
Uses librosa for analysis and faster-whisper for transcription (no compilation needed).
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import tempfile
from ..validators import validate_file_upload
from ..extensions import limiter
try:
    import numpy as np
    import librosa
    from scipy import signal
    from scipy.stats import skew, kurtosis
    from faster_whisper import WhisperModel
    _deps_available = True
except ImportError:
    _deps_available = False
    np = None
    librosa = None
    signal = None
    skew = None
    kurtosis = None
    WhisperModel = None

analysis_bp = Blueprint('analysis', __name__)

# Load Whisper model once at startup
whisper_model = None



def get_whisper_model():
    """Lazy load Faster Whisper model"""
    global whisper_model
    if WhisperModel is None:
        print("Faster Whisper not installed.")
        return None
        
    if whisper_model is None:
        print("Loading Faster Whisper model (base)...")
        # Use base model, runs on CPU efficiently
        whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    return whisper_model


def extract_pitch_librosa(y, sr):
    """Extract pitch using librosa's pyin algorithm"""
    try:
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y,
            fmin=librosa.note_to_hz('C2'),  # ~65 Hz
            fmax=librosa.note_to_hz('C6'),  # ~1047 Hz
            sr=sr
        )
        
        # Filter out unvoiced frames
        f0_voiced = f0[~np.isnan(f0)]
        
        if len(f0_voiced) > 0:
            return {
                'mean': float(np.mean(f0_voiced)),
                'min': float(np.min(f0_voiced)),
                'max': float(np.max(f0_voiced)),
                'std': float(np.std(f0_voiced)),
                'median': float(np.median(f0_voiced)),
                'contour': f0.tolist()  # Full contour for visualization
            }
        return None
    except Exception as e:
        print(f"Pitch extraction error: {e}")
        return None


def estimate_formants_lpc(y, sr, n_formants=3):
    """Estimate formants using Linear Predictive Coding"""
    try:
        # Pre-emphasis filter
        pre_emphasis = 0.97
        y_emphasized = np.append(y[0], y[1:] - pre_emphasis * y[:-1])
        
        # LPC analysis
        lpc_order = 2 + sr // 1000  # Rule of thumb: 2 + (sample_rate / 1000)
        a = librosa.lpc(y_emphasized, order=lpc_order)
        
        # Find roots of LPC polynomial
        roots = np.roots(a)
        roots = roots[np.imag(roots) >= 0]  # Keep only positive frequencies
        
        # Convert to frequencies
        angles = np.arctan2(np.imag(roots), np.real(roots))
        freqs = sorted(angles * (sr / (2 * np.pi)))
        
        # Extract first n_formants
        formants = {}
        for i in range(min(n_formants, len(freqs))):
            if freqs[i] > 0:  # Valid formant
                formants[f'f{i+1}'] = float(freqs[i])
        
        return formants if formants else {'f1': None, 'f2': None, 'f3': None}
        
    except Exception as e:
        print(f"Formant extraction error: {e}")
        return {'f1': None, 'f2': None, 'f3': None}


def calculate_jitter_shimmer(y, sr, f0_contour):
    """Estimate jitter and shimmer from pitch contour"""
    try:
        # Remove NaN values
        f0_valid = f0_contour[~np.isnan(f0_contour)]
        
        if len(f0_valid) < 3:
            return None, None
        
        # Jitter: period-to-period variation in pitch
        periods = 1.0 / f0_valid
        period_diffs = np.abs(np.diff(periods))
        jitter = (np.mean(period_diffs) / np.mean(periods)) * 100  # Percentage
        
        # Shimmer: amplitude variation
        # Use RMS energy in short frames as proxy
        frame_length = int(sr * 0.01)  # 10ms frames
        hop_length = frame_length // 2
        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        
        if len(rms) > 1:
            rms_diffs = np.abs(np.diff(rms))
            shimmer = (np.mean(rms_diffs) / np.mean(rms)) * 100  # Percentage
        else:
            shimmer = None
        
        return float(jitter), float(shimmer) if shimmer else None
        
    except Exception as e:
        print(f"Jitter/Shimmer calculation error: {e}")
        return None, None


def calculate_hnr(y, sr):
    """Estimate Harmonics-to-Noise Ratio"""
    try:
        # Autocorrelation method
        autocorr = librosa.autocorrelate(y)
        
        # Find first peak (fundamental period)
        peaks = signal.find_peaks(autocorr)[0]
        if len(peaks) == 0:
            return None
        
        # HNR approximation: ratio of autocorrelation peak to mean
        hnr_linear = autocorr[peaks[0]] / np.mean(np.abs(autocorr))
        hnr_db = 10 * np.log10(hnr_linear) if hnr_linear > 0 else None
        
        return float(hnr_db) if hnr_db else None
        
    except Exception as e:
        print(f"HNR calculation error: {e}")
        return None


def extract_voice_metrics(y, sr, start_time=None, end_time=None):
    """
    Extract voice metrics from audio segment using librosa.
    
    Args:
        y: Audio time series
        sr: Sample rate
        start_time: Optional start time for segment
        end_time: Optional end time for segment
    
    Returns:
        dict with pitch, formants, jitter, shimmer, HNR, intensity
    """
    # Extract segment if times provided
    if start_time is not None and end_time is not None:
        start_sample = int(start_time * sr)
        end_sample = int(end_time * sr)
        y = y[start_sample:end_sample]
    
    metrics = {}
    
    # Pitch analysis
    pitch_data = extract_pitch_librosa(y, sr)
    metrics['pitch'] = pitch_data
    
    # Formants
    metrics['formants'] = estimate_formants_lpc(y, sr)
    
    # Jitter and Shimmer
    if pitch_data and 'contour' in pitch_data:
        jitter, shimmer = calculate_jitter_shimmer(y, sr, np.array(pitch_data['contour']))
        metrics['jitter'] = jitter
        metrics['shimmer'] = shimmer
    else:
        metrics['jitter'] = None
        metrics['shimmer'] = None
    
    # HNR
    metrics['hnr'] = calculate_hnr(y, sr)
    
    # Intensity (RMS energy in dB)
    rms = librosa.feature.rms(y=y)[0]
    if len(rms) > 0:
        rms_db = librosa.amplitude_to_db(rms)
        metrics['intensity'] = {
            'mean': float(np.mean(rms_db)),
            'max': float(np.max(rms_db))
        }
    else:
        metrics['intensity'] = None
    
    # Spectral features (for voice quality)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    
    metrics['spectral'] = {
        'centroid': float(np.mean(spectral_centroid)),
        'rolloff': float(np.mean(spectral_rolloff))
    }
    
    return metrics


def transcribe_with_timing(audio_path):
    """
    Transcribe audio and get word-level timing using Faster Whisper.
    
    Args:
        audio_path: Path to audio file
    
    Returns:
        dict with 'text' and 'words' (list of {word, start, end})
    """
    model = get_whisper_model()
    
    # Transcribe with word timestamps
    segments, info = model.transcribe(audio_path, word_timestamps=True, language='en')
    
    # Extract word-level timing
    words = []
    full_text = []
    
    for segment in segments:
        full_text.append(segment.text)
        for word in segment.words:
            words.append({
                'text': word.word.strip(),
                'start': word.start,
                'end': word.end
            })
    
    return {
        'text': ' '.join(full_text),
        'words': words
    }


@analysis_bp.route('/api/analyze', methods=['POST'])
@limiter.limit("10 per minute")
def analyze_audio():
    """
    Analyze uploaded audio file and return comprehensive voice metrics.
    
    Expected: multipart/form-data with 'audio' file field
    Returns: JSON with transcript, word-level metrics, and overall statistics
    """

    if not _deps_available:
        return jsonify({'error': 'Analysis dependencies (numpy, librosa, etc.) not installed.'}), 503

    # Check if file was uploaded
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    # Security: Validate file type
    is_valid, error = validate_file_upload(file.filename, allowed_types=['audio'])
    if not is_valid:
        return jsonify({"error": error}), 400
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        temp_path = temp_file.name
        file.save(temp_path)
    
    try:
        # Load audio with librosa
        print("Loading audio...")
        y, sr = librosa.load(temp_path, sr=None)  # Keep original sample rate
        
        # Get overall metrics
        print("Extracting overall metrics...")
        overall_metrics = extract_voice_metrics(y, sr)
        
        # Transcribe and get word timing
        print("Transcribing audio...")
        transcription = transcribe_with_timing(temp_path)
        
        # Extract metrics for each word
        print("Analyzing word-level metrics...")
        words_with_metrics = []
        for word_info in transcription['words']:
            word_metrics = extract_voice_metrics(
                y, sr,
                start_time=word_info['start'],
                end_time=word_info['end']
            )
            
            words_with_metrics.append({
                'text': word_info['text'],
                'start': word_info['start'],
                'end': word_info['end'],
                'metrics': word_metrics
            })
        
        # Calculate speech rate
        duration = len(y) / sr
        word_count = len(transcription['words'])
        speech_rate = (word_count / duration) * 60 if duration > 0 else 0  # Words per minute
        
        # Prepare response
        response = {
            'transcript': transcription['text'],
            'words': words_with_metrics,
            'overall': overall_metrics,
            'duration': duration,
            'speechRate': speech_rate,
            'wordCount': word_count
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
        
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@analysis_bp.route('/api/analyze/status', methods=['GET'])
def analysis_status():
    """Health check endpoint"""
    return jsonify({
        'status': 'ready',
        'whisper_loaded': whisper_model is not None
    }), 200
