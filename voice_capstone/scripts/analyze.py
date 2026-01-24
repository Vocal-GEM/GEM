"""
Analysis Script for Voice Capstone Project
===========================================
Analyzes extracted acoustic features to answer research questions.

Usage:
    python analyze.py

Prerequisites:
    Run extract_features.py first to generate acoustic_features.csv
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Configuration
INPUT_FILE = "data/processed/acoustic_features.csv"
VIZ_DIR = "visualizations"

# Set style
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")


def load_data():
    """Load and validate the extracted features."""
    if not os.path.exists(INPUT_FILE):
        print(f"❌ File not found: {INPUT_FILE}")
        print("Run extract_features.py first.")
        return None
    
    df = pd.read_csv(INPUT_FILE)
    print(f"✓ Loaded {len(df)} records")
    return df


def analyze_pitch_correlation(df):
    """
    Research Question 1: 
    Does F0 correlate with pitch level?
    """
    print("\n" + "="*50)
    print("ANALYSIS 1: F0 vs Pitch Level")
    print("="*50)
    
    # Group statistics
    pitch_stats = df.groupby('pitch_level')['f0_mean'].agg(['mean', 'std', 'count'])
    print("\nF0 Mean by Pitch Level:")
    print(pitch_stats)
    
    # ANOVA test
    groups = [group['f0_mean'].dropna() for name, group in df.groupby('pitch_level')]
    if len(groups) >= 2 and all(len(g) > 0 for g in groups):
        f_stat, p_value = stats.f_oneway(*groups)
        print(f"\nANOVA: F={f_stat:.2f}, p={p_value:.4f}")
        print("Significant difference!" if p_value < 0.05 else "No significant difference")
    
    return pitch_stats


def analyze_resonance_correlation(df):
    """
    Research Question 2:
    Do formants correlate with resonance level?
    """
    print("\n" + "="*50)
    print("ANALYSIS 2: Formants vs Resonance Level")
    print("="*50)
    
    resonance_stats = df.groupby('resonance_level')['avg_formant'].agg(['mean', 'std', 'count'])
    print("\nAvg Formant by Resonance Level:")
    print(resonance_stats)
    
    # Individual formants
    for formant in ['f1_mean', 'f2_mean', 'f3_mean']:
        if formant in df.columns:
            print(f"\n{formant} by Resonance Level:")
            print(df.groupby('resonance_level')[formant].mean())
    
    return resonance_stats


def analyze_weight_correlation(df):
    """
    Research Question 3:
    Does HNR correlate with weight level?
    """
    print("\n" + "="*50)
    print("ANALYSIS 3: HNR vs Weight Level")
    print("="*50)
    
    weight_stats = df.groupby('weight_level')['hnr'].agg(['mean', 'std', 'count'])
    print("\nHNR by Weight Level:")
    print(weight_stats)
    
    return weight_stats


def analyze_l1_distance_trajectory(df):
    """
    Research Question 4:
    How do features change across L1 distance (voice modification spectrum)?
    """
    print("\n" + "="*50)
    print("ANALYSIS 4: Feature Changes Across L1 Distance")
    print("="*50)
    
    trajectory = df.groupby('l1_distance')[['f0_mean', 'avg_formant', 'hnr']].mean()
    print("\nMean Features by L1 Distance:")
    print(trajectory)
    
    # Correlation with L1 distance
    for feature in ['f0_mean', 'avg_formant', 'hnr']:
        if feature in df.columns:
            corr, p = stats.pearsonr(
                df['l1_distance'].dropna(), 
                df[feature].dropna()
            )
            print(f"\n{feature} correlation with L1 distance: r={corr:.3f}, p={p:.4f}")
    
    return trajectory


def analyze_speaker_variation(df):
    """
    Research Question 5:
    How consistently do speakers produce similar acoustic profiles?
    """
    print("\n" + "="*50)
    print("ANALYSIS 5: Inter-Speaker Variation")
    print("="*50)
    
    # Coefficient of variation by configuration
    speaker_var = df.groupby(['pitch_level', 'resonance_level', 'weight_level'])['f0_mean'].agg(['mean', 'std'])
    speaker_var['cv'] = (speaker_var['std'] / speaker_var['mean'] * 100).round(2)
    print("\nF0 Coefficient of Variation by Configuration:")
    print(speaker_var)
    
    return speaker_var


def create_visualizations(df):
    """Generate all visualizations for the case study."""
    
    os.makedirs(VIZ_DIR, exist_ok=True)
    
    # 1. F0 by Pitch Level (Box Plot)
    fig, ax = plt.subplots(figsize=(8, 6))
    order = ['high', 'medium', 'low']
    available_order = [o for o in order if o in df['pitch_level'].unique()]
    sns.boxplot(data=df, x='pitch_level', y='f0_mean', order=available_order, ax=ax)
    ax.axhline(y=170, color='red', linestyle='--', label='Feminine threshold (170 Hz)')
    ax.set_xlabel('Pitch Level')
    ax.set_ylabel('F0 Mean (Hz)')
    ax.set_title('Fundamental Frequency by Pitch Level')
    ax.legend()
    plt.tight_layout()
    plt.savefig(f'{VIZ_DIR}/f0_by_pitch.png', dpi=150)
    plt.close()
    print(f"✓ Saved {VIZ_DIR}/f0_by_pitch.png")
    
    # 2. Formants by Resonance Level
    fig, ax = plt.subplots(figsize=(8, 6))
    available_order = [o for o in order if o in df['resonance_level'].unique()]
    sns.boxplot(data=df, x='resonance_level', y='avg_formant', order=available_order, ax=ax)
    ax.set_xlabel('Resonance Level')
    ax.set_ylabel('Average Formant Frequency (Hz)')
    ax.set_title('Formant Frequencies by Resonance Level')
    plt.tight_layout()
    plt.savefig(f'{VIZ_DIR}/formants_by_resonance.png', dpi=150)
    plt.close()
    print(f"✓ Saved {VIZ_DIR}/formants_by_resonance.png")
    
    # 3. HNR by Weight Level
    fig, ax = plt.subplots(figsize=(8, 6))
    weight_order = ['low', 'medium', 'high']
    available_order = [o for o in weight_order if o in df['weight_level'].unique()]
    sns.boxplot(data=df, x='weight_level', y='hnr', order=available_order, ax=ax)
    ax.set_xlabel('Weight Level')
    ax.set_ylabel('Harmonics-to-Noise Ratio (dB)')
    ax.set_title('Voice Quality (HNR) by Weight Level')
    plt.tight_layout()
    plt.savefig(f'{VIZ_DIR}/hnr_by_weight.png', dpi=150)
    plt.close()
    print(f"✓ Saved {VIZ_DIR}/hnr_by_weight.png")
    
    # 4. Feature Trajectory Across L1 Distance
    fig, axes = plt.subplots(1, 3, figsize=(14, 5))
    
    trajectory = df.groupby('l1_distance')[['f0_mean', 'avg_formant', 'hnr']].mean()
    
    axes[0].plot(trajectory.index, trajectory['f0_mean'], 'o-', linewidth=2, markersize=8)
    axes[0].set_xlabel('L1 Distance')
    axes[0].set_ylabel('F0 Mean (Hz)')
    axes[0].set_title('Pitch (F0)')
    axes[0].axhline(y=170, color='red', linestyle='--', alpha=0.5)
    
    axes[1].plot(trajectory.index, trajectory['avg_formant'], 's-', linewidth=2, markersize=8, color='green')
    axes[1].set_xlabel('L1 Distance')
    axes[1].set_ylabel('Avg Formant (Hz)')
    axes[1].set_title('Resonance (Formants)')
    
    axes[2].plot(trajectory.index, trajectory['hnr'], '^-', linewidth=2, markersize=8, color='purple')
    axes[2].set_xlabel('L1 Distance')
    axes[2].set_ylabel('HNR (dB)')
    axes[2].set_title('Weight (HNR)')
    
    fig.suptitle('Acoustic Features Across Voice Modification Spectrum', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(f'{VIZ_DIR}/feature_trajectory.png', dpi=150)
    plt.close()
    print(f"✓ Saved {VIZ_DIR}/feature_trajectory.png")
    
    # 5. Correlation Heatmap
    fig, ax = plt.subplots(figsize=(10, 8))
    
    numeric_cols = ['f0_mean', 'f0_range', 'f1_mean', 'f2_mean', 'f3_mean', 
                    'avg_formant', 'hnr', 'intensity_mean', 'l1_distance']
    available_cols = [c for c in numeric_cols if c in df.columns]
    
    corr_matrix = df[available_cols].corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, 
                fmt='.2f', ax=ax, square=True)
    ax.set_title('Feature Correlation Matrix')
    plt.tight_layout()
    plt.savefig(f'{VIZ_DIR}/correlation_heatmap.png', dpi=150)
    plt.close()
    print(f"✓ Saved {VIZ_DIR}/correlation_heatmap.png")
    
    # 6. Speaker Comparison
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.scatterplot(data=df, x='f0_mean', y='avg_formant', hue='speaker', 
                    style='pitch_level', s=100, ax=ax)
    ax.set_xlabel('F0 Mean (Hz)')
    ax.set_ylabel('Average Formant (Hz)')
    ax.set_title('Speaker Acoustic Profiles')
    ax.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(f'{VIZ_DIR}/speaker_comparison.png', dpi=150)
    plt.close()
    print(f"✓ Saved {VIZ_DIR}/speaker_comparison.png")


def main():
    """Run full analysis pipeline."""
    
    print("=" * 50)
    print("Voice Acoustic Analysis Pipeline")
    print("=" * 50)
    
    # Load data
    df = load_data()
    if df is None:
        return
    
    # Run analyses
    analyze_pitch_correlation(df)
    analyze_resonance_correlation(df)
    analyze_weight_correlation(df)
    analyze_l1_distance_trajectory(df)
    analyze_speaker_variation(df)
    
    # Create visualizations
    print("\n" + "="*50)
    print("GENERATING VISUALIZATIONS")
    print("="*50)
    create_visualizations(df)
    
    print("\n" + "="*50)
    print("✓ Analysis Complete!")
    print(f"Visualizations saved to {VIZ_DIR}/")
    print("="*50)


if __name__ == "__main__":
    main()
