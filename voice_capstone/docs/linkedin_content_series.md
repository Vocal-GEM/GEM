# LinkedIn Content Series: Voice Capstone Project

A series of posts to share throughout your project journey. Post 1-2 times per week for maximum engagement.

---

## POST 1: Project Announcement (Use with code_snippet.png)
**When:** Day 1 - Project kickoff

---

The first time I heard my voice on a recording, it didn't match who I was. Now I'm writing code to understand why—and what changes.

For my Google Data Analytics Capstone, I'm not analyzing bike rides or sales data. I'm analyzing the acoustic science behind gender-affirming voice modification.

This Python script extracts the features that actually matter:

📌 **F0** (fundamental frequency) → how pitch is perceived
📌 **Formants** (F1-F4) → how resonance is perceived  
📌 **HNR** (harmonics-to-noise ratio) → how "weight" is perceived

Using the Versatile Voice Dataset and Parselmouth (Praat's Python wrapper), I'm mapping measurable acoustic parameters to perceptual voice qualities.

The goal? Identify thresholds that could help people track real progress in voice training.

More updates coming as I dig into the data. If you've worked with audio analysis in Python, I'd love to connect.

#DataAnalytics #Python #CapstoneProject #GoogleDataAnalytics #LGBTQInTech

---

## POST 2: Data Deep Dive (Use with a screenshot of your data folder or CSV preview)
**When:** After downloading data & running extraction

---

42 audio files. 14 acoustic features. 3 speakers. One question.

I just finished extracting acoustic features from the Versatile Voice Dataset for my capstone project. Here's what I'm working with:

**The Data Structure:**
Each recording captures a voice teacher modifying their voice across 7 configurations—systematically varying pitch, resonance, and weight from "most feminine" to "most masculine."

**What I Extracted:**
• Fundamental frequency (F0) - the physical basis of pitch
• Formants (F1-F4) - resonance characteristics
• Harmonics-to-noise ratio - voice "weight" or breathiness
• Jitter & shimmer - voice stability measures

**The Research Question:**
Which acoustic features differentiate most strongly between perceptual voice qualities? Can we identify measurable benchmarks for voice training progress?

Data cleaning is next. Then the real analysis begins.

What's the most interesting dataset you've worked with? I'd love to hear about unconventional data projects.

#DataAnalytics #DataScience #AudioAnalysis #CapstoneProject

---

## POST 3: First Insights (Use with voice_acoustic_analysis.png or a new chart)
**When:** After running initial analysis

---

The data is starting to tell a story. 📊

First findings from my voice acoustic analysis:

**1. Pitch (F0) shows the clearest pattern**
High pitch configurations averaged ~220 Hz
Low pitch configurations dropped to ~110 Hz
The 170 Hz threshold cited in research? My data supports it.

**2. Formants track with resonance—but it's complicated**
Higher resonance = higher average formant frequencies
But the relationship isn't perfectly linear
Individual speaker variation is significant

**3. Weight (HNR) is the most variable**
Harmonics-to-noise ratio showed the widest spread
May require more nuanced measurement approaches

**What this means:**
For voice training, F0 might be the easiest metric to track objectively. Resonance and weight may need more personalized benchmarks.

Still early, but I'm excited about where this is heading.

#DataAnalytics #VoiceScience #DataVisualization #CapstoneProject

---

## POST 4: Technical Challenge (Good for engagement)
**When:** Mid-project

---

Ran into my first real challenge this week. 🤔

When extracting formant frequencies, I discovered that Praat's default settings assume a maximum formant frequency of 5500 Hz—optimized for "average male" voices.

For voices in higher registers? Those settings can miss or misidentify formants entirely.

**The fix:**
Adjusted the analysis parameters dynamically based on each recording's F0 range. Higher pitch = higher formant ceiling.

**The lesson:**
Default settings in any tool encode assumptions. When working with data from underrepresented populations, those assumptions often don't hold.

This is exactly why projects like this matter. The tools need to be validated against diverse voices.

Has anyone else encountered bias in "default" tool settings? Would love to hear your experiences.

#DataAnalytics #TechForGood #BiasInAI #LGBTQInTech

---

## POST 5: Visualization Showcase (Use with correlation_heatmap.png or feature_trajectory.png)
**When:** After completing visualizations

---

A picture worth 1,000 data points. 📈

This correlation heatmap shows relationships between acoustic features in my voice modification analysis:

**Key insights:**

🔴 Strong positive: F0 correlates with L1 distance (voice modification level)
🔵 Strong negative: Higher formants associate with "brighter" resonance
⚪ Weak/no correlation: Some features are more independent than expected

**What surprised me:**
Intensity (loudness) showed almost no correlation with perceived voice qualities. You can sound feminine or masculine at any volume.

**What confirmed my hypothesis:**
F0 (pitch) really is the dominant factor in voice perception—but it's not the only one that matters.

Building the Tableau dashboard next. Stay tuned.

#DataVisualization #DataAnalytics #Tableau #CapstoneProject

---

## POST 6: Project Complete (Use with dashboard screenshot or final chart)
**When:** Project completion

---

From personal question to portfolio project. ✅

I just completed my Google Data Analytics Capstone: an acoustic analysis of gender-affirming voice modification.

**What I built:**
• Python pipeline for acoustic feature extraction
• Statistical analysis of 42 voice samples across 7 configurations
• Visualizations mapping acoustic measurements to perceptual qualities
• Interactive Tableau dashboard

**What I learned:**
• Fundamental frequency (pitch) shows the clearest measurable change
• The ~170 Hz threshold cited in research is supported by this data
• Resonance and weight require more nuanced measurement approaches
• Individual variation is significant—one-size-fits-all benchmarks don't work

**What I hope it contributes:**
Evidence-based insights that could help people track real progress in voice training.

The full case study is now on my GitHub: [LINK]

Thank you to everyone who followed along and offered encouragement. This project pushed me technically and meant something personally.

Now—time to find a role where I can keep asking interesting questions with data.

#DataAnalytics #CapstoneProject #GoogleDataAnalytics #OpenToWork #LGBTQInTech

---

## POST 7: Reflection/Lessons Learned (Good for engagement, no image needed)
**When:** Few days after completion

---

What I wish I knew before starting my capstone project:

1. **Choose something you actually care about.**
Generic projects teach skills. Personal projects teach skills AND keep you motivated at 11pm when the code won't run.

2. **Document as you go.**
I thought I'd remember why I made certain decisions. I didn't. My future self thanks my past self for the comments.

3. **Scope creep is real.**
I had 47 ideas for additional analysis. I did 5. The project is better for it.

4. **Share early, share often.**
Posting updates on LinkedIn kept me accountable and connected me with people doing similar work.

5. **The "finished" version is never the one you imagined.**
And that's okay. Done beats perfect.

To everyone still working on capstones, portfolios, or passion projects: keep going. The finish line is worth it.

What's the best advice you received during a big project?

#CareerAdvice #DataAnalytics #LessonsLearned #CapstoneProject

---

## BONUS: Elevator Pitch (For networking/interviews)

**30-second version:**
"For my data analytics capstone, I analyzed the acoustic science behind gender-affirming voice modification. Using Python and Praat, I extracted features like pitch and formants from voice recordings, then visualized how these measurements correspond to perceived voice qualities. I found that fundamental frequency shows the clearest measurable change, supporting the ~170 Hz threshold cited in research. The project combined technical skills I wanted to develop with a topic I genuinely care about."

**10-second version:**
"I analyzed acoustic features of voice modification to identify measurable benchmarks for voice training progress—combining Python, audio analysis, and data visualization."

---

## Posting Schedule Suggestion

| Week | Post | Visual |
|------|------|--------|
| 1 | Post 1: Announcement | code_snippet.png |
| 1 | Post 2: Data Deep Dive | CSV/folder screenshot |
| 2 | Post 3: First Insights | Chart |
| 2 | Post 4: Technical Challenge | None (text only) |
| 3 | Post 5: Visualization | Heatmap or trajectory |
| 3 | Post 6: Complete | Dashboard |
| 4 | Post 7: Reflection | None (text only) |

**Best times to post:** Tuesday-Thursday, 8-10am or 12-1pm in your timezone

**Engagement tips:**
- Respond to every comment within 1-2 hours
- Ask a question at the end of each post
- Use 3-5 relevant hashtags (not more)
- Tag relevant people/organizations sparingly
