import numpy as np
import parselmouth
from parselmouth.praat import call
import soundfile as sf
import scipy.signal

# ----------------------
# Goal presets
# ----------------------

GOAL_PRESETS = {
    "transfem_soft_slightly_breathy": {
        "label": "Transfeminine – soft, slightly breathy",
        "breathiness_range": (45, 75),
        "roughness_range": (0, 30),
        "strain_range": (0, 40),
        "cpp_range": (3.0, 8.0),
        "hnr_min": 10.0,
        "rbi_range": (55, 75), # Soft bright
    },
    "clean_smooth": {
        "label": "Clean, smooth",
        "breathiness_range": (20, 50),
        "roughness_range": (0, 30),
        "strain_range": (0, 40),
        "cpp_range": (3.5, 10.0),
        "hnr_min": 12.0,
        "rbi_range": (45, 65), # Neutral to slightly bright
    },
    "light_and_bright": {
        "label": "Light and bright",
        "breathiness_range": (30, 60),
        "roughness_range": (0, 30),
        "strain_range": (20, 60),
        "cpp_range": (4.0, 10.0),
        "hnr_min": 12.0,
        "rbi_range": (65, 85), # Bright target
    },
    "transfem_bright_forward": {
        "label": "Transfeminine – Bright & Forward",
        "breathiness_range": (30, 60),
        "roughness_range": (0, 30),
        "strain_range": (10, 50),
        "cpp_range": (3.5, 9.0),
        "hnr_min": 11.0,
        "rbi_range": (60, 80), # The "Sweet Spot"
    },
    "androgynous_neutral": {
        "label": "Androgynous / Neutral",
        "breathiness_range": (20, 50),
        "roughness_range": (0, 30),
        "strain_range": (10, 50),
        "cpp_range": (4.0, 9.0),
        "hnr_min": 12.0,
        "rbi_range": (40, 60),
    },
    "soft_light_resonance": {
        "label": "Soft Light Resonance",
        "breathiness_range": (40, 70),
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
# RBI Implementation
# ----------------------

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

def compute_rbi_series(y, sr, frame_length_s=0.04, hop_length_s=0.01):
    """
    Compute RBI for the entire file using the 3-pass approach.
    """
    # Pre-processing
    y_pre = pre_emphasis(y)
    
    # Frame generator
    frame_len = int(frame_length_s * sr)
    hop_len = int(hop_length_s * sr)
    
    # Pitch tracking for the whole file
    sound = parselmouth.Sound(y, sr)
    pitch_obj = sound.to_pitch(time_step=hop_length_s, pitch_floor=75, pitch_ceiling=600)
    
    raw_features = []
    valid_indices = []
    
    # Pass 1: Extract Raw Features
    idx = 0
    times = []
    
    for start in range(0, len(y_pre) - frame_len, hop_len):
        end = start + frame_len
        frame = y_pre[start:end]
        t = start / sr
        times.append(t)
        
        # RMS Gate
        rms = np.sqrt(np.mean(frame**2))
        energy_db = 20 * np.log10(rms + 1e-9)
        
        # F0 Gate
        f0 = pitch_obj.get_value_at_time(t + frame_length_s/2)
        if np.isnan(f0): f0 = 0
        
        # Validity check
        # Thresholds: Energy > -50dB (relative? let's use absolute for now or dynamic)
        # For simplicity, let's assume normalized audio and use -40dB
        is_voiced = (energy_db > -40) and (f0 > 80) and (f0 < 400)
        
        if is_voiced:
            ratio, cent, tilt = compute_raw_rbi_features(frame, sr, f0)
            raw_features.append({
                "ratio": ratio,
                "centroid": cent,
                "tilt": tilt,
                "f0": f0,
                "idx": idx
            })
            valid_indices.append(idx)
        
        idx += 1
        
    # Pass 2: Global Stats
    if not raw_features:
        return [None] * idx # Return all Nones
        
    ratios = [f["ratio"] for f in raw_features]
    centroids = [f["centroid"] for f in raw_features]
    tilts = [f["tilt"] for f in raw_features]
    
    stats = {
        "ratio_min": np.min(ratios), "ratio_max": np.max(ratios),
        "centroid_min": np.min(centroids), "centroid_max": np.max(centroids),
        "tilt_min": np.min(tilts), "tilt_max": np.max(tilts)
    }
    
    # Pass 3: Normalize and Compute RBI
    rbi_values = [None] * idx
    
    def norm(val, vmin, vmax):
        if vmax <= vmin: return 0.5
        return np.clip((val - vmin) / (vmax - vmin + 1e-9), 0.0, 1.0)
    
    last_rbi = 50.0 # Start neutral
    
    # Map valid indices back to full timeline
    feature_map = {f["idx"]: f for f in raw_features}
    
    for i in range(idx):
        if i in feature_map:
            f = feature_map[i]
            
            r_norm = norm(f["ratio"], stats["ratio_min"], stats["ratio_max"])
            c_norm = norm(f["centroid"], stats["centroid_min"], stats["centroid_max"])
            t_norm = norm(f["tilt"], stats["tilt_min"], stats["tilt_max"])
            
            f0_clip = min(max(f["f0"], 120), 300)
            f0_norm = (f0_clip - 120) / (300 - 120)
            
            # Weighted Sum
            # Weights: Ratio 0.4, Centroid 0.25, Tilt 0.25, F0 0.1
            raw_score = (0.4 * r_norm) + (0.25 * c_norm) + (0.25 * t_norm) + (0.10 * f0_norm)
            current_rbi = np.clip(raw_score * 100, 0, 100)
            
            # Smoothing (EMA)
            alpha = 0.2
            smoothed_rbi = (alpha * current_rbi) + ((1 - alpha) * last_rbi)
            last_rbi = smoothed_rbi
            
            rbi_values[i] = smoothed_rbi
        else:
            # Decay or hold? User suggested hold or decay. Let's hold for short gaps, decay for long.
            # For simplicity, just hold last valid for now to avoid dropping to 0
            rbi_values[i] = last_rbi # Or None if we want to show gaps
            
    return rbi_values, stats

# ----------------------
# Main Analysis
# ----------------------

def classify_voice_quality(cpp, hnr, h1_h2, jitter, shimmer, rbi_mean=None):
    breathiness_score = 0
    strain_score = 0
    roughness_score = 0

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

    return {
        "breathiness_score": int(breathiness_score),
        "roughness_score": int(roughness_score),
        "strain_score": int(strain_score),
        "rbi_score": int(rbi_mean) if rbi_mean is not None else 0,
        "overall_label": label,
        "resonance_label": resonance_label
    }

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
    y, sr = load_audio(path) # 16kHz
    
    # Standard metrics
    sound = parselmouth.Sound(y, sr)
    cpp = compute_cpp_praat(sound)
    hnr = compute_hnr(sound)
    jitter, shimmer = compute_jitter_shimmer(sound)
    f0_mean, f0_range = compute_f0_stats(sound)
    h1_h2 = compute_spectral_tilt_h1_h2(y, sr, f0_mean)
    
    # RBI Analysis
    rbi_series, rbi_stats = compute_rbi_series(y, sr)
    
    # Mean RBI (ignoring Nones)
    valid_rbis = [x for x in rbi_series if x is not None]
    rbi_mean = float(np.mean(valid_rbis)) if valid_rbis else 0.0
    
    summary = classify_voice_quality(cpp, hnr, h1_h2, jitter, shimmer, rbi_mean)
    
    features_global = {
        "cpp_mean": float(cpp),
        "hnr_mean": float(hnr),
        "h1_h2_mean": float(h1_h2),
        "jitter_percent": float(jitter),
        "shimmer_percent": float(shimmer),
        "f0_mean_hz": f0_mean,
        "f0_range_hz": f0_range,
        "rbi_mean": rbi_mean
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
