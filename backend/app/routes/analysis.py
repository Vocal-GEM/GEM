"""
Voice Analysis Route - Lightweight Version
Provides endpoints for analyzing recorded audio with voice metrics.
Uses librosa for analysis and faster-whisper for transcription (no compilation needed).
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import tempfile
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
    """Estimate formants using Linear Predictive Coding with validation"""
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

        # Convert to frequencies and calculate bandwidths
        angles = np.arctan2(np.imag(roots), np.real(roots))
        freqs = angles * (sr / (2 * np.pi))

        # Calculate bandwidth (related to distance from unit circle)
        bandwidths = -0.5 * (sr / (2 * np.pi)) * np.log(np.abs(roots))

        # Combine frequencies and bandwidths
        formant_candidates = list(zip(freqs, bandwidths))
        formant_candidates = [(f, bw) for f, bw in formant_candidates if f > 0]
        formant_candidates.sort(key=lambda x: x[0])  # Sort by frequency

        # Physiological formant ranges (Hz) based on speech research
        # These ranges accommodate both male and female voices
        formant_ranges = {
            'f1': (200, 1200),    # F1: jaw height
            'f2': (600, 3500),    # F2: tongue frontness/backness
            'f3': (1400, 4500),   # F3: lip rounding
        }

        # Maximum reasonable bandwidth (Hz)
        max_bandwidth = 500

        # Validate and assign formants
        formants = {'f1': None, 'f2': None, 'f3': None}

        for i in range(1, n_formants + 1):
            formant_key = f'f{i}'
            min_freq, max_freq = formant_ranges.get(formant_key, (0, 10000))

            # Find first candidate in valid range with reasonable bandwidth
            for freq, bw in formant_candidates:
                # Check if frequency is in expected range
                if min_freq <= freq <= max_freq:
                    # Check bandwidth constraint
                    if bw < max_bandwidth:
                        # Check it's not too close to already assigned formants
                        too_close = False
                        for assigned_f in formants.values():
                            if assigned_f and abs(freq - assigned_f) < 200:
                                too_close = True
                                break

                        if not too_close:
                            formants[formant_key] = float(freq)
                            # Remove this candidate to avoid reusing
                            formant_candidates = [(f, b) for f, b in formant_candidates if f != freq]
                            break

        return formants

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
    """Estimate Harmonics-to-Noise Ratio with pitch-based lag validation"""
    try:
        # Autocorrelation method
        autocorr = librosa.autocorrelate(y)

        # Define lag range based on expected pitch (75-600 Hz)
        min_lag = int(sr / 600)  # Highest pitch = shortest period
        max_lag = int(sr / 75)   # Lowest pitch = longest period

        # Ensure we stay within autocorrelation bounds
        max_lag = min(max_lag, len(autocorr) - 1)

        if min_lag >= max_lag:
            return None

        # Search for peak within valid lag range
        search_region = autocorr[min_lag:max_lag]
        if len(search_region) == 0:
            return None

        peak_idx = np.argmax(search_region) + min_lag

        # HNR calculation
        # Signal power = autocorr at lag 0
        # Periodic power = autocorr at fundamental period
        # Noise power = signal power - periodic power
        signal_power = autocorr[0]
        periodic_power = autocorr[peak_idx]

        if signal_power <= 0 or periodic_power <= 0:
            return None

        # HNR = 10 * log10(periodic / noise)
        # where noise = signal - periodic
        noise_power = signal_power - periodic_power

        if noise_power <= 0:
            # Very clean signal, return high HNR
            return 30.0

        hnr_db = 10 * np.log10(periodic_power / noise_power)

        # Clamp to reasonable range (typical HNR: 0-30 dB)
        hnr_db = np.clip(hnr_db, 0, 30)

        return float(hnr_db)

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

    # Check file size (max 50MB)
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

    if file_size > MAX_FILE_SIZE:
        return jsonify({
            'error': f'File too large ({file_size / (1024*1024):.1f}MB). Maximum size is {MAX_FILE_SIZE / (1024*1024):.0f}MB.'
        }), 400

    # Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        temp_path = temp_file.name
        file.save(temp_path)
    
    try:
        # Load audio with librosa
        print("Loading audio...")
        y, sr = librosa.load(temp_path, sr=None)  # Keep original sample rate

        # Validate audio duration
        duration = len(y) / sr
        MIN_DURATION = 0.5  # seconds
        MAX_DURATION = 300  # 5 minutes

        if duration < MIN_DURATION:
            return jsonify({
                'error': f'Audio too short ({duration:.1f}s). Minimum duration is {MIN_DURATION}s for reliable analysis.'
            }), 400

        if duration > MAX_DURATION:
            return jsonify({
                'error': f'Audio too long ({duration:.1f}s). Maximum duration is {MAX_DURATION}s ({MAX_DURATION/60:.0f} minutes).'
            }), 400

        # Check for silence
        rms_energy = np.sqrt(np.mean(y**2))
        if rms_energy < 0.001:
            return jsonify({
                'error': 'Audio appears to be silent or too quiet. Please check your microphone and try again.'
            }), 400

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
