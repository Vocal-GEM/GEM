"""
Feature Extraction Script for Voice Capstone Project
=====================================================
Extracts acoustic features from VVD audio files using Parselmouth (Praat)

Usage:
    python extract_features.py

Output:
    data/processed/acoustic_features.csv
"""

import os
import re
import pandas as pd
import parselmouth
from parselmouth.praat import call

# Configuration
RAW_AUDIO_DIR = "data/raw_audio"
OUTPUT_FILE = "data/processed/acoustic_features.csv"


def extract_features(audio_path):
    """
    Extract acoustic features from a single audio file.
    
    Parameters:
        audio_path (str): Path to .wav file
        
    Returns:
        dict: Extracted acoustic features
    """
    try:
        # Load audio
        sound = parselmouth.Sound(audio_path)
        
        # --- PITCH (F0) EXTRACTION ---
        # Using wider range to capture both masculine and feminine voices
        pitch = call(sound, "To Pitch", 0.0, 75, 600)
        
        f0_mean = call(pitch, "Get mean", 0, 0, "Hertz")
        f0_min = call(pitch, "Get minimum", 0, 0, "Hertz", "Parabolic")
        f0_max = call(pitch, "Get maximum", 0, 0, "Hertz", "Parabolic")
        f0_std = call(pitch, "Get standard deviation", 0, 0, "Hertz")
        
        # --- FORMANT EXTRACTION (Resonance markers) ---
        formant = call(sound, "To Formant (burg)", 0.0, 5, 5500, 0.025, 50)
        
        f1_mean = call(formant, "Get mean", 1, 0, 0, "Hertz")
        f2_mean = call(formant, "Get mean", 2, 0, 0, "Hertz")
        f3_mean = call(formant, "Get mean", 3, 0, 0, "Hertz")
        f4_mean = call(formant, "Get mean", 4, 0, 0, "Hertz")
        
        # Average formant (simplified resonance measure)
        avg_formant = (f1_mean + f2_mean + f3_mean) / 3
        
        # --- VOICE QUALITY (Weight/breathiness markers) ---
        harmonicity = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
        hnr = call(harmonicity, "Get mean", 0, 0)
        
        # --- INTENSITY ---
        intensity = call(sound, "To Intensity", 75, 0, "yes")
        intensity_mean = call(intensity, "Get mean", 0, 0, "dB")
        
        # --- JITTER & SHIMMER (voice stability) ---
        point_process = call(sound, "To PointProcess (periodic, cc)", 75, 600)
        jitter = call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
        shimmer = call([sound, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
        
        return {
            'f0_mean': round(f0_mean, 2) if f0_mean else None,
            'f0_min': round(f0_min, 2) if f0_min else None,
            'f0_max': round(f0_max, 2) if f0_max else None,
            'f0_std': round(f0_std, 2) if f0_std else None,
            'f0_range': round(f0_max - f0_min, 2) if (f0_max and f0_min) else None,
            'f1_mean': round(f1_mean, 2) if f1_mean else None,
            'f2_mean': round(f2_mean, 2) if f2_mean else None,
            'f3_mean': round(f3_mean, 2) if f3_mean else None,
            'f4_mean': round(f4_mean, 2) if f4_mean else None,
            'avg_formant': round(avg_formant, 2) if avg_formant else None,
            'hnr': round(hnr, 2) if hnr else None,
            'intensity_mean': round(intensity_mean, 2) if intensity_mean else None,
            'jitter_local': round(jitter * 100, 4) if jitter else None,  # as percentage
            'shimmer_local': round(shimmer * 100, 4) if shimmer else None,  # as percentage
        }
        
    except Exception as e:
        print(f"Error processing {audio_path}: {e}")
        return None


def parse_filename(filename):
    """
    Parse metadata from filename.
    Expected format: {speaker}_{pitch}_{resonance}_{weight}_{sentence}.wav
    Example: 001_high_high_low_bluespot.wav
    """
    # Remove extension
    name = os.path.splitext(filename)[0]
    parts = name.split('_')
    
    if len(parts) >= 5:
        return {
            'speaker': parts[0],
            'pitch_level': parts[1],
            'resonance_level': parts[2],
            'weight_level': parts[3],
            'sentence': parts[4]
        }
    else:
        # Try to infer from filename if different format
        return {
            'speaker': 'unknown',
            'pitch_level': 'unknown',
            'resonance_level': 'unknown',
            'weight_level': 'unknown',
            'sentence': name
        }


def calculate_l1_distance(pitch, resonance, weight):
    """
    Calculate L1 distance from High-High-Low configuration.
    """
    level_map = {'high': 0, 'medium': 1, 'low': 2}
    
    try:
        pitch_dist = abs(level_map.get(pitch.lower(), 0) - 0)  # high = 0
        resonance_dist = abs(level_map.get(resonance.lower(), 0) - 0)  # high = 0
        weight_dist = abs(level_map.get(weight.lower(), 0) - 2)  # low = 2
        return pitch_dist + resonance_dist + weight_dist
    except:
        return None


def main():
    """Main extraction pipeline."""
    
    print("=" * 50)
    print("Voice Feature Extraction Pipeline")
    print("=" * 50)
    
    # Check for audio files
    if not os.path.exists(RAW_AUDIO_DIR):
        print(f"\n❌ Directory not found: {RAW_AUDIO_DIR}")
        print("Please create the directory and add audio files.")
        print("See README.md for download instructions.")
        return
    
    audio_files = [f for f in os.listdir(RAW_AUDIO_DIR) if f.endswith('.wav')]
    
    if not audio_files:
        print(f"\n❌ No .wav files found in {RAW_AUDIO_DIR}")
        print("Please download VVD audio files first.")
        print("See README.md for instructions.")
        return
    
    print(f"\n✓ Found {len(audio_files)} audio files")
    
    # Process each file
    results = []
    
    for i, filename in enumerate(sorted(audio_files)):
        filepath = os.path.join(RAW_AUDIO_DIR, filename)
        print(f"Processing [{i+1}/{len(audio_files)}]: {filename}")
        
        # Extract features
        features = extract_features(filepath)
        
        if features:
            # Add metadata
            metadata = parse_filename(filename)
            features.update(metadata)
            features['filename'] = filename
            features['l1_distance'] = calculate_l1_distance(
                metadata['pitch_level'],
                metadata['resonance_level'],
                metadata['weight_level']
            )
            results.append(features)
    
    # Create DataFrame and save
    if results:
        df = pd.DataFrame(results)
        
        # Reorder columns
        col_order = [
            'filename', 'speaker', 'pitch_level', 'resonance_level', 
            'weight_level', 'l1_distance', 'sentence',
            'f0_mean', 'f0_min', 'f0_max', 'f0_std', 'f0_range',
            'f1_mean', 'f2_mean', 'f3_mean', 'f4_mean', 'avg_formant',
            'hnr', 'intensity_mean', 'jitter_local', 'shimmer_local'
        ]
        df = df[[c for c in col_order if c in df.columns]]
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        # Save
        df.to_csv(OUTPUT_FILE, index=False)
        
        print(f"\n✓ Saved {len(df)} records to {OUTPUT_FILE}")
        print("\n--- Summary Statistics ---")
        print(df[['f0_mean', 'avg_formant', 'hnr']].describe())
    else:
        print("\n❌ No features extracted. Check audio files.")


if __name__ == "__main__":
    main()
