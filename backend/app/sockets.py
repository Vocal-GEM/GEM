from flask import request
from flask_socketio import emit
from flask_login import current_user
from .voice_quality_analysis import (
    compute_frame_features,
    compute_chunk_scores_from_frames,
    compute_raw_rbi_features,
    pre_emphasis,
    classify_laryngeal_mechanism,
    analyze_consonant_burst,
    analyze_phrase_ending
)
from .extensions import socketio
import time

try:
    import numpy as np
    import scipy.signal
    _deps_available = True
except ImportError:
    _deps_available = False
    np = None
    scipy = None

# In-memory buffer per client
CLIENT_BUFFERS = {}
CLIENT_STATS = {}
CLIENT_LAST_RBI = {}

# Rate limiting for WebSocket connections (prevents DoS)
CLIENT_RATE_LIMITS = {}
MAX_CHUNKS_PER_SECOND = 50  # Reasonable limit for audio streaming
MAX_CONNECTIONS_PER_IP = 5

TARGET_SR = 16000
MAX_BUFFER_SEC = 3.0

def _append_to_buffer(sid, pcm, sr):
    """
    Append mono float32 PCM to per-client buffer, resampling to TARGET_SR.
    """
    if pcm.ndim > 1:
        pcm = np.mean(pcm, axis=1)

    if sr != TARGET_SR:
        # Resample using scipy
        number_of_samples = int(round(len(pcm) * float(TARGET_SR) / sr))
        pcm = scipy.signal.resample(pcm, number_of_samples)

    buf = CLIENT_BUFFERS.get(sid)
    if buf is None:
        buf = np.zeros(0, dtype=np.float32)

    buf = np.concatenate([buf, pcm.astype(np.float32)], axis=0)

    max_len = int(MAX_BUFFER_SEC * TARGET_SR)
    if buf.size > max_len:
        buf = buf[-max_len:]

    CLIENT_BUFFERS[sid] = buf

def _check_rate_limit(sid):
    """Check if client is within rate limits. Returns True if allowed."""
    now = time.time()
    if sid not in CLIENT_RATE_LIMITS:
        CLIENT_RATE_LIMITS[sid] = {"count": 0, "window_start": now}
        return True

    rate_info = CLIENT_RATE_LIMITS[sid]
    # Reset window if more than 1 second has passed
    if now - rate_info["window_start"] >= 1.0:
        rate_info["count"] = 0
        rate_info["window_start"] = now

    if rate_info["count"] >= MAX_CHUNKS_PER_SECOND:
        return False

    rate_info["count"] += 1
    return True


@socketio.on("connect")
def handle_connect():
    sid = request.sid
    # Initialize client buffers
    CLIENT_BUFFERS[sid] = np.zeros(0, dtype=np.float32)
    CLIENT_STATS[sid] = {
        "ratio_min": None, "ratio_max": None,
        "centroid_min": None, "centroid_max": None,
        "tilt_min": None, "tilt_max": None
    }
    CLIENT_LAST_RBI[sid] = 50.0
    CLIENT_RATE_LIMITS[sid] = {"count": 0, "window_start": time.time()}


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    CLIENT_BUFFERS.pop(sid, None)
    CLIENT_STATS.pop(sid, None)
    CLIENT_LAST_RBI.pop(sid, None)
    CLIENT_RATE_LIMITS.pop(sid, None)

@socketio.on("audio_chunk")
def handle_audio_chunk(data):
    """
    data: dict with keys:
      - 'pcm': binary float32 PCM buffer (mono) or list of floats
      - 'sr': original sample rate (number)
    """
    sid = request.sid

    # Rate limiting to prevent DoS
    if not _check_rate_limit(sid):
        emit("analysis_error", {"error": "Rate limit exceeded. Please slow down."})
        return

    if not _deps_available:
        emit("analysis_error", {"error": "Server missing analysis dependencies."})
        return

    try:
        pcm_bytes = data.get("pcm", None)
        sr = int(data.get("sr", TARGET_SR))
        if pcm_bytes is None:
            emit("analysis_error", {"error": "No PCM data in chunk."})
            return

        if isinstance(pcm_bytes, list):
            pcm = np.array(pcm_bytes, dtype=np.float32)
        else:
            pcm = np.frombuffer(pcm_bytes, dtype=np.float32)

    except Exception as e:
        emit("analysis_error", {"error": f"Failed to parse PCM chunk: {e}"})
        return

    if pcm.size == 0:
        return

    _append_to_buffer(sid, pcm, sr)

    buf = CLIENT_BUFFERS.get(sid)
    if buf is None or buf.size == 0:
        return

    window_sec = 1.0
    n_window = int(window_sec * TARGET_SR)
    
    # Analyze if we have enough data (or just analyze what we have if it's > 0.1s)
    if buf.size < int(0.1 * TARGET_SR):
        return

    # Use up to last 1 second
    window = buf[-n_window:] if buf.size > n_window else buf

    # 1. Standard metrics (CPP, HNR, etc)
    # This also gives us F0 for the window
    frame_data = compute_frame_features(window, TARGET_SR)
    scores = compute_chunk_scores_from_frames(frame_data)

    # 2. Live RBI with global stats
    f0_list = frame_data["f0"]
    
    # NEW: Register & Articulatory Analysis
    f0_mean = float(np.nanmean(f0_list)) if f0_list else 0.0
    spectral_slope = frame_data.get("spectral_slope", -6.0)
    jitter = frame_data.get("jitter", 0.0)
    hnr = frame_data.get("hnr", 20.0)
    
    register = classify_laryngeal_mechanism(f0_mean, spectral_slope, jitter, hnr)
    
    # Analyze raw audio for articulation
    touch = analyze_consonant_burst(window, TARGET_SR)
    ending = analyze_phrase_ending(window, TARGET_SR)
    
    # Pre-emphasis for RBI
    y_pre = pre_emphasis(window)
    hop_len = int(0.01 * TARGET_SR)
    frame_len = int(0.04 * TARGET_SR)
    
    client_stats = CLIENT_STATS.get(sid)
    last_rbi = CLIENT_LAST_RBI.get(sid, 50.0)
    
    rbi_sum = 0
    rbi_count = 0
    
    idx = 0
    for start in range(0, len(y_pre) - frame_len, hop_len):
        if idx >= len(f0_list): break
        
        frame = y_pre[start:start+frame_len]
        f0 = f0_list[idx]
        
        # Gate
        rms = np.sqrt(np.mean(frame**2))
        energy_db = 20 * np.log10(rms + 1e-9)
        is_voiced = (energy_db > -40) and (f0 is not None) and (f0 > 80) and (f0 < 400)
        
        if is_voiced:
            ratio, cent, tilt = compute_raw_rbi_features(frame, TARGET_SR, f0)
            
            # Update stats
            def update(name, val):
                if client_stats[f"{name}_min"] is None: client_stats[f"{name}_min"] = val
                else: client_stats[f"{name}_min"] = min(client_stats[f"{name}_min"], val)
                
                if client_stats[f"{name}_max"] is None: client_stats[f"{name}_max"] = val
                else: client_stats[f"{name}_max"] = max(client_stats[f"{name}_max"], val)
            
            update("ratio", ratio)
            update("centroid", cent)
            update("tilt", tilt)
            
            # Normalize
            def norm(val, name):
                vmin, vmax = client_stats[f"{name}_min"], client_stats[f"{name}_max"]
                if vmin is None or vmax is None or vmax <= vmin: return 0.5
                return np.clip((val - vmin) / (vmax - vmin + 1e-9), 0.0, 1.0)
            
            r_norm = norm(ratio, "ratio")
            c_norm = norm(cent, "centroid")
            t_norm = norm(tilt, "tilt")
            
            f0_clip = min(max(f0, 120), 300)
            f0_norm = (f0_clip - 120) / (180)
            
            raw_score = (0.4 * r_norm) + (0.25 * c_norm) + (0.25 * t_norm) + (0.10 * f0_norm)
            current_rbi = np.clip(raw_score * 100, 0, 100)
            
            # Smooth
            alpha = 0.2
            last_rbi = (alpha * current_rbi) + ((1 - alpha) * last_rbi)
            
            rbi_sum += last_rbi
            rbi_count += 1
            
        idx += 1
        
    CLIENT_STATS[sid] = client_stats
    CLIENT_LAST_RBI[sid] = last_rbi
    
    avg_rbi = rbi_sum / rbi_count if rbi_count > 0 else last_rbi

    emit("analysis_update", {
        "label": scores["label"],
        "breathiness_score": scores["breathiness_score"],
        "roughness_score": scores["roughness_score"],
        "strain_score": scores["strain_score"],
        "cpp_mean": scores["cpp_mean"],
        "hnr_mean": scores["hnr_mean"],
        "h1_h2_mean": scores["h1_h2_mean"],
        "rbi_score": avg_rbi,
        "window_sec": len(window) / TARGET_SR,
        # NEW: Ventricular engagement detection
        "ventricular_detected": scores["ventricular_detected"],
        "ventricular_severity": scores["ventricular_severity"],
        "ventricular_feedback": scores["ventricular_feedback"],
        # NEW: Open Quotient estimation
        "oq_percent": scores["oq_percent"],
        "oq_zone": scores["oq_zone"],
        "oq_feedback": scores["oq_feedback"],
        # NEW: Register & Articulation
        "register": register,
        "touch": touch,
        "ending": ending,
        "spectral_slope": spectral_slope
    })

