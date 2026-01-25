# 🎯 Complete Project Guide: Voice Acoustic Analysis Capstone

Follow these steps from start to finish to complete your capstone project.

---

## Phase 1: Setup (30 minutes)

### Step 1.1: Unzip the Project
```bash
unzip voice_capstone_project.zip
cd voice_capstone
```

### Step 1.2: Create Python Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate     # On Windows
```

### Step 1.3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 1.4: Verify Installation
```bash
python -c "import parselmouth; print('✓ Parselmouth installed')"
python -c "import pandas; print('✓ Pandas installed')"
python -c "import matplotlib; print('✓ Matplotlib installed')"
```

---

## Phase 2: Data Collection (30-45 minutes)

### Step 2.1: Download Audio Files

1. Open: https://berkeley-speech-group.github.io/VersatileVoiceDataset/
2. For each audio player on the page:
   - Right-click → "Save audio as..."
   - Save to `data/raw_audio/`
3. Use `data/raw_audio/DOWNLOAD_CHECKLIST.md` to track progress

### Step 2.2: Naming Convention
Name each file as: `{speaker}_{pitch}_{resonance}_{weight}_{sentence}.wav`

Example: `001_high_high_low_bluespot.wav`

**Quick Reference:**

| L1-Distance | Pitch | Resonance | Weight |
|-------------|-------|-----------|--------|
| 0 | high | high | low |
| 1 | high | medium | low |
| 2 | medium | medium | low |
| 3 | medium | medium | medium |
| 4 | low | medium | medium |
| 5 | low | low | medium |
| 6 | low | low | high |

### Step 2.3: Verify Downloads
```bash
ls data/raw_audio/*.wav | wc -l
# Should show 42
```

---

## Phase 3: Feature Extraction (5 minutes)

### Step 3.1: Run Extraction Script
```bash
cd voice_capstone
python scripts/extract_features.py
```

### Step 3.2: Verify Output
```bash
head data/processed/acoustic_features.csv
```

You should see columns like: filename, speaker, pitch_level, f0_mean, etc.

---

## Phase 4: Analysis & Visualization (10 minutes)

### Step 4.1: Run Analysis Script
```bash
python scripts/analyze.py
```

### Step 4.2: Review Outputs
Check `visualizations/` folder for:
- f0_by_pitch.png
- formants_by_resonance.png
- hnr_by_weight.png
- feature_trajectory.png
- correlation_heatmap.png
- speaker_comparison.png

### Step 4.3: Review Statistical Output
The script prints statistical tests to the console. Copy key findings for your case study.

---

## Phase 5: Tableau Dashboard (30 minutes)

### Step 5.1: Open Tableau Public
Download free at: https://public.tableau.com/

### Step 5.2: Connect Data
1. File → Open → `data/processed/acoustic_features.csv`

### Step 5.3: Create Visualizations

**Sheet 1: F0 by Configuration**
- Columns: pitch_level
- Rows: AVG(f0_mean)
- Color: pitch_level
- Add reference line at 170 Hz

**Sheet 2: Feature Trajectory**
- Columns: l1_distance
- Rows: AVG(f0_mean), AVG(avg_formant), AVG(hnr)
- Use dual axis or separate sheets

**Sheet 3: Speaker Comparison**
- Columns: f0_mean
- Rows: avg_formant
- Color: speaker
- Shape: pitch_level

**Sheet 4: Formant Details**
- Columns: resonance_level
- Rows: AVG(f1_mean), AVG(f2_mean), AVG(f3_mean)

### Step 5.4: Create Dashboard
- Combine sheets into single dashboard
- Add filters for speaker, sentence
- Add title and annotations

### Step 5.5: Publish
1. Server → Tableau Public → Save to Tableau Public
2. Copy the public URL for your portfolio

---

## Phase 6: GitHub Setup (15 minutes)

### Step 6.1: Initialize Repository
```bash
cd voice_capstone
chmod +x setup_github.sh
./setup_github.sh
```

### Step 6.2: Create GitHub Repository
1. Go to https://github.com/new
2. Name: `voice-acoustic-analysis`
3. Description: "Acoustic analysis of gender-affirming voice modification - Google Data Analytics Capstone"
4. Public repository
5. DON'T initialize with README (you already have one)

### Step 6.3: Connect and Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/voice-acoustic-analysis.git
git branch -M main
git push -u origin main
```

### Step 6.4: Add Topics (in GitHub UI)
Add topics: `data-analytics`, `python`, `voice-analysis`, `capstone-project`, `parselmouth`

---

## Phase 7: Case Study Document (1-2 hours)

### Step 7.1: Complete the Template
Open `docs/case_study.md` and fill in:
- [ ] Your name and date
- [ ] Actual statistics from analysis output
- [ ] Insert chart images
- [ ] Tableau dashboard link
- [ ] GitHub repository link

### Step 7.2: Export Options
- Keep as Markdown for GitHub
- Convert to PDF for job applications
- Convert to Google Doc for sharing

---

## Phase 8: LinkedIn Content (Ongoing)

### Step 8.1: Review Content Series
Open `docs/linkedin_content_series.md`

### Step 8.2: Posting Schedule

| Day | Post | Image |
|-----|------|-------|
| Day 1 | Post 1: Announcement | code_snippet.png |
| Day 3 | Post 2: Data Deep Dive | Screenshot of CSV |
| Day 7 | Post 3: First Insights | Chart from analysis |
| Day 10 | Post 4: Technical Challenge | None |
| Day 14 | Post 5: Visualization | correlation_heatmap.png |
| Day 17 | Post 6: Complete | Dashboard screenshot |
| Day 21 | Post 7: Reflection | None |

### Step 8.3: Post Tips
- Best times: Tuesday-Thursday, 8-10am
- Respond to all comments within 2 hours
- Use 3-5 hashtags maximum

---

## Phase 9: Journal Entry Submission

### Step 9.1: Final Journal Entry
Use the reflection from `journal_entry_personal.md` (already created)

### Step 9.2: Course Submission
Submit through Coursera per course instructions

---

## Quick Reference: File Locations

| File | Purpose |
|------|---------|
| `scripts/extract_features.py` | Extracts acoustic features |
| `scripts/analyze.py` | Runs analysis + creates charts |
| `data/processed/acoustic_features.csv` | Your extracted data |
| `visualizations/*.png` | Generated charts |
| `docs/case_study.md` | Case study template |
| `docs/linkedin_content_series.md` | All LinkedIn posts |
| `setup_github.sh` | GitHub initialization |

---

## Troubleshooting

**"No module named parselmouth"**
```bash
pip install praat-parselmouth --upgrade
```

**"No .wav files found"**
- Check files are in `data/raw_audio/`
- Verify .wav extension (not .mp3)

**"Permission denied" on Mac/Linux**
```bash
chmod +x scripts/*.py
chmod +x setup_github.sh
```

**Formant extraction returns NaN**
- Some very short or quiet audio may not extract properly
- Script handles this gracefully, proceed with available data

---

## You're Done! 🎉

Checklist:
- [ ] 42 audio files downloaded
- [ ] Features extracted to CSV
- [ ] Analysis complete with visualizations
- [ ] Tableau dashboard published
- [ ] GitHub repository live
- [ ] Case study document complete
- [ ] LinkedIn Post 1 published
- [ ] Journal entry submitted

**Congratulations on completing your capstone!**
