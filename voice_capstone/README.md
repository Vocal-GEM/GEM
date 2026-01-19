# Acoustic Analysis of Gender-Affirming Voice Modification

Analyzing acoustic features that correspond to pitch, resonance, and weight in gender-affirming voice training using the Versatile Voice Dataset.

## Project Structure

```
voice_capstone/
├── data/
│   ├── raw_audio/          # VVD audio files (download manually)
│   └── processed/          # Extracted features CSV
├── notebooks/
│   └── 01_exploration.ipynb
├── scripts/
│   ├── extract_features.py
│   └── analyze.py
├── visualizations/
├── docs/
│   └── case_study.md
├── README.md
└── requirements.txt
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Download the VVD Audio Files

The Versatile Voice Dataset audio files must be downloaded manually from:
**https://berkeley-speech-group.github.io/VersatileVoiceDataset/**

**How to download:**
1. Visit the website above
2. Right-click on each audio player → "Save audio as..."
3. Save files to `data/raw_audio/` using this naming convention:

```
{speaker}_{pitch}_{resonance}_{weight}_{sentence}.wav

Examples:
001_high_high_low_bluespot.wav
001_high_high_low_howhard.wav
002_high_high_low_bluespot.wav
...
```

**Configuration key:**
| L1-Distance | Pitch  | Resonance | Weight |
|-------------|--------|-----------|--------|
| 0           | High   | High      | Low    |
| 1           | High   | Medium    | Low    |
| 2           | Medium | Medium    | Low    |
| 3           | Medium | Medium    | Medium |
| 4           | Low    | Medium    | Medium |
| 5           | Low    | Low       | Medium |
| 6           | Low    | Low       | High   |

**Speakers:** 001, 002, 003
**Sentences:** "The blue spot is on the key again" (bluespot), "How hard did he hit him?" (howhard)

Total files: 3 speakers × 7 configurations × 2 sentences = **42 audio files**

### 3. Run Feature Extraction

```bash
python scripts/extract_features.py
```

This creates `data/processed/acoustic_features.csv`

### 4. Run Analysis

```bash
python scripts/analyze.py
```

## Research Question

**Which acoustic features most strongly differentiate between pitch, resonance, and weight levels in voice modification, and can we identify measurable thresholds that correspond to perceptual milestones?**

## Key Acoustic Features

| Feature | Perceptual Correlate | Expected Pattern |
|---------|---------------------|------------------|
| F0 (fundamental frequency) | Pitch | Higher F0 → higher perceived pitch |
| F1-F4 (formants) | Resonance | Higher formants → brighter resonance |
| HNR (harmonics-to-noise) | Weight | Higher HNR → lighter/breathier |

## Tools Used

- **Python** - Data processing and analysis
- **Parselmouth** - Praat wrapper for acoustic extraction
- **Pandas** - Data manipulation
- **Matplotlib/Seaborn** - Visualization
- **Tableau** - Interactive dashboard

## Author

[Your Name] - Google Data Analytics Certificate Capstone Project

## References

- Södersten et al. (2024). Gender-Affirming Voice Training for Trans Women: Acoustic Outcomes
- Berkeley Speech Group. Versatile Voice Dataset.
- Leyns et al. (2024). Long-term Acoustic Effects of Gender-Affirming Voice Training
