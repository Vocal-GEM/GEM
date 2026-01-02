try:
    import numpy as np
    import parselmouth
    from parselmouth.praat import call
    import soundfile as sf
    import scipy.signal
    from numpy.lib.stride_tricks import sliding_window_view
    _deps_available = True
except ImportError:
    _deps_available = False
    np = None
    parselmouth = None
    call = None
    sf = None
    scipy = None
    sliding_window_view = None

# VoiceLab-inspired advanced analysis
try:
    from app.services.voicelab_service import estimate_vtl, compute_perturbation_pca, measure_ltas, measure_speech_rate, run_voicelab_analysis
    _voicelab_available = True
except ImportError:
    _voicelab_available = False
    estimate_vtl = None
    compute_perturbation_pca = None
    measure_ltas = None
    measure_speech_rate = None
    run_voicelab_analysis = None

# ----------------------
# Goal presets
# ----------------------

GOAL_PRESETS = {
    "transfem_soft_slightly_breathy": {
        "label": "Transfeminine – soft, slightly breathy",
        "breathiness_target_grbas": 1,  # GRBAS Score 1 = "Sweet Spot" per research
        "breathiness_range": (25, 50),  # Composite score range for GRBAS 1
        "roughness_range": (0, 30),
        "strain_range": (0, 40),
        "cpp_range": (3.0, 8.0),
        "hnr_min": 10.0,
        "rbi_range": (55, 75), # Soft bright
    },
    "clean_smooth": {
        "label": "Clean, smooth",
        "breathiness_target_grbas": 0,  # Modal/clear voice
        "breathiness_range": (0, 25),   # Target GRBAS 0
        "roughness_range": (0, 30),
        "strain_range": (0, 40),
        "cpp_range": (3.5, 10.0),
        "hnr_min": 12.0,
        "rbi_range": (45, 65), # Neutral to slightly bright
    },
    "light_and_bright": {
        "label": "Light and bright",
        "breathiness_target_grbas": 1,  # Light breathiness acceptable
        "breathiness_range": (20, 45),  # Lower end of GRBAS 1
        "roughness_range": (0, 30),
        "strain_range": (20, 60),
        "cpp_range": (4.0, 10.0),
        "hnr_min": 12.0,
        "rbi_range": (65, 85), # Bright target
    },
    "transfem_bright_forward": {
        "label": "Transfeminine – Bright & Forward",
        "breathiness_target_grbas": 1,  # GRBAS Score 1 = "Sweet Spot"
        "breathiness_range": (25, 50),  # Composite score range for GRBAS 1
        "roughness_range": (0, 30),
        "strain_range": (10, 50),
        "cpp_range": (3.5, 9.0),
        "hnr_min": 11.0,
        "rbi_range": (60, 80), # The "Sweet Spot"
    },
    "androgynous_neutral": {
        "label": "Androgynous / Neutral",
        "breathiness_target_grbas": 0,  # More modal voice
        "breathiness_range": (0, 35),   # Mostly clear with slight breathiness OK
        "roughness_range": (0, 30),
        "strain_range": (10, 50),
        "cpp_range": (4.0, 9.0),
        "hnr_min": 12.0,
        "rbi_range": (40, 60),
    },
    "soft_light_resonance": {
        "label": "Soft Light Resonance",
        "breathiness_target_grbas": 1,  # GRBAS Score 1 = "Sweet Spot"
        "breathiness_range": (30, 55),  # Moderate GRBAS 1 range
        "roughness_range": (0, 30),
        "strain_range": (0, 30),
        "cpp_range": (3.0, 8.0),
        "hnr_min": 10.0,
        "rbi_range": (50, 70),
    }
}

def load_audio(path, target_sr=16000):
    """
    Load audio, convert to mono, and resample to 16kHz for RBI analysis.
    """
    y, sr = sf.read(path)
    if y.ndim > 1:
        y = np.mean(y, axis=1)
    
    if sr != target_sr:
        number_of_samples = int(round(len(y) * float(target_sr) / sr))
        y = scipy.signal.resample(y, number_of_samples)
        sr = target_sr
        
    # Simple normalization
    y = y / (np.max(np.abs(y)) + 1e-9)
    return y, sr

def pre_emphasis(y, coeff=0.97):
    return np.append(y[0], y[1:] - coeff * y[:-1])

def compute_raw_rbi_features(frame, sr, f0):
    """
    Compute raw spectral features for RBI: ratio_HL, centroid, tilt_flipped.
    """
    # FFT
    window = np.hanning(len(frame))
    spectrum = np.fft.rfft(frame * window)
    mag_sq = np.abs(spectrum) ** 2
    freqs = np.fft.rfftfreq(len(frame), 1/sr)
    
    # 1. HF/LF Ratio
    # LF: 0-1.5k, HF: 3-6k
    lf_mask = (freqs >= 0) & (freqs < 1500)
    hf_mask = (freqs >= 3000) & (freqs < 6000)
    
    e_lf = np.sum(mag_sq[lf_mask])
    e_hf = np.sum(mag_sq[hf_mask])
    
    ratio_hl = np.log10((e_hf + 1e-12) / (e_lf + 1e-12))
    
    # 2. Centroid
    total_energy = np.sum(mag_sq) + 1e-12
    centroid = np.sum(freqs * mag_sq) / total_energy
    
    # 3. Tilt (Slope of log mag in 300-4000 Hz)
    band_mask = (freqs >= 300) & (freqs <= 4000)
    if np.sum(band_mask) > 1:
        f_band = freqs[band_mask]
        y_band = 20 * np.log10(mag_sq[band_mask] + 1e-12) # Power to dB
        # Linear regression y = ax + b
        A = np.vstack([f_band, np.ones_like(f_band)]).T
        slope, _ = np.linalg.lstsq(A, y_band, rcond=None)[0]
        tilt = slope
    else:
        tilt = 0.0
        
    tilt_flipped = -tilt # Higher = Brighter
    
    return ratio_hl, centroid, tilt_flipped

def clean_audio_signal(y, sr):
    """
    Apply bandpass filter and normalization to clean the audio signal.
    """
    if scipy is None: return y
    
    # 1. Bandpass Filter (80Hz - 8000Hz)
    # Removes low rumble and high frequency hiss/aliasing
    nyquist = 0.5 * sr
    low = 80 / nyquist
    high = min(8000 / nyquist, 0.99) # Ensure high is < 1
    
    b, a = scipy.signal.butter(4, [low, high], btype='band')
    y_clean = scipy.signal.filtfilt(b, a, y)
    
    # 2. Noise Gate-ish (Simple silence suppression)
    # (Optional, skipping for now to avoid artifacts)
    
    # 3. Peak Normalization (-1 dB)
    max_val = np.max(np.abs(y_clean))
    if max_val > 0:
        y_clean = y_clean / max_val * 0.89  # approx -1dB
        
    return y_clean

def compute_cpp_praat(sound):
    if not isinstance(sound, parselmouth.Sound):
        sound = parselmouth.Sound(sound)
    pcg = call(sound, "To PowerCepstrogram", 75, 600, 0.0001, 0.02, 50)
    cpp = call(pcg, "Get peak prominence", 0, 0, 60)
    return cpp

def compute_hnr(sound):
    if not isinstance(sound, parselmouth.Sound):
        sound = parselmouth.Sound(sound)
    harmonicity = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
    hnr = call(harmonicity, "Get mean", 0, 0)
    return hnr

def compute_jitter_shimmer(sound):
    if not isinstance(sound, parselmouth.Sound):
        sound = parselmouth.Sound(sound)
    pitch_floor = 75
    pitch_ceiling = 600
    point_proc = call(sound, "To PointProcess (periodic, cc)", pitch_floor, pitch_ceiling)
    jitter_local = call(point_proc, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3) * 100
    shimmer_local = call([sound, point_proc], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6) * 100
    return jitter_local, shimmer_local

def compute_f0_stats(sound):
    pitch = sound.to_pitch(pitch_floor=75, pitch_ceiling=600)
    f0_values = pitch.selected_array['frequency']
    f0_values = f0_values[f0_values > 0]
    if len(f0_values) == 0:
        return None, None
    return float(np.mean(f0_values)), float(np.max(f0_values) - np.min(f0_values))

def compute_spectral_tilt_h1_h2(y, sr, f0_estimate=None):
    # Kept for backward compatibility / extra metrics, but RBI uses its own tilt
    mid = len(y) // 2
    window_len = int(0.04 * sr)
    start = max(0, mid - window_len // 2)
    frame = y[start:start + window_len]
    if len(frame) == 0: return 0.0
    spectrum = np.fft.rfft(frame * np.hanning(len(frame)))
    freqs = np.fft.rfftfreq(len(frame), 1 / sr)
    mag_db = 20 * np.log10(np.abs(spectrum) + 1e-9)
    if f0_estimate is None:
        peak_idx = np.argmax(mag_db)
        f0_estimate = freqs[peak_idx]
        if f0_estimate < 75: f0_estimate = 150
    def peak_at(freq_target):
        idx = np.argmin(np.abs(freqs - freq_target))
        return mag_db[idx]
    h1 = peak_at(f0_estimate)
    h2 = peak_at(2 * f0_estimate)
    return h1 - h2

# ----------------------
# F3-Region Breathiness Analysis (Research-Based)
# Based on "Breathiness as a Feminine Voice Characteristic: A Perceptual Approach"
# ----------------------

# GRBAS Breathiness Scale (research-aligned)
# Score 1 (Slight) is the "Sweet Spot" for femininity enhancement
BREATHINESS_ZONES = {
    0: {"label": "Modal/Clear", "feedback": "Clear Voice", "color": "grey", "description": "No audible friction; clear voice"},
    1: {"label": "Slight", "feedback": "Soft/Feminine Cue ✓", "color": "green", "description": "Mild audible friction - THE TARGET"},
    2: {"label": "Moderate", "feedback": "Very Breathy", "color": "yellow", "description": "Noticeable air escape"},
    3: {"label": "Severe", "feedback": "Excessive/Strained ⚠", "color": "red", "description": "Heavy air escape, turbulent noise"}
}

def compute_f3_noise_ratio(y, sr, f0_estimate=None):
    """
    Compute the noise-to-harmonics ratio in the F3 region (2300-3500 Hz).
    Returns a ratio where higher values = more breathiness.
    
    Based on research showing breathiness manifests as aspiration noise
    in the F3 spectral region for female voices.
    
    Args:
        y: Audio signal (numpy array)
        sr: Sample rate
        f0_estimate: Optional F0 estimate (not used for pitch independence)
    
    Returns:
        float: F3 noise ratio (log scale, typical range -2.0 to +1.0)
    """
    # Use middle section of audio for stability
    mid = len(y) // 2
    window_len = min(int(0.1 * sr), len(y))  # 100ms window
    start = max(0, mid - window_len // 2)
    frame = y[start:start + window_len]
    
    if len(frame) < 256:
        return 0.0
    
    # FFT analysis with Hanning window
    window = np.hanning(len(frame))
    spectrum = np.fft.rfft(frame * window)
    freqs = np.fft.rfftfreq(len(frame), 1/sr)
    mag_sq = np.abs(spectrum) ** 2
    
    # F3 band: 2300-3500 Hz (female F3 range per research)
    f3_mask = (freqs >= 2300) & (freqs <= 3500)
    
    # Harmonic band (fundamental region): 100-1000 Hz
    harmonic_mask = (freqs >= 100) & (freqs <= 1000)
    
    e_f3 = np.sum(mag_sq[f3_mask])
    e_harmonic = np.sum(mag_sq[harmonic_mask])
    
    # Noise ratio: higher = more aperiodic energy in F3 relative to harmonics
    f3_noise_ratio = np.log10((e_f3 + 1e-12) / (e_harmonic + 1e-12))
    
    return float(f3_noise_ratio)

def classify_breathiness_grbas(f3_noise_ratio, hnr, cpp, h1_h2):
    """
    Classify breathiness using GRBAS-aligned 4-level scale.
    Returns score 0-3 and zone metadata.
    
    The algorithm is PITCH-INDEPENDENT - we do not factor in F0.
    Per research, Score 1 (Slight) is the optimal target for femininity.
    
    Args:
        f3_noise_ratio: F3 region noise ratio (primary indicator)
        hnr: Harmonics-to-Noise Ratio in dB
        cpp: Cepstral Peak Prominence in dB
        h1_h2: H1-H2 spectral tilt in dB
    
    Returns:
        dict: Classification results with grbas_score, feedback, etc.
    """
    # Normalize F3 noise ratio to 0-100 scale
    # Typical range: -2.0 (very clear) to +1.0 (very breathy)
    f3_normalized = np.clip((f3_noise_ratio + 2.0) / 3.0 * 100, 0, 100)
    
    # HNR contribution (lower HNR = more noise = more breathy)
    # Typical range: 5-25 dB
    hnr_score = np.clip((25 - hnr) / 20 * 100, 0, 100) if hnr is not None else 50
    
    # CPP contribution (lower CPP = less periodic = more breathy)
    # Typical range: 2-10 dB
    cpp_score = np.clip((10 - cpp) / 8 * 100, 0, 100) if cpp is not None else 50
    
    # H1-H2 contribution (higher = more breathy)
    # Typical range: -5 to +15 dB
    h1h2_score = np.clip((h1_h2 + 5) / 20 * 100, 0, 100) if h1_h2 is not None else 50
    
    # Weighted composite (F3 noise is primary per research)
    composite = (
        0.40 * f3_normalized +  # Primary: F3 region noise
        0.25 * hnr_score +      # Supporting: overall harmonicity
        0.20 * cpp_score +      # Supporting: periodicity strength
        0.15 * h1h2_score       # Supporting: spectral tilt
    )
    
    # Map to GRBAS 0-3 scale
    if composite < 25:
        grbas_score = 0  # Modal/Clear
    elif composite < 50:
        grbas_score = 1  # Slight - THE TARGET
    elif composite < 75:
        grbas_score = 2  # Moderate
    else:
        grbas_score = 3  # Severe
    
    zone = BREATHINESS_ZONES[grbas_score]
    is_sweet_spot = (grbas_score == 1)
    
    return {
        "grbas_score": int(grbas_score),
        "composite_score": float(composite),
        "zone_label": zone["label"],
        "feedback": zone["feedback"],
        "zone_color": zone["color"],
        "zone_description": zone["description"],
        "is_sweet_spot": is_sweet_spot,
        "is_excessive": grbas_score >= 2,
        "components": {
            "f3_noise": float(f3_normalized),
            "hnr_contribution": float(hnr_score),
            "cpp_contribution": float(cpp_score),
            "h1h2_contribution": float(h1h2_score)
        }
    }

# ----------------------
# Ventricular (False Vocal Fold) Engagement Detection
# Based on acoustic correlates of ventricular phonation
# ----------------------

VENTRICULAR_THRESHOLDS = {
    "jitter_high": 2.0,      # % - elevated jitter suggests irregular vibration
    "shimmer_high": 5.0,     # % - elevated shimmer suggests amplitude irregularity  
    "hnr_low": 10.0,         # dB - low HNR indicates noise from irregular closure
    "roughness_high": 60,    # score - high roughness correlates with ventricular activity
    "strain_combined": 70    # combined score threshold for "likely" detection
}

def compute_ventricular_engagement(jitter, shimmer, hnr, h1_h2, strain_score=None, roughness_score=None):
    """
    Detect potential false vocal fold (ventricular) activation.
    
    False vocal fold engagement causes:
    - Increased jitter/shimmer (irregular vibration patterns)
    - Decreased HNR (more noise from aperiodic closure)
    - Rough, strained voice quality
    - Often co-occurs with pressed phonation
    
    NOTE: This is an ESTIMATE based on acoustic correlates.
    True ventricular phonation diagnosis requires laryngoscopy.
    
    Args:
        jitter: Jitter percentage
        shimmer: Shimmer percentage
        hnr: Harmonics-to-Noise Ratio in dB
        h1_h2: H1-H2 spectral tilt in dB
        strain_score: Optional pre-computed strain score (0-100)
        roughness_score: Optional pre-computed roughness score (0-100)
    
    Returns:
        dict: Detection result with is_detected, confidence, severity, feedback
    """
    # Calculate component scores (0-1 scale)
    scores = []
    
    # Jitter contribution (high jitter = more likely ventricular)
    if jitter is not None:
        jitter_score = np.clip(jitter / VENTRICULAR_THRESHOLDS["jitter_high"], 0, 1.5)
        scores.append(("jitter", jitter_score))
    
    # Shimmer contribution (high shimmer = more likely)
    if shimmer is not None:
        shimmer_score = np.clip(shimmer / VENTRICULAR_THRESHOLDS["shimmer_high"], 0, 1.5)
        scores.append(("shimmer", shimmer_score))
    
    # HNR contribution (low HNR = more likely)
    if hnr is not None:
        hnr_score = np.clip((VENTRICULAR_THRESHOLDS["hnr_low"] - hnr) / 10, 0, 1.5)
        scores.append(("hnr", hnr_score))
    
    # Pressed phonation indicator (negative H1-H2 = pressed)
    if h1_h2 is not None:
        pressed_score = np.clip(-h1_h2 / 6, 0, 1.0)  # h1_h2 < -6 = strongly pressed
        scores.append(("pressed", pressed_score))
    
    # Pre-computed scores if available
    if roughness_score is not None:
        roughness_norm = roughness_score / 100.0
        scores.append(("roughness", roughness_norm))
    
    if strain_score is not None:
        strain_norm = strain_score / 100.0
        scores.append(("strain", strain_norm))
    
    if not scores:
        return {
            "is_detected": False,
            "confidence": 0.0,
            "severity": "none",
            "feedback": "Insufficient data for analysis"
        }
    
    # Weighted composite score
    # Jitter+Shimmer are primary indicators, HNR and pressed are secondary
    weights = {
        "jitter": 0.25,
        "shimmer": 0.25,
        "hnr": 0.20,
        "pressed": 0.15,
        "roughness": 0.10,
        "strain": 0.05
    }
    
    total_weight = sum(weights.get(name, 0.1) for name, _ in scores)
    composite = sum(weights.get(name, 0.1) * score for name, score in scores) / total_weight
    
    # Determine severity and detection
    if composite < 0.4:
        severity = "none"
        is_detected = False
        feedback = "Normal vocal fold function"
    elif composite < 0.6:
        severity = "possible"
        is_detected = True
        feedback = "Possible strain detected - try relaxing your throat"
    else:
        severity = "likely"
        is_detected = True
        feedback = "Constriction detected ⚠ - pause and reset with SOVT exercise"
    
    # Confidence is higher when we have more metrics and they agree
    confidence = min(0.9, len(scores) / 6 + composite * 0.3)
    
    return {
        "is_detected": is_detected,
        "confidence": float(np.clip(confidence, 0, 1)),
        "severity": severity,
        "composite_score": float(composite * 100),
        "feedback": feedback,
        "components": {name: float(score) for name, score in scores}
    }

# ----------------------
# Open Quotient (OQ) Estimation
# Based on acoustic correlates of glottal behavior
# ----------------------

OQ_ZONES = {
    "low": {"label": "Low OQ", "range": (0, 35), "feedback": "Pressed closure - try lighter phonation", "color": "amber"},
    "balanced": {"label": "Balanced OQ", "range": (35, 65), "feedback": "Good balance ✓", "color": "green"},
    "high": {"label": "High OQ", "range": (65, 100), "feedback": "Breathy closure - may cause fatigue", "color": "cyan"}
}

def estimate_open_quotient(h1_h2, spectral_tilt=None, cpp=None, hnr=None):
    """
    Estimate Open Quotient from acoustic correlates.
    
    OQ = percentage of time vocal folds are open during each glottal cycle.
    True OQ measurement requires EGG or high-speed imaging.
    
    Acoustic correlates:
    - H1-H2: Higher values correlate with higher OQ (more breathy)
    - Spectral tilt: Steeper (more negative) = higher OQ
    - CPP: Lower CPP often indicates higher OQ
    
    Research basis: H1-H2 is the primary acoustic correlate of OQ,
    with typical ranges:
    - Low OQ (pressed): H1-H2 < 0 dB
    - Balanced OQ: H1-H2 0-6 dB  
    - High OQ (breathy): H1-H2 > 6 dB
    
    Args:
        h1_h2: H1-H2 spectral tilt in dB (primary indicator)
        spectral_tilt: Spectral tilt slope in dB/octave (secondary)
        cpp: Cepstral Peak Prominence in dB (tertiary)
        hnr: Harmonics-to-Noise Ratio in dB (supporting)
    
    Returns:
        dict: OQ estimate with oq_percent, zone, confidence, feedback
    """
    components = {}
    weights = []
    
    # Primary: H1-H2 (strongest correlation with OQ)
    # Map H1-H2 from typical range (-6 to +12 dB) to OQ (20% to 80%)
    if h1_h2 is not None:
        # H1-H2 of -6 dB → ~20% OQ, +12 dB → ~80% OQ
        oq_from_h1h2 = np.clip((h1_h2 + 6) / 18 * 60 + 20, 15, 85)
        components["h1_h2"] = float(oq_from_h1h2)
        weights.append((oq_from_h1h2, 0.50))
    
    # Secondary: Spectral tilt slope
    # Steeper tilt (more negative, like -12 dB/oct) = higher OQ
    # Flatter tilt (like -3 dB/oct) = lower OQ
    if spectral_tilt is not None:
        # Typical range: -15 to 0 dB/octave
        # Map so -15 → 80% OQ, 0 → 30% OQ
        oq_from_tilt = np.clip(80 - (spectral_tilt + 15) * 3.33, 20, 80)
        components["spectral_tilt"] = float(oq_from_tilt)
        weights.append((oq_from_tilt, 0.25))
    
    # Tertiary: CPP (lower CPP = less periodic = higher OQ/more breathy)
    if cpp is not None:
        # CPP range: 2-12 dB typically
        # Lower CPP → higher OQ
        oq_from_cpp = np.clip(80 - (cpp - 2) * 6, 25, 75)
        components["cpp"] = float(oq_from_cpp)
        weights.append((oq_from_cpp, 0.15))
    
    # Supporting: HNR (lower HNR can indicate higher OQ, but also pathology)
    if hnr is not None:
        # HNR range: 5-25 dB typically
        # Lower HNR → potentially higher OQ (but this is less reliable)
        oq_from_hnr = np.clip(70 - (hnr - 5) * 2, 30, 70)
        components["hnr"] = float(oq_from_hnr)
        weights.append((oq_from_hnr, 0.10))
    
    if not weights:
        return {
            "oq_percent": 50.0,
            "zone": "balanced",
            "zone_label": OQ_ZONES["balanced"]["label"],
            "zone_color": OQ_ZONES["balanced"]["color"],
            "confidence": 0.0,
            "feedback": "Insufficient data for OQ estimation"
        }
    
    # Weighted average
    total_weight = sum(w for _, w in weights)
    oq_percent = sum(val * w for val, w in weights) / total_weight
    oq_percent = float(np.clip(oq_percent, 0, 100))
    
    # Determine zone
    if oq_percent < 35:
        zone = "low"
    elif oq_percent < 65:
        zone = "balanced"
    else:
        zone = "high"
    
    zone_info = OQ_ZONES[zone]
    
    # Confidence based on number of metrics and their agreement
    if len(weights) >= 2:
        values = [v for v, _ in weights]
        std_dev = np.std(values)
        # Lower std dev = higher agreement = higher confidence
        confidence = np.clip(0.9 - std_dev / 50, 0.4, 0.9)
    else:
        confidence = 0.5
    
    return {
        "oq_percent": oq_percent,
        "zone": zone,
        "zone_label": zone_info["label"],
        "zone_color": zone_info["color"],
        "feedback": zone_info["feedback"],
        "confidence": float(confidence),
        "components": components
    }

def trim_for_sustained_vowel_analysis(y, sr, target_duration=1.5, offset_trim=0.75):
    """
    Per research protocol: Use mid-section of sustained vowel recording.
    Discards onset (0.75s) and offset (0.75s) to avoid attack/decay artifacts.
    Returns the stable middle portion.
    
    Args:
        y: Audio signal
        sr: Sample rate
        target_duration: Target duration in seconds (default 1.5s per research)
        offset_trim: Amount to trim from start/end in seconds
    
    Returns:
        numpy array: Trimmed audio signal
    """
    total_duration = len(y) / sr
    
    # Need at least 2.5 seconds for proper analysis per research protocol
    if total_duration < 2.5:
        # For shorter recordings, just trim 0.25s from each end
        start_samples = int(0.25 * sr)
        end_samples = int(0.25 * sr)
        if len(y) > start_samples + end_samples:
            return y[start_samples:-end_samples] if end_samples > 0 else y[start_samples:]
        return y
    
    # Trim onset and offset
    start_samples = int(offset_trim * sr)
    end_samples = len(y) - int(offset_trim * sr)
    
    # Take middle section up to target duration
    mid_section = y[start_samples:end_samples]
    target_samples = int(target_duration * sr)
    
    if len(mid_section) > target_samples:
        # Center the extraction
        excess = len(mid_section) - target_samples
        start = excess // 2
        mid_section = mid_section[start:start + target_samples]
    
    return mid_section

# ----------------------
# Flow Phonation Analysis (Research-Based)
# Based on "Applying Flow Phonation in Voice Care for Transgender Women"
# ----------------------

# Phonation States - 4 zones from research
# Flow is the "Goldilocks zone" - optimal for healthy voice modification
PHONATION_STATES = {
    "breathy": {
        "label": "Breathy",
        "feedback": "Too Loose - reduce airflow",
        "color": "blue",
        "zone": "A",
        "spectral_tilt_min": 8.0,    # Steep tilt = high airflow
        "description": "Incomplete vocal fold closure, high airflow"
    },
    "flow": {
        "label": "Flow",
        "feedback": "Optimal ✓ - efficient 'touch' closure",
        "color": "green",
        "zone": "C",
        "spectral_tilt_min": 3.0,
        "spectral_tilt_max": 8.0,    # Balanced tilt
        "description": "Light touch closure, efficient phonation - THE TARGET"
    },
    "neutral": {
        "label": "Neutral",
        "feedback": "Baseline - typical speech",
        "color": "slate",
        "zone": "B",
        "spectral_tilt_min": -2.0,
        "spectral_tilt_max": 3.0,    # Near-complete closure
        "description": "Complete or near-complete closure, conversational"
    },
    "pressed": {
        "label": "Pressed",
        "feedback": "Strain ⚠ - relax and reset",
        "color": "red",
        "zone": "A",
        "spectral_tilt_max": -2.0,   # Shallow tilt = forced closure
        "description": "Forced closure with tension, risk of vocal fatigue"
    }
}

# Onset types for attack detection
ONSET_TYPES = {
    "hard_attack": {
        "label": "Hard Attack",
        "feedback": "Glottal attack detected - try softer onset",
        "is_target": False
    },
    "breathy_onset": {
        "label": "Breathy Onset",
        "feedback": "Air before sound - coordinate better",
        "is_target": False
    },
    "coordinated": {
        "label": "Coordinated",
        "feedback": "Easy onset ✓ - simultaneous air and sound",
        "is_target": True
    }
}

def compute_spectral_tilt_slope(y, sr, freq_low=300, freq_high=4000):
    """
    Compute full spectral tilt (slope of energy fall-off in dB/octave).
    
    This is the primary proxy for glottal airflow since smartphones
    lack airflow masks. Per research:
    - Pressed: Shallow/negative slope (more HF energy from sharp closure)
    - Flow: Medium slope (balanced)
    - Breathy: Steep positive slope + HF noise
    
    Args:
        y: Audio signal
        sr: Sample rate
        freq_low: Low frequency bound (Hz)
        freq_high: High frequency bound (Hz)
    
    Returns:
        float: Spectral tilt slope in dB/octave
    """
    # Use middle section for stability
    mid = len(y) // 2
    window_len = min(int(0.1 * sr), len(y))
    start = max(0, mid - window_len // 2)
    frame = y[start:start + window_len]
    
    if len(frame) < 256:
        return 0.0
    
    # FFT analysis
    window = np.hanning(len(frame))
    spectrum = np.fft.rfft(frame * window)
    freqs = np.fft.rfftfreq(len(frame), 1/sr)
    mag_db = 20 * np.log10(np.abs(spectrum) + 1e-12)
    
    # Filter to frequency range
    mask = (freqs >= freq_low) & (freqs <= freq_high)
    if np.sum(mask) < 10:
        return 0.0
    
    f_band = freqs[mask]
    m_band = mag_db[mask]
    
    # Convert to log frequency for dB/octave calculation
    log_freq = np.log2(f_band + 1e-12)
    
    # Linear regression: dB = slope * log2(freq) + intercept
    A = np.vstack([log_freq, np.ones_like(log_freq)]).T
    try:
        slope, _ = np.linalg.lstsq(A, m_band, rcond=None)[0]
    except:
        slope = 0.0
    
    return float(slope)

def detect_onset_type(y, sr, window_ms=100):
    """
    Analyze first 50-100ms of phonation to classify onset type.
    
    Per research:
    - Hard Attack: Rapid amplitude spike (glottal attack) - AVOID
    - Breathy Onset: Air before sound (gradual rise with noise)
    - Coordinated: Simultaneous air and sound - TARGET
    
    Args:
        y: Audio signal
        sr: Sample rate
        window_ms: Analysis window in milliseconds
    
    Returns:
        dict: Onset classification with type, confidence, and spike_rate
    """
    window_samples = int(window_ms / 1000 * sr)
    onset_window = y[:min(window_samples, len(y))]
    
    if len(onset_window) < 50:
        return {"type": "unknown", "confidence": 0.0}
    
    # Compute amplitude envelope
    envelope = np.abs(onset_window)
    
    # Smooth envelope
    kernel_size = min(int(0.005 * sr), len(envelope) // 4)  # 5ms smoothing
    if kernel_size > 0:
        kernel = np.ones(kernel_size) / kernel_size
        envelope = np.convolve(envelope, kernel, mode='same')
    
    # Find peak in onset window
    peak_idx = np.argmax(envelope)
    peak_val = envelope[peak_idx]
    
    # Calculate rise time (time to reach 90% of peak)
    threshold = peak_val * 0.9
    rise_indices = np.where(envelope >= threshold)[0]
    rise_time_samples = rise_indices[0] if len(rise_indices) > 0 else len(envelope)
    rise_time_ms = rise_time_samples / sr * 1000
    
    # Calculate spike rate (derivative of envelope)
    if len(envelope) > 1:
        diff = np.diff(envelope)
        max_spike_rate = np.max(diff) * sr  # Amplitude/second
    else:
        max_spike_rate = 0.0
    
    # Classify onset
    onset_type = "coordinated"
    confidence = 0.7
    
    # Hard attack: Very fast rise (<10ms to peak) with high spike rate
    if rise_time_ms < 10 and max_spike_rate > peak_val * 50:
        onset_type = "hard_attack"
        confidence = min(0.9, max_spike_rate / (peak_val * 100 + 1e-12))
    
    # Breathy onset: Slow rise (>30ms) with low initial amplitude
    elif rise_time_ms > 30:
        # Check if there's noise before the tone
        initial_rms = np.sqrt(np.mean(onset_window[:int(0.02 * sr)]**2))
        peak_rms = peak_val
        if initial_rms > 0.1 * peak_rms:  # Significant air before sound
            onset_type = "breathy_onset"
            confidence = 0.6 + 0.3 * (initial_rms / (peak_rms + 1e-12))
    
    # Coordinated: Medium rise (10-30ms) with smooth envelope
    else:
        onset_type = "coordinated"
        confidence = 0.8 - abs(rise_time_ms - 20) / 40  # Peak confidence at 20ms
    
    onset_info = ONSET_TYPES.get(onset_type, ONSET_TYPES["coordinated"])
    
    return {
        "type": onset_type,
        "label": onset_info["label"],
        "feedback": onset_info["feedback"],
        "is_target": onset_info["is_target"],
        "confidence": float(np.clip(confidence, 0.0, 1.0)),
        "rise_time_ms": float(rise_time_ms),
        "spike_rate": float(max_spike_rate)
    }

def validate_u_vowel(y, sr, f1_target=300, f2_target=800, tolerance=0.25):
    """
    Validate that input is /u/ vowel for flow phonation calibration.
    Target formants: F1 ~300Hz, F2 ~800Hz
    
    The /u/ vowel creates natural semi-occlusion with low intraoral pressure,
    making it ideal for flow phonation training.
    
    Args:
        y: Audio signal
        sr: Sample rate
        f1_target: Target F1 frequency (Hz)
        f2_target: Target F2 frequency (Hz)
        tolerance: Acceptable deviation as fraction (e.g., 0.25 = ±25%)
    
    Returns:
        dict: Validation result with is_valid, detected formants, deviation
    """
    # Simple formant estimation using LPC
    try:
        # Pre-emphasis
        y_pre = np.append(y[0], y[1:] - 0.97 * y[:-1])
        
        # Frame from middle
        mid = len(y_pre) // 2
        frame_len = min(int(0.03 * sr), len(y_pre))  # 30ms frame
        start = max(0, mid - frame_len // 2)
        frame = y_pre[start:start + frame_len]
        
        if len(frame) < 128:
            return {"is_valid": False, "error": "Audio too short"}
        
        # Window
        frame = frame * np.hamming(len(frame))
        
        # LPC analysis (order = sr/1000 + 2 for formant estimation)
        lpc_order = min(int(sr / 1000) + 2, 16)
        
        # Autocorrelation method for LPC
        autocorr = np.correlate(frame, frame, mode='full')
        autocorr = autocorr[len(autocorr)//2:]
        
        # Levinson-Durbin recursion (simplified)
        r = autocorr[:lpc_order + 1]
        a = np.zeros(lpc_order + 1)
        a[0] = 1.0
        e = r[0]
        
        for i in range(1, lpc_order + 1):
            lambda_val = 0.0
            for j in range(i):
                lambda_val += a[j] * r[i - j]
            lambda_val = -lambda_val / (e + 1e-12)
            
            # Update coefficients
            a_new = a.copy()
            for j in range(i):
                a_new[j] = a[j] + lambda_val * a[i - 1 - j]
            a_new[i] = lambda_val
            a = a_new
            
            e = e * (1 - lambda_val ** 2)
        
        # Find roots of LPC polynomial
        roots = np.roots(a)
        
        # Convert to frequencies (only positive imaginary parts, inside unit circle)
        formants = []
        for root in roots:
            if np.imag(root) > 0 and np.abs(root) < 1:
                freq = np.arctan2(np.imag(root), np.real(root)) * sr / (2 * np.pi)
                if 50 < freq < sr / 2:
                    formants.append(freq)
        
        formants = sorted(formants)[:3]  # First 3 formants
        
        if len(formants) < 2:
            return {"is_valid": False, "error": "Could not detect formants"}
        
        f1_detected = formants[0]
        f2_detected = formants[1] if len(formants) > 1 else 0
        
        # Calculate deviation
        f1_dev = abs(f1_detected - f1_target) / f1_target
        f2_dev = abs(f2_detected - f2_target) / f2_target
        
        is_valid = f1_dev <= tolerance and f2_dev <= tolerance
        
        return {
            "is_valid": is_valid,
            "is_u_vowel": is_valid,
            "f1_detected": float(f1_detected),
            "f2_detected": float(f2_detected),
            "f1_target": f1_target,
            "f2_target": f2_target,
            "f1_deviation": float(f1_dev),
            "f2_deviation": float(f2_dev),
            "average_deviation": float((f1_dev + f2_dev) / 2),
            "feedback": "Good /u/ vowel ✓" if is_valid else "Try a rounder 'oo' sound"
        }
        
    except Exception as e:
        return {"is_valid": False, "error": str(e)}

def classify_phonation_state(spectral_tilt, h1_h2, hnr, jitter, shimmer):
    """
    Classify phonation into one of 4 states (Breathy/Flow/Neutral/Pressed).
    
    Uses spectral tilt as primary indicator (proxy for glottal airflow).
    H1-H2, HNR, and stability metrics provide supporting evidence.
    
    Per research, "Flow" is the optimal state for healthy voice modification,
    sitting between breathy (too loose) and pressed (too tense).
    
    Args:
        spectral_tilt: Spectral tilt slope in dB/octave
        h1_h2: H1-H2 difference in dB
        hnr: Harmonics-to-Noise Ratio in dB
        jitter: Jitter percentage
        shimmer: Shimmer percentage
    
    Returns:
        dict: Classification with state, confidence, stability, recommendations
    """
    # Primary classification based on spectral tilt
    if spectral_tilt >= 8.0:
        state = "breathy"
    elif spectral_tilt >= 3.0:
        state = "flow"
    elif spectral_tilt >= -2.0:
        state = "neutral"
    else:
        state = "pressed"
    
    # Calculate confidence based on distance from boundaries
    if state == "breathy":
        confidence = min(1.0, (spectral_tilt - 8.0) / 4.0 + 0.6)
    elif state == "flow":
        # Peak confidence in middle of flow range (5.5)
        confidence = 1.0 - abs(spectral_tilt - 5.5) / 2.5 * 0.3
    elif state == "neutral":
        confidence = 1.0 - abs(spectral_tilt - 0.5) / 2.5 * 0.3
    else:  # pressed
        confidence = min(1.0, (-2.0 - spectral_tilt) / 4.0 + 0.6)
    
    # Adjust confidence with supporting metrics
    if h1_h2 is not None:
        # H1-H2 should correlate with spectral tilt
        # High H1-H2 = breathy, Low/negative = pressed
        if state == "breathy" and h1_h2 > 6:
            confidence += 0.1
        elif state == "pressed" and h1_h2 < 0:
            confidence += 0.1
    
    # Stability score (low jitter/shimmer = more stable = better control)
    stability = 100
    if jitter is not None:
        # Jitter < 1% is excellent, > 2% is poor
        stability -= min(30, jitter * 15)
    if shimmer is not None:
        # Shimmer < 3% is excellent, > 5% is poor
        stability -= min(30, shimmer * 6)
    
    # HNR contribution to stability
    if hnr is not None:
        # HNR > 15 is good, < 10 is poor
        stability += min(10, (hnr - 10) * 2) if hnr > 10 else max(-20, (hnr - 10) * 2)
    
    stability = float(np.clip(stability, 0, 100))
    
    # Get state info
    state_info = PHONATION_STATES[state]
    
    # Determine if strain warning needed
    is_strained = state == "pressed"
    needs_reset = is_strained  # Will be checked for duration in real-time
    
    # Determine if in optimal zone
    is_flow = state == "flow"
    
    return {
        "state": state,
        "label": state_info["label"],
        "feedback": state_info["feedback"],
        "zone_color": state_info["color"],
        "zone": state_info["zone"],
        "description": state_info["description"],
        "confidence": float(np.clip(confidence, 0.0, 1.0)),
        "spectral_tilt": float(spectral_tilt),
        "stability_score": stability,
        "is_flow": is_flow,
        "is_strained": is_strained,
        "needs_reset": needs_reset,
        "components": {
            "spectral_tilt": float(spectral_tilt),
            "h1_h2": float(h1_h2) if h1_h2 is not None else None,
            "hnr": float(hnr) if hnr is not None else None,
            "jitter": float(jitter) if jitter is not None else None,
            "shimmer": float(shimmer) if shimmer is not None else None
        }
    }

# ----------------------
# RBI Implementation
# ----------------------

# RBI Weights - Tuned for balanced contribution
# Ratio (0.4): Primary indicator of brightness/darkness (spectral slope proxy)
# Centroid (0.25): Center of mass, correlates well with resonance
# Tilt (0.25): Spectral tilt, differentiates breathy/pressed and resonance
# F0 (0.1): Minor contribution to account for pitch-dependent brightness perception
RBI_WEIGHTS = {
    "ratio": 0.4,
    "centroid": 0.25,
    "tilt": 0.25,
    "f0": 0.10
}

def compute_raw_rbi_features_vectorized(frames, sr):
    """
    Vectorized version of compute_raw_rbi_features.
    """
    # frames: (N, frame_len)
    N, frame_len = frames.shape

    # Windowing
    window = np.hanning(frame_len)
    windowed_frames = frames * window

    # FFT
    spectrum = np.fft.rfft(windowed_frames, axis=1)
    mag_sq = np.abs(spectrum) ** 2
    freqs = np.fft.rfftfreq(frame_len, 1/sr)
    
    # 1. HF/LF Ratio
    # LF: 0-1.5k, HF: 3-6k
    lf_mask = (freqs >= 0) & (freqs < 1500)
    hf_mask = (freqs >= 3000) & (freqs < 6000)
    
    e_lf = np.sum(mag_sq[:, lf_mask], axis=1)
    e_hf = np.sum(mag_sq[:, hf_mask], axis=1)
    
    ratio_hl = np.log10((e_hf + 1e-12) / (e_lf + 1e-12))
    
    # 2. Centroid
    total_energy = np.sum(mag_sq, axis=1) + 1e-12
    centroid = np.sum(freqs * mag_sq, axis=1) / total_energy
    
    # 3. Tilt
    band_mask = (freqs >= 300) & (freqs <= 4000)

    mag_band = mag_sq[:, band_mask] # (N, M)
    y_band = 20 * np.log10(mag_band + 1e-12) # (N, M)
    f_band = freqs[band_mask] # (M,)

    M_points = len(f_band)
    if M_points > 1:
        sum_x = np.sum(f_band)
        sum_xx = np.sum(f_band**2)
        denom = M_points * sum_xx - sum_x**2

        sum_y = np.sum(y_band, axis=1) # (N,)
        sum_xy = np.sum(f_band * y_band, axis=1) # (N,)

        slope = (M_points * sum_xy - sum_x * sum_y) / denom
        tilt = slope
    else:
        tilt = np.zeros(N)
        
    tilt_flipped = -tilt
    
    return ratio_hl, centroid, tilt_flipped

def compute_rbi_series(y, sr, frame_length_s=0.04, hop_length_s=0.01):
    """
    Compute RBI for the entire file using the 3-pass approach (Vectorized).
    Compute RBI for the entire file using the 3-pass approach.
    Optimized version using vectorized operations.
    """
    # Pre-processing
    y_pre = pre_emphasis(y)
    
    # Frame settings
    frame_len = int(frame_length_s * sr)
    hop_len = int(hop_length_s * sr)
    
    # Create frames using sliding window view (zero-copy)
    # This matches the indices of the original loop: range(0, len(y_pre) - frame_len, hop_len)
    try:
        from numpy.lib.stride_tricks import sliding_window_view
        frames = sliding_window_view(y_pre, frame_len)[::hop_len]
    except ImportError:
         # Fallback for older numpy if needed
        shape = ((len(y_pre) - frame_len) // hop_len + 1, frame_len)
        strides = (y_pre.strides[0] * hop_len, y_pre.strides[0])
        frames = np.lib.stride_tricks.as_strided(y_pre, shape=shape, strides=strides)

    num_frames = frames.shape[0]

    # Pitch tracking for the whole file
    sound = parselmouth.Sound(y, sr)
    pitch_obj = sound.to_pitch(time_step=hop_length_s, pitch_floor=75, pitch_ceiling=600)
    
    # --- 1. Batch Processing of Energies & FFT ---
    
    # Windowing
    window = np.hanning(frame_len)
    windowed_frames = frames * window
    
    # FFT: rfft returns (num_frames, frame_len//2 + 1)
    spectrum = np.fft.rfft(windowed_frames, axis=1)
    mag_sq = np.abs(spectrum) ** 2
    freqs = np.fft.rfftfreq(frame_len, 1/sr)
    
    # RMS (computed on time-domain frames to match original exactly)
    rms_values = np.sqrt(np.mean(frames**2, axis=1) + 1e-12)
    energy_db_values = 20 * np.log10(rms_values)

    # Adaptive Threshold
    mean_energy = np.mean(energy_db_values) if len(energy_db_values) > 0 else -100
    energy_threshold = max(mean_energy - 20, -50)

    # --- 2. F0 Extraction ---
    start_indices = np.arange(0, num_frames) * hop_len
    times = start_indices / sr
    query_times = times + frame_length_s/2

    # List comprehension is efficient for scalar query
    f0_values = np.array([pitch_obj.get_value_at_time(t) for t in query_times])
    f0_values = np.nan_to_num(f0_values, nan=0.0)

    # --- 3. Voiced Mask ---
    is_voiced = (energy_db_values > energy_threshold) & (f0_values > 75) & (f0_values < 500)

    if not np.any(is_voiced):
        return [None] * num_frames, {}

    # --- 4. Feature Computation (Vectorized) ---

    # a. HF/LF Ratio
    lf_mask = (freqs >= 0) & (freqs < 1500)
    hf_mask = (freqs >= 3000) & (freqs < 6000)

    e_lf = np.sum(mag_sq[:, lf_mask], axis=1)
    e_hf = np.sum(mag_sq[:, hf_mask], axis=1)

    ratios = np.log10((e_hf + 1e-12) / (e_lf + 1e-12))

    # b. Centroid
    total_energy = np.sum(mag_sq, axis=1) + 1e-12
    centroids = np.sum(freqs * mag_sq, axis=1) / total_energy

    # c. Tilt (Vectorized Linear Regression)
    band_mask = (freqs >= 300) & (freqs <= 4000)

    if np.sum(band_mask) > 1:
        f_band = freqs[band_mask]
        y_band = 20 * np.log10(mag_sq[:, band_mask] + 1e-12)
        
        # Linear regression: slope = (N * sum(xy) - sum(x)sum(y)) / (N * sum(x^2) - sum(x)^2)
        N_band = len(f_band)
        sum_x = np.sum(f_band)
        sum_x2 = np.sum(f_band**2)
        denom = N_band * sum_x2 - sum_x**2
        
        sum_y = np.sum(y_band, axis=1)
        sum_xy = np.sum(f_band * y_band, axis=1)
        
        slopes = (N_band * sum_xy - sum_x * sum_y) / (denom + 1e-12)
        tilts = -slopes # Flipped
    else:
        tilts = np.zeros(num_frames)

    # --- 5. Stats & Normalization ---
    
    valid_ratios = ratios[is_voiced]
    valid_centroids = centroids[is_voiced]
    valid_tilts = tilts[is_voiced]
    valid_f0 = f0_values[is_voiced]

    if len(valid_ratios) == 0:
        return [None] * num_frames, {}

    stats = {
        "ratio_min": np.percentile(valid_ratios, 5), "ratio_max": np.percentile(valid_ratios, 95),
        "centroid_min": np.percentile(valid_centroids, 5), "centroid_max": np.percentile(valid_centroids, 95),
        "tilt_min": np.percentile(valid_tilts, 5), "tilt_max": np.percentile(valid_tilts, 95)
    }
    
    # --- 6. RBI Calculation ---
    
    def norm(arr, vmin, vmax):
        if vmax <= vmin: return np.full_like(arr, 0.5)
        return np.clip((arr - vmin) / (vmax - vmin + 1e-9), 0.0, 1.0)
    
    r_norm = norm(ratios, stats["ratio_min"], stats["ratio_max"])
    c_norm = norm(centroids, stats["centroid_min"], stats["centroid_max"])
    t_norm = norm(tilts, stats["tilt_min"], stats["tilt_max"])
    
    f0_clip = np.clip(f0_values, 120, 300)
    f0_norm = (f0_clip - 120) / (300 - 120)
    
    raw_scores = (RBI_WEIGHTS["ratio"] * r_norm) + \
                 (RBI_WEIGHTS["centroid"] * c_norm) + \
                 (RBI_WEIGHTS["tilt"] * t_norm) + \
                 (RBI_WEIGHTS["f0"] * f0_norm)

    raw_scores = np.clip(raw_scores * 100, 0, 100)

    # Apply Smoothing and Construct Result
    rbi_values = [None] * num_frames
    last_rbi = 50.0
    alpha = 0.2

    for i in range(num_frames):
        if is_voiced[i]:
            current_rbi = raw_scores[i]
            smoothed_rbi = (alpha * current_rbi) + ((1 - alpha) * last_rbi)
    frame_len = int(frame_length_s * sr)
    hop_len = int(hop_length_s * sr)
    
    # 1. Create Frames using stride tricks for efficiency
    n_samples = len(y_pre)
    stop = n_samples - frame_len

    # Match range(0, len(y_pre) - frame_len, hop_len)
    if stop <= 0:
        return [], {}

    n_frames = (stop - 1) // hop_len + 1

    shape = (n_frames, frame_len)
    strides = (y_pre.strides[0] * hop_len, y_pre.strides[0])
    frames = np.lib.stride_tricks.as_strided(y_pre, shape=shape, strides=strides)

    # 2. RMS Energy (Vectorized)
    frames_sq = frames ** 2
    rms = np.sqrt(np.mean(frames_sq, axis=1) + 1e-12)
    energy_db = 20 * np.log10(rms)

    # 3. F0 Tracking
    sound = parselmouth.Sound(y, sr)
    pitch_obj = sound.to_pitch(time_step=hop_length_s, pitch_floor=75, pitch_ceiling=600)
    
    # Create frames view
    # Limit number of frames to match legacy loop: range(0, len(y_pre) - frame_len, hop_len)
    num_frames = (len(y_pre) - frame_len - 1) // hop_len + 1
    
    # sliding_window_view returns all possible windows. We stride it by hop_len.
    frames_view = sliding_window_view(y_pre, window_shape=frame_len)[::hop_len]
    
    # Truncate to match legacy length if necessary
    if len(frames_view) > num_frames:
        frames_view = frames_view[:num_frames]
        
    n_frames = len(frames_view)
    
    # Timestamps (start times)
    starts = np.arange(0, n_frames) * hop_len
    times = starts / sr

    # RMS Energy (Vectorized)
    rms_values = np.sqrt(np.mean(frames_view**2, axis=1) + 1e-12)
    energies_db = 20 * np.log10(rms_values)

    # Adaptive Threshold
    mean_energy = np.mean(energies_db) if len(energies_db) > 0 else -100
    energy_threshold = max(mean_energy - 20, -50)

    # F0
    # Query pitch at t + frame_length/2
    query_times = times + frame_length_s/2
    # Parselmouth lookup (list comprehension is fast enough for 1D lookup)
    f0_values = np.array([pitch_obj.get_value_at_time(t) for t in query_times])
    f0_values = np.nan_to_num(f0_values, nan=0.0)

    # Validity Check
    is_voiced = (energies_db > energy_threshold) & (f0_values > 75) & (f0_values < 500)

    valid_indices = np.where(is_voiced)[0]

    if len(valid_indices) == 0:
        return [None] * n_frames, {}
        
    # Compute features only for voiced frames
    valid_frames = frames_view[is_voiced]
    
    ratios, centroids, tilts = compute_raw_rbi_features_vectorized(valid_frames, sr)

    # Pass 2: Global Stats
    # Interpolate F0 to frame centers
    starts = np.arange(n_frames) * hop_len
    centers_t = (starts + frame_len/2) / sr
    
    pitch_vals = pitch_obj.selected_array['frequency']
    pitch_times = pitch_obj.xs()
    
    # Interpolate (0 where undefined)
    f0s = np.interp(centers_t, pitch_times, pitch_vals, left=0, right=0)
    
    # 4. Adaptive Threshold
    mean_energy = np.mean(energy_db) if len(energy_db) > 0 else -100
    energy_threshold = max(mean_energy - 20, -50)

    # 5. Gate (Voiced Detection)
    is_voiced = (energy_db > energy_threshold) & (f0s > 75) & (f0s < 500)

    voiced_indices = np.where(is_voiced)[0]

    # Pass 2: Global Stats
    if len(voiced_indices) == 0:
        return [None] * n_frames, {}
        
    voiced_frames = frames[voiced_indices]
    voiced_f0s = f0s[voiced_indices]

    # 6. FFT for voiced frames only
    window = np.hanning(frame_len)
    windowed_frames = voiced_frames * window

    spectra = np.fft.rfft(windowed_frames, axis=1)
    mag_sq = np.abs(spectra) ** 2
    freqs = np.fft.rfftfreq(frame_len, 1/sr)

    # 6a. Ratio HL
    lf_mask = (freqs >= 0) & (freqs < 1500)
    hf_mask = (freqs >= 3000) & (freqs < 6000)

    e_lf = np.sum(mag_sq[:, lf_mask], axis=1)
    e_hf = np.sum(mag_sq[:, hf_mask], axis=1)

    ratios = np.log10((e_hf + 1e-12) / (e_lf + 1e-12))

    # 6b. Centroid
    total_energy = np.sum(mag_sq, axis=1) + 1e-12
    centroids = np.sum(freqs * mag_sq, axis=1) / total_energy

    # 6c. Tilt
    band_mask = (freqs >= 300) & (freqs <= 4000)
    tilts = np.zeros(len(voiced_indices))

    if np.sum(band_mask) > 1:
        f_band = freqs[band_mask]
        y_band = 20 * np.log10(mag_sq[:, band_mask] + 1e-12)
        
        # Linear regression vectorized
        # A = [f, 1]
        A = np.vstack([f_band, np.ones_like(f_band)]).T
        # Pseudo-inverse for batch least squares
        pinv = np.linalg.pinv(A)
        coeffs = y_band @ pinv.T
        tilts = coeffs[:, 0]
        
    tilts_flipped = -tilts
    
    # 7. Stats
    stats = {
        "ratio_min": np.percentile(ratios, 5), "ratio_max": np.percentile(ratios, 95),
        "centroid_min": np.percentile(centroids, 5), "centroid_max": np.percentile(centroids, 95),
        "tilt_min": np.percentile(tilts_flipped, 5), "tilt_max": np.percentile(tilts_flipped, 95)
    }
    
    # Pass 3: Normalize and Compute RBI
    # Vectorized Normalization
    r_norm = np.clip((ratios - stats["ratio_min"]) / (stats["ratio_max"] - stats["ratio_min"] + 1e-9), 0.0, 1.0)
    c_norm = np.clip((centroids - stats["centroid_min"]) / (stats["centroid_max"] - stats["centroid_min"] + 1e-9), 0.0, 1.0)
    t_norm = np.clip((tilts - stats["tilt_min"]) / (stats["tilt_max"] - stats["tilt_min"] + 1e-9), 0.0, 1.0)
    
    valid_f0s = f0_values[is_voiced]
    f0_clip = np.clip(valid_f0s, 120, 300)
    f0_norm = (f0_clip - 120) / (300 - 120)
    
    raw_scores = (RBI_WEIGHTS["ratio"] * r_norm) + \
                 (RBI_WEIGHTS["centroid"] * c_norm) + \
                 (RBI_WEIGHTS["tilt"] * t_norm) + \
                 (RBI_WEIGHTS["f0"] * f0_norm)

    current_rbis = np.clip(raw_scores * 100, 0, 100)
    
    # Smoothing
    rbi_values = [None] * n_frames
    last_rbi = 50.0
    valid_rbi_iter = iter(current_rbis)
    
    for i in range(n_frames):
        if is_voiced[i]:
            val = next(valid_rbi_iter)
            alpha = 0.2
            smoothed_rbi = (alpha * val) + ((1 - alpha) * last_rbi)
            last_rbi = smoothed_rbi
            rbi_values[i] = smoothed_rbi
        else:
            rbi_values[i] = None
    # 8. Normalize and Score
    def norm_vec(val, vmin, vmax):
        width = vmax - vmin
        if width <= 0: return np.full_like(val, 0.5)
        return np.clip((val - vmin) / (width + 1e-9), 0.0, 1.0)

    r_norm = norm_vec(ratios, stats["ratio_min"], stats["ratio_max"])
    c_norm = norm_vec(centroids, stats["centroid_min"], stats["centroid_max"])
    t_norm = norm_vec(tilts_flipped, stats["tilt_min"], stats["tilt_max"])
    
    f0_clip = np.clip(voiced_f0s, 120, 300)
    f0_norm = (f0_clip - 120) / (300 - 120)
    
    raw_score = (RBI_WEIGHTS["ratio"] * r_norm) + \
                (RBI_WEIGHTS["centroid"] * c_norm) + \
                (RBI_WEIGHTS["tilt"] * t_norm) + \
                (RBI_WEIGHTS["f0"] * f0_norm)

    current_rbi = np.clip(raw_score * 100, 0, 100)
    
    # Smoothing
    smoothed_values = []
    last_rbi = 50.0
    for val in current_rbi:
        s = (0.2 * val) + (0.8 * last_rbi)
        smoothed_values.append(s)
        last_rbi = s
    
    # Map back to timeline
    final_rbi_values = [None] * n_frames
    for idx, val in zip(voiced_indices, smoothed_values):
        final_rbi_values[idx] = val
            
    return final_rbi_values, stats

# ----------------------
# Main Analysis
# ----------------------

def classify_voice_quality(cpp, hnr, h1_h2, jitter, shimmer, rbi_mean=None, f3_noise_ratio=None, spectral_tilt=None):
    """
    Classify voice quality based on acoustic metrics.
    
    Enhanced with F3-region breathiness analysis per research:
    "Breathiness as a Feminine Voice Characteristic: A Perceptual Approach"
    """
    breathiness_score = 0
    breathiness_grbas = None
    strain_score = 0
    roughness_score = 0

    # NEW: GRBAS-aligned breathiness classification using F3 noise
    if f3_noise_ratio is not None:
        breathiness_grbas = classify_breathiness_grbas(f3_noise_ratio, hnr, cpp, h1_h2)
        breathiness_score = breathiness_grbas["composite_score"]
    else:
        # Fallback to legacy scoring when F3 data unavailable
        if cpp < 2.5 or hnr < 10 or h1_h2 > 6: breathiness_score = 70
        if cpp < 1.5 or hnr < 7 or h1_h2 > 10: breathiness_score = 90
        if cpp > 4.5 and hnr > 15 and h1_h2 < 4: breathiness_score = 20

    if jitter > 1.0 or shimmer > 3.0: roughness_score = 60
    if jitter > 2.0 or shimmer > 5.0: roughness_score = 85

    if h1_h2 < 0: strain_score = 60
    if h1_h2 < -4: strain_score = 85

    # RBI Label
    resonance_label = "Neutral"
    if rbi_mean is not None:
        if rbi_mean < 40: resonance_label = "Dark/Back"
        elif rbi_mean < 60: resonance_label = "Neutral"
        elif rbi_mean <= 80: resonance_label = "Bright/Forward"
        else: resonance_label = "Sharp/Over-bright"

    if breathiness_score > 70 and strain_score < 40: label = "Primarily breathy"
    elif strain_score > 60 and breathiness_score < 40: label = "Primarily pressed/strained"
    elif roughness_score > 60: label = "Rough/irregular"
    else: label = "Mostly modal/clean"

    # Confidence Score (0-100)
    # Based on signal clarity (HNR) and periodicity strength (CPP)
    # HNR > 20dB is excellent, < 10dB is poor
    # CPP > 14dB is excellent, < 6dB is poor
    hnr_score = min(max((hnr - 5) / 15, 0), 1) # 5-20 range
    cpp_score = min(max((cpp - 4) / 10, 0), 1) # 4-14 range
    confidence = int((hnr_score * 0.6 + cpp_score * 0.4) * 100)

    # NEW: Ventricular engagement detection
    ventricular = compute_ventricular_engagement(
        jitter, shimmer, hnr, h1_h2,
        strain_score=strain_score,
        roughness_score=roughness_score
    )
    
    # NEW: Open Quotient estimation
    open_quotient = estimate_open_quotient(h1_h2, spectral_tilt, cpp, hnr)

    result = {
        "breathiness_score": int(breathiness_score),
        "roughness_score": int(roughness_score),
        "strain_score": int(strain_score),
        "rbi_score": int(rbi_mean) if rbi_mean is not None else 0,
        "overall_label": label,
        "resonance_label": resonance_label,
        "confidence_score": confidence,
        # NEW: Ventricular engagement data
        "ventricular_engagement": ventricular,
        "ventricular_detected": ventricular["is_detected"],
        "ventricular_severity": ventricular["severity"],
        "ventricular_feedback": ventricular["feedback"],
        # NEW: Open Quotient data
        "open_quotient": open_quotient,
        "oq_percent": open_quotient["oq_percent"],
        "oq_zone": open_quotient["zone"],
        "oq_feedback": open_quotient["feedback"]
    }
    
    # Add GRBAS breathiness data if available
    if breathiness_grbas is not None:
        result["breathiness_grbas"] = breathiness_grbas
        result["breathiness_is_sweet_spot"] = breathiness_grbas["is_sweet_spot"]
        result["breathiness_feedback"] = breathiness_grbas["feedback"]
        result["breathiness_zone_color"] = breathiness_grbas["zone_color"]
    
    return result


def compare_to_goal(summary, features_global, goal_name):
    goal = GOAL_PRESETS.get(goal_name)
    if not goal or not summary: return None

    def flag_range(value, low, high):
        if value is None: return "unknown"
        if value < low: return "below_target"
        if value > high: return "above_target"
        return "within_target"

    comparison = {
        "goal_name": goal_name,
        "goal_label": goal["label"],
        "breathiness_flag": flag_range(summary.get("breathiness_score"), *goal.get("breathiness_range", (0,100))),
        "roughness_flag": flag_range(summary.get("roughness_score"), *goal.get("roughness_range", (0,100))),
        "strain_flag": flag_range(summary.get("strain_score"), *goal.get("strain_range", (0,100))),
        "rbi_flag": flag_range(summary.get("rbi_score"), *goal.get("rbi_range", (0,100))),
        "hnr_flag": "unknown",
        "cpp_flag": "unknown"
    }
    
    if features_global.get("hnr_mean") is not None:
        comparison["hnr_flag"] = "below_target" if features_global["hnr_mean"] < goal.get("hnr_min", 0) else "within_target"
        
    cpp = features_global.get("cpp_mean")
    if cpp is not None:
        comparison["cpp_flag"] = flag_range(cpp, *goal.get("cpp_range", (0, 100)))

    return comparison

def analyze_file(path, goal_name="transfem_soft_slightly_breathy"):
    if not _deps_available:
        return {
            "error": "Analysis dependencies (numpy, scipy, parselmouth) not installed.",
            "summary": {},
            "features_global": {},
            "timeline": {},
            "goals": {}
        }

    y, sr = load_audio(path) # 16kHz
    
    # Check duration
    duration = len(y) / sr
    if duration < 1.0:
        return {
            "error": "Audio too short (< 1.0s). Please record at least 1 second for reliable analysis.",
            "summary": {},
            "features_global": {},
            "timeline": {},
            "goals": {}
        }

    # Standard metrics
    sound = parselmouth.Sound(y, sr)
    cpp = compute_cpp_praat(sound)
    hnr = compute_hnr(sound)
    jitter, shimmer = compute_jitter_shimmer(sound)
    f0_mean, f0_range = compute_f0_stats(sound)
    h1_h2 = compute_spectral_tilt_h1_h2(y, sr, f0_mean)
    
    # NEW: F3-region noise analysis (research-based breathiness detection)
    # Per "Breathiness as a Feminine Voice Characteristic" study
    f3_noise_ratio = compute_f3_noise_ratio(y, sr, f0_mean)
    
    # NEW: Flow Phonation analysis
    # Per "Applying Flow Phonation in Voice Care for Transgender Women"
    spectral_tilt_slope = compute_spectral_tilt_slope(y, sr)
    onset_analysis = detect_onset_type(y, sr)
    phonation_state = classify_phonation_state(spectral_tilt_slope, h1_h2, hnr, jitter, shimmer)
    
    # RBI Analysis
    rbi_series, rbi_stats = compute_rbi_series(y, sr)
    
    # VoiceLab-inspired advanced metrics (VTL, enhanced perturbations)
    voicelab_data = {}
    if _voicelab_available:
        try:
            vtl_result = estimate_vtl(sound)
            perturbation_result = compute_perturbation_pca(sound, 75, 600)
            ltas_result = measure_ltas(sound)
            rate_result = measure_speech_rate(sound)
            
            voicelab_data = {
                "vtl": vtl_result,
                "perturbation_pca": perturbation_result,
                "ltas": ltas_result,
                "speech_rate": rate_result
            }
        except Exception as e:
            voicelab_data = {"error": str(e)}
    
    # Mean RBI (ignoring Nones)
    valid_rbis = [x for x in rbi_series if x is not None]
    rbi_mean = float(np.mean(valid_rbis)) if valid_rbis else 0.0
    
    # Classify with F3 noise data for enhanced breathiness detection
    summary = classify_voice_quality(cpp, hnr, h1_h2, jitter, shimmer, rbi_mean, f3_noise_ratio)
    
    # Add flow phonation data to summary
    summary["phonation_state"] = phonation_state
    summary["onset_analysis"] = onset_analysis
    summary["is_flow"] = phonation_state["is_flow"]
    summary["is_strained"] = phonation_state["is_strained"]
    summary["needs_reset"] = phonation_state["needs_reset"]
    summary["stability_score"] = phonation_state["stability_score"]
    
    features_global = {
        "cpp_mean": float(cpp),
        "hnr_mean": float(hnr),
        "h1_h2_mean": float(h1_h2),
        "jitter_percent": float(jitter),
        "shimmer_percent": float(shimmer),
        "f0_mean_hz": f0_mean,
        "f0_range_hz": f0_range,
        "rbi_mean": rbi_mean,
        "f3_noise_ratio": float(f3_noise_ratio),
        "spectral_tilt_slope": float(spectral_tilt_slope),  # NEW: For flow phonation
        "phonation_state": phonation_state["state"],        # NEW: breathy/flow/neutral/pressed
        "onset_type": onset_analysis["type"],                # NEW: hard_attack/breathy_onset/coordinated
        # VoiceLab-inspired metrics
        "vtl_cm": voicelab_data.get("vtl", {}).get("vtl_cm"),
        "formant_means": voicelab_data.get("vtl", {}).get("formant_means"),
        "jitter_pca": voicelab_data.get("perturbation_pca", {}).get("jitter_pca"),
        "shimmer_pca": voicelab_data.get("perturbation_pca", {}).get("shimmer_pca"),
        # Phase 2 metrics
        "ltas_mean_db": voicelab_data.get("ltas", {}).get("mean_db"),
        "ltas_slope": voicelab_data.get("ltas", {}).get("slope_db_per_khz"),
        "speech_rate": voicelab_data.get("speech_rate", {}).get("speech_rate_syl_per_sec"),
        "syllable_count": voicelab_data.get("speech_rate", {}).get("syllables_estimated")
    }
    
    # Reconstruct frame data for timeline
    # We need to regenerate basic frame data to match the timeline structure expected by frontend
    # or just use what we have.
    # Let's do a quick pass to get energy/f0 aligned with RBI
    times = []
    energy_db = []
    f0_list = []
    labels = []
    
    frame_len = int(0.04 * sr)
    hop_len = int(0.01 * sr)
    pitch_obj = sound.to_pitch(time_step=0.01, pitch_floor=75, pitch_ceiling=600)
    
    for i, start in enumerate(range(0, len(y) - frame_len, hop_len)):
        t = start / sr
        times.append(t)
        frame = y[start:start+frame_len]
        rms = np.sqrt(np.mean(frame**2) + 1e-12)
        energy_db.append(float(20*np.log10(rms)))
        
        f0_val = pitch_obj.get_value_at_time(t + 0.02)
        f0_list.append(f0_val if not np.isnan(f0_val) else None)
        
        # Label based on RBI
        rbi_val = rbi_series[i] if i < len(rbi_series) else None
        if rbi_val is None:
            labels.append("silence")
        elif rbi_val < 40:
            labels.append("back_dark")
        elif rbi_val < 60:
            labels.append("neutral")
        elif rbi_val <= 80:
            labels.append("bright_forward")
        else:
            labels.append("sharp")

    # Build segments
    segments = []
    if times:
        curr_label = labels[0]
        seg_start = times[0]
        for i in range(1, len(times)):
            if labels[i] != curr_label:
                segments.append({"start_s": seg_start, "end_s": times[i], "label": curr_label})
                curr_label = labels[i]
                seg_start = times[i]
        segments.append({"start_s": seg_start, "end_s": times[-1] + 0.01, "label": curr_label})

    goal_comparison = compare_to_goal(summary, features_global, goal_name)

    return {
        "summary": summary,
        "features_global": features_global,
        "timeline": {
            "frame_hop_s": 0.01,
            "times": times,
            "labels": labels,
            "energy_db": energy_db,
            "f0": f0_list,
            "rbi": rbi_series,
            "segments": segments
        },
        "goals": goal_comparison
    }

def analyze_file_with_transcript(path, goal_name="transfem_soft_slightly_breathy", transcriber=None, language="en"):
    base = analyze_file(path, goal_name)
    if not transcriber: return base
    
    asr = transcriber(path, language=language)
    words = asr.get("words", [])
    
    # Align words with RBI
    times = base["timeline"]["times"]
    rbis = base["timeline"]["rbi"]
    
    aligned_words = []
    for w in words:
        ws, we = w["start_s"], w["end_s"]
        # Find indices
        indices = [i for i, t in enumerate(times) if ws <= t < we]
        if not indices: continue
        
        word_rbis = [rbis[i] for i in indices if rbis[i] is not None]
        avg_rbi = float(np.mean(word_rbis)) if word_rbis else 0
        
        label = "neutral"
        if avg_rbi < 40: label = "back_dark"
        elif avg_rbi <= 60: label = "neutral"
        elif avg_rbi <= 80: label = "bright_forward"
        else: label = "sharp"
        
        aligned_words.append({
            "text": w["text"],
            "start_s": ws,
            "end_s": we,
            "rbi_score": int(avg_rbi),
            "label": label
        })
        
    base["transcript"] = {
        "full_text": asr.get("full_text", ""),
        "words": aligned_words
    }
    return base

# ----------------------
# Live Analysis Helpers (for sockets.py)
# ----------------------

def compute_frame_features(y, sr, frame_length_s=0.04, hop_length_s=0.01, energy_threshold_db=-40.0):
    """
    Compute frame-level features for a chunk of audio (used in live streaming).
    Returns a dictionary of lists.
    """
    sound = parselmouth.Sound(y, sr)
    
    # F0
    pitch = sound.to_pitch(pitch_floor=75, pitch_ceiling=600)
    f0_values = pitch.selected_array['frequency']
    # Filter 0s
    f0_valid = [f for f in f0_values if f > 0]
    f0_mean = float(np.mean(f0_valid)) if f0_valid else None
    
    # CPP
    cpp = compute_cpp_praat(sound)
    
    # HNR
    hnr = compute_hnr(sound)
    
    # H1-H2
    h1_h2 = compute_spectral_tilt_h1_h2(y, sr, f0_mean)
    
    # Jitter/Shimmer (might be unstable on short chunks)
    jitter, shimmer = compute_jitter_shimmer(sound)
    
    # NEW: Spectral Slope (Full Tilt) for Register Classification
    spectral_slope = compute_spectral_tilt_slope(y, sr)
    
    # Align F0 with the hop size expected by RBI (10ms)
    pitch_framed = sound.to_pitch(time_step=hop_length_s, pitch_floor=75, pitch_ceiling=600)
    n_frames = pitch_framed.n_frames
    f0_list = []
    for i in range(n_frames):
        val = pitch_framed.get_value_in_frame(i+1) # 1-based
        f0_list.append(val if not np.isnan(val) else None)
        
    return {
        "f0": f0_list,
        "cpp": cpp, # Single value for window
        "hnr": hnr, # Single value
        "h1_h2": h1_h2, # Single value
        "spectral_slope": spectral_slope, # Single value
        "jitter": jitter,
        "shimmer": shimmer
    }

def compute_chunk_scores_from_frames(frame_data):
    """
    Aggregate frame features into scores for the chunk.
    """
    # In this simplified implementation, frame_data already contains window-level averages for most metrics
    cpp = frame_data["cpp"]
    hnr = frame_data["hnr"]
    h1_h2 = frame_data["h1_h2"]
    jitter = frame_data["jitter"]
    shimmer = frame_data["shimmer"]
    
    # Reuse classification logic
    # We don't have RBI here yet, it's computed separately in sockets.py
    # Pass spectral_tilt=None for live streaming (not available from compute_frame_features)
    scores = classify_voice_quality(cpp, hnr, h1_h2, jitter, shimmer, rbi_mean=None, spectral_tilt=None)
    
    return {
        "label": scores["overall_label"],
        "breathiness_score": scores["breathiness_score"],
        "roughness_score": scores["roughness_score"],
        "strain_score": scores["strain_score"],
        "cpp_mean": cpp,
        "hnr_mean": hnr,
        "h1_h2_mean": h1_h2,
        # NEW: Ventricular engagement
        "ventricular_detected": scores["ventricular_detected"],
        "ventricular_severity": scores["ventricular_severity"],
        "ventricular_feedback": scores["ventricular_feedback"],
        # NEW: Open Quotient
        "oq_percent": scores["oq_percent"],
        "oq_zone": scores["oq_zone"],
        "oq_feedback": scores["oq_feedback"]
    }


def clean_audio_signal(y, sr):
    """
    Apply bandpass filter and normalization to clean the audio signal.
    """
    if scipy is None: return y
    
    # 1. Bandpass Filter (80Hz - 8000Hz)
    # Removes low rumble and high frequency hiss/aliasing
    nyquist = 0.5 * sr
    low = 80 / nyquist
    high = min(8000 / nyquist, 0.99) # Ensure high is < 1
    
    b, a = scipy.signal.butter(4, [low, high], btype='band')
    y_clean = scipy.signal.filtfilt(b, a, y)
    
    # 2. Noise Gate-ish (Simple silence suppression)
    # (Optional, skipping for now to avoid artifacts)
    
    # 3. Peak Normalization (-1 dB)
    max_val = np.max(np.abs(y_clean))
    if max_val > 0:
        y_clean = y_clean / max_val * 0.89  # approx -1dB
        
    return y_clean


# ----------------------
# Articulatory Biofeedback Analysis (Research-Based)
# Based on "Appendix A: Acoustic Assumptions for Resonance Challenges"
# ----------------------

# Vowel Brightness Zones
BRIGHTNESS_ZONES = {
    "dark": {"label": "Dark", "range": (0, 35), "feedback": "Think /i/ - spread lips slightly", "color": "red"},
    "neutral": {"label": "Neutral", "range": (35, 60), "feedback": "Getting brighter - add more /i/ posture", "color": "yellow"},
    "bright": {"label": "Bright", "range": (60, 100), "feedback": "Sweet spot ✓", "color": "green"}
}

# Touch Quality Zones
TOUCH_QUALITY_ZONES = {
    "hard": {"label": "Hard Press", "feedback": "Relax - use lighter articulation", "color": "red"},
    "medium": {"label": "Medium Touch", "feedback": "A bit softer would be ideal", "color": "yellow"},
    "soft": {"label": "Soft Touch ✓", "feedback": "Perfect - light and forward", "color": "green"}
}

# Phrase Ending Zones
ENDING_QUALITY_ZONES = {
    "abrupt": {"label": "Blunt Stop", "feedback": "Keep mouth open longer at phrase end", "color": "red"},
    "moderate": {"label": "Moderate", "feedback": "Try to 'ride out' the vowel more", "color": "yellow"},
    "gradual": {"label": "Open Ending ✓", "feedback": "Beautiful resonant finish", "color": "green"}
}

# Target F2 for /i/ vowel (the "brightness" anchor)
F2_TARGET_I = 2300  # Hz - typical F2 for /i/ in feminine range


def compute_vowel_brightness(f1, f2, vowel_type="generic"):
    """
    Compute brightness score based on F2 position relative to /i/ target.
    
    Per research: All vowels should have an underlying /i/ posture for bright resonance.
    The /i/ vowel naturally produces the highest F2, serving as the brightness anchor.
    
    Args:
        f1: First formant frequency (Hz)
        f2: Second formant frequency (Hz)
        vowel_type: The intended vowel (for reference adjustments)
    
    Returns:
        dict: Brightness analysis with score (0-100), zone, and feedback
    """
    if f2 <= 0:
        return {
            "brightness_score": 0,
            "zone": "unknown",
            "label": "No Signal",
            "feedback": "Speak louder or move closer to mic",
            "color": "slate",
            "f2_current": 0,
            "f2_target": F2_TARGET_I
        }
    
    # F2 ranges for brightness calculation
    # Dark: F2 < 1000 Hz (back vowels like /u/, /o/)
    # Neutral: F2 1000-1800 Hz (central vowels)
    # Bright: F2 > 1800 Hz (front vowels approaching /i/)
    
    # Calculate brightness as percentage toward /i/ target
    f2_min = 700   # Typical lowest F2 (back round vowel)
    f2_max = F2_TARGET_I  # /i/ F2 target
    
    # Clamp F2 to reasonable range
    f2_clamped = max(f2_min, min(f2, f2_max + 300))
    
    # Linear mapping to 0-100 scale
    brightness_score = ((f2_clamped - f2_min) / (f2_max - f2_min)) * 100
    brightness_score = max(0, min(100, brightness_score))
    
    # Determine zone
    if brightness_score < 35:
        zone_key = "dark"
    elif brightness_score < 60:
        zone_key = "neutral"
    else:
        zone_key = "bright"
    
    zone = BRIGHTNESS_ZONES[zone_key]
    
    # Calculate how far from /i/ target
    deviation_hz = abs(F2_TARGET_I - f2)
    deviation_percent = (deviation_hz / F2_TARGET_I) * 100
    
    return {
        "brightness_score": float(round(brightness_score, 1)),
        "zone": zone_key,
        "label": zone["label"],
        "feedback": zone["feedback"],
        "color": zone["color"],
        "f2_current": float(round(f2, 1)),
        "f2_target": F2_TARGET_I,
        "deviation_hz": float(round(deviation_hz, 1)),
        "deviation_percent": float(round(deviation_percent, 1))
    }


def analyze_consonant_burst(y, sr, threshold_rms=0.02):
    """
    Analyze consonant articulation to detect burst energy (touch quality).
    
    Per research: Voiced stops (b, d, g) and nasals (m, n, ng) should use 
    "light touch" to avoid dark resonance. Hard contact creates acoustic 
    bursts that sound masculine.
    
    Args:
        y: Audio signal
        sr: Sample rate
        threshold_rms: Minimum RMS to consider for burst detection
    
    Returns:
        dict: Touch quality analysis with burst_energy, quality, and feedback
    """
    if len(y) < int(0.05 * sr):  # Need at least 50ms
        return {
            "burst_energy": 0,
            "touch_quality": "unknown",
            "label": "Too Short",
            "feedback": "Need longer audio sample",
            "color": "slate",
            "num_bursts": 0
        }
    
    # Compute RMS envelope with short window (5ms)
    window_samples = int(0.005 * sr)
    if window_samples < 1:
        window_samples = 1
    
    # Calculate RMS envelope
    num_frames = len(y) // window_samples
    if num_frames < 2:
        return {
            "burst_energy": 0,
            "touch_quality": "unknown",
            "label": "Too Short",
            "feedback": "Need longer audio sample",
            "color": "slate",
            "num_bursts": 0
        }
    
    rms_envelope = np.zeros(num_frames)
    for i in range(num_frames):
        frame = y[i * window_samples:(i + 1) * window_samples]
        rms_envelope[i] = np.sqrt(np.mean(frame ** 2))
    
    # Compute derivative (rate of change)
    rms_diff = np.diff(rms_envelope)
    
    # Detect bursts: rapid increases in amplitude
    burst_threshold = np.std(rms_diff) * 2  # 2 std above mean change
    burst_indices = np.where(rms_diff > burst_threshold)[0]
    
    # Calculate average burst energy
    if len(burst_indices) > 0:
        burst_energies = rms_diff[burst_indices]
        avg_burst_energy = np.mean(burst_energies)
        max_burst_energy = np.max(burst_energies)
        
        # Normalize to 0-100 scale
        # Typical burst energy ranges from ~0.01 (soft) to ~0.5 (hard)
        normalized_energy = min(100, (max_burst_energy / 0.3) * 100)
    else:
        avg_burst_energy = 0
        max_burst_energy = 0
        normalized_energy = 0
    
    # Classify touch quality
    if normalized_energy > 70:
        quality = "hard"
    elif normalized_energy > 40:
        quality = "medium"
    else:
        quality = "soft"
    
    zone = TOUCH_QUALITY_ZONES[quality]
    
    return {
        "burst_energy": float(round(normalized_energy, 1)),
        "avg_burst_energy": float(round(avg_burst_energy, 4)),
        "max_burst_energy": float(round(max_burst_energy, 4)),
        "touch_quality": quality,
        "label": zone["label"],
        "feedback": zone["feedback"],
        "color": zone["color"],
        "num_bursts": int(len(burst_indices))
    }


def analyze_phrase_ending(y, sr, analysis_window_ms=200):
    """
    Analyze amplitude decay at phrase ending for open vs closed quality.
    
    Per research: Closing the mouth too early creates "cave-like, dark sound"
    and "abrupt blunt endings". The goal is to keep sound "alive" with 
    gradual decay (open mouth posture).
    
    Args:
        y: Audio signal
        sr: Sample rate
        analysis_window_ms: Window at end of phrase to analyze (ms)
    
    Returns:
        dict: Ending quality with decay_rate, quality, and feedback
    """
    analysis_samples = int(analysis_window_ms / 1000 * sr)
    
    if len(y) < analysis_samples:
        return {
            "decay_rate": 0,
            "decay_time_ms": 0,
            "ending_quality": "unknown",
            "label": "Too Short",
            "feedback": "Need longer audio sample",
            "color": "slate"
        }
    
    # Take last portion of audio
    ending_segment = y[-analysis_samples:]
    
    # Compute RMS envelope (10ms windows)
    window_samples = int(0.01 * sr)
    if window_samples < 1:
        window_samples = 1
    
    num_frames = len(ending_segment) // window_samples
    if num_frames < 3:
        return {
            "decay_rate": 0,
            "decay_time_ms": 0,
            "ending_quality": "unknown",
            "label": "Too Short",
            "feedback": "Need longer audio sample",
            "color": "slate"
        }
    
    rms_envelope = np.zeros(num_frames)
    for i in range(num_frames):
        frame = ending_segment[i * window_samples:(i + 1) * window_samples]
        rms_envelope[i] = np.sqrt(np.mean(frame ** 2))
    
    # Find the decay: from peak to floor
    peak_idx = np.argmax(rms_envelope)
    peak_val = rms_envelope[peak_idx]
    
    if peak_val < 0.01:  # Too quiet
        return {
            "decay_rate": 0,
            "decay_time_ms": 0,
            "ending_quality": "unknown",
            "label": "Too Quiet",
            "feedback": "Speak louder at phrase end",
            "color": "slate"
        }
    
    # Find time to decay to 10% of peak (or end of segment)
    threshold = peak_val * 0.1
    decay_end_idx = len(rms_envelope) - 1
    
    for i in range(peak_idx + 1, len(rms_envelope)):
        if rms_envelope[i] < threshold:
            decay_end_idx = i
            break
    
    # Calculate decay time in ms
    decay_frames = decay_end_idx - peak_idx
    decay_time_ms = decay_frames * (window_samples / sr) * 1000
    
    # Calculate decay rate (amplitude drop per ms)
    if decay_time_ms > 0:
        amplitude_drop = peak_val - rms_envelope[decay_end_idx]
        decay_rate = amplitude_drop / decay_time_ms
    else:
        decay_rate = 1.0  # Instant cutoff
    
    # Classify ending quality
    # Gradual: decay > 80ms, low rate
    # Abrupt: decay < 30ms, high rate
    if decay_time_ms >= 80:
        quality = "gradual"
    elif decay_time_ms >= 40:
        quality = "moderate"
    else:
        quality = "abrupt"
    
    zone = ENDING_QUALITY_ZONES[quality]
    
    # Normalize decay rate to 0-100 (inverted: lower = better)
    # Rate of ~0.001 is gradual, ~0.01 is abrupt
    normalized_rate = min(100, (decay_rate / 0.01) * 100)
    openness_score = 100 - normalized_rate  # Higher = more open/gradual
    openness_score = max(0, min(100, openness_score))
    
    return {
        "decay_rate": float(round(decay_rate, 6)),
        "decay_time_ms": float(round(decay_time_ms, 1)),
        "openness_score": float(round(openness_score, 1)),
        "ending_quality": quality,
        "label": zone["label"],
        "feedback": zone["feedback"],
        "color": zone["color"]
    }


# ----------------------
# Laryngeal Register Engine (M0-M3)
# Based on "Registers—The Snake Pit of Voice Pedagogy"
# ----------------------

REGISTER_DEFINITIONS = {
    "M0": {"label": "Pulse / Fry (M0)", "description": "Slack folds, low pressure, <70Hz", "color": "purple"},
    "M1": {"label": "Chest / Modal (M1)", "description": "Thick folds, TA dominant, rich harmonics", "color": "amber"},
    "M2": {"label": "Head / Falsetto (M2)", "description": "Thin folds, CT dominant, fewer harmonics", "color": "blue"},
    "M3": {"label": "Whistle (M3)", "description": "Very stiff/damped folds, sine-wave like, >1000Hz", "color": "cyan"},
    "Mix": {"label": "Mix / Passaggio", "description": "Blending M1 and M2 characteristics", "color": "green"},
    "Strain": {"label": "Pressed Voice ⚠️", "description": "Potential strain detected! Reduce pressure.", "color": "red"}
}

def classify_laryngeal_mechanism(f0, spectral_slope, jitter, hnr):
    """
    Classify voice into M0-M3 mechanisms based on physiological acoustic markers.
    
    Logic:
    - M0: F0 < 70 Hz
    - M3: F0 > 1000 Hz
    - M1: Slope > -9 dB/oct (Flatter tilt, more harmonics)
    - M2: Slope < -15 dB/oct (Steeper tilt, fewer harmonics)
    - Mix: Slope between -9 and -15 dB/oct
    
    Safety:
    - Strain: High energy (Slope > -6) AND High Jitter (> 1.5%) -> Pressed
    
    Args:
        f0: Fundamental frequency (Hz)
        spectral_slope: Spectral tilt in dB/octave
        jitter: Jitter percentage (0-100, e.g. 1.5)
        hnr: Harmonics-to-Noise Ratio (dB)
        
    Returns:
        dict: Register classification with mechanism, label, description, color
    """
    # 1. M0 Check (Pulse)
    if f0 > 0 and f0 < 70:
        return {
            "mechanism": "M0",
            **REGISTER_DEFINITIONS["M0"],
            "confidence": 0.9,
            "mix_ratio": 0
        }
        
    # 2. M3 Check (Whistle)
    # Whistle is high pitch (>1000Hz)
    if f0 > 1000:
        return {
            "mechanism": "M3",
            **REGISTER_DEFINITIONS["M3"],
            "confidence": 0.85,
            "mix_ratio": 0
        }
        
    # 3. M1 vs M2 vs Mix (based on Spectral Slope)
    # Note: Spectral slope values depend on calculation method. 
    # Here assuming standard dB/octave where 
    # M1 (Rich) is flatter (closer to 0, e.g. -6)
    # M2 (Thin) is steeper (more negative, e.g. -18)
    
    # Check for Pressed/Strain first
    # Defined as M1 characteristics (very flat slope) but with instability (Jitter)
    # or just extreme subharmonic energy (not calculated here, using jitter as proxy)
    if spectral_slope > -5 and jitter > 1.2:
         return {
            "mechanism": "Strain",
            **REGISTER_DEFINITIONS["Strain"],
            "confidence": 0.8,
            "mix_ratio": 100
        }
    
    # Thresholds adapted for smartphone microphne physics
    M1_THRESHOLD = -9.0
    M2_THRESHOLD = -15.0
    
    if spectral_slope > M1_THRESHOLD: 
        return {
            "mechanism": "M1",
            **REGISTER_DEFINITIONS["M1"],
            "confidence": 0.9,
            "mix_ratio": 100
        }
        
    elif spectral_slope < M2_THRESHOLD:
         return {
            "mechanism": "M2",
            **REGISTER_DEFINITIONS["M2"],
            "confidence": 0.9,
            "mix_ratio": 0
        }
        
    else:
        # Between thresholds is the mixing zone
        # Calculate % M1 (Linear interpolation)
        # Ratio = (Slope - M2_Thresh) / (M1_Thresh - M2_Thresh)
        # Example: Slope = -12. (-12 - (-15)) / (-9 - (-15)) = 3 / 6 = 0.5 -> 50% Mix
        
        range_span = M1_THRESHOLD - M2_THRESHOLD
        dist_from_m2 = spectral_slope - M2_THRESHOLD
        mix_ratio = (dist_from_m2 / range_span) * 100
        mix_ratio = max(0, min(100, mix_ratio))
        
        return {
            "mechanism": "Mix",
            **REGISTER_DEFINITIONS["Mix"],
            "mix_ratio": float(round(mix_ratio, 1)),
            "confidence": 0.7
        }




def clean_audio_signal(y, sr):
    if scipy is None or not _deps_available:
        return y
    try:
        return scipy.signal.wiener(y)
    except Exception:
        return y

