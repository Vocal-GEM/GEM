# Vocal GEM: Detailed Implementation Guide

This document provides technical implementation details for each tier of the improvement roadmap.

---

## 🌱 Tier 1: Foundation & Stability

### Microphone Calibration V2

**Files to Modify:**
- `src/components/ui/MicrophoneCalibration.jsx`
- `src/hooks/useAudioAnalysis.js`

**Implementation:**
```javascript
// New: MicrophoneQualityAnalyzer.js
export class MicrophoneQualityAnalyzer {
  async analyzeQuality(stream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    // Measure noise floor during silence
    const noiseFloor = await this.measureNoiseFloor(analyser);
    
    // Measure frequency response with test tone
    const freqResponse = await this.measureFrequencyResponse(analyser);
    
    // Calculate quality score
    return {
      noiseFloorDb: noiseFloor,
      frequencyResponse: freqResponse,
      qualityScore: this.calculateScore(noiseFloor, freqResponse),
      recommendedSettings: this.getRecommendedSettings(noiseFloor)
    };
  }
  
  getRecommendedSettings(noiseFloor) {
    return {
      noiseGate: noiseFloor + 6, // 6dB above noise floor
      gainCompensation: noiseFloor > -40 ? 1.2 : 1.0,
      smoothingFactor: noiseFloor > -30 ? 0.9 : 0.8
    };
  }
}
```

**UI Flow:**
1. User clicks "Calibrate Microphone"
2. App prompts: "Please stay silent for 3 seconds..."
3. App measures noise floor
4. App prompts: "Say 'Ahhh' for 3 seconds..."
5. App measures signal quality
6. Display results with recommendations

---

### Signal Validation

**Files to Create:**
- `src/utils/signalValidator.js`

**Implementation:**
```javascript
export const validateAudioSignal = (audioBuffer, sampleRate) => {
  const issues = [];
  
  // Check for clipping
  const maxAmplitude = Math.max(...audioBuffer.map(Math.abs));
  if (maxAmplitude > 0.99) {
    issues.push({ type: 'clipping', severity: 'high', 
      message: 'Audio is clipping. Move away from microphone.' });
  }
  
  // Check for silence
  const rms = Math.sqrt(audioBuffer.reduce((sum, s) => sum + s*s, 0) / audioBuffer.length);
  if (rms < 0.001) {
    issues.push({ type: 'silence', severity: 'high',
      message: 'No audio detected. Check microphone.' });
  }
  
  // Check for DC offset
  const dcOffset = audioBuffer.reduce((sum, s) => sum + s, 0) / audioBuffer.length;
  if (Math.abs(dcOffset) > 0.05) {
    issues.push({ type: 'dc_offset', severity: 'medium',
      message: 'Audio has DC bias. May affect analysis.' });
  }
  
  // Check for excessive noise
  const snr = this.estimateSNR(audioBuffer);
  if (snr < 10) {
    issues.push({ type: 'low_snr', severity: 'medium',
      message: 'High background noise detected.' });
  }
  
  return {
    isValid: issues.filter(i => i.severity === 'high').length === 0,
    issues,
    confidence: Math.max(0, Math.min(1, (snr - 5) / 30))
  };
};
```

---

### Pitch Detection Refinement

**Files to Modify:**
- `src/utils/pitch.js`
- `src/utils/DSP.js`

**Implementation:**
```javascript
// Add median filter to smooth pitch readings
export class PitchSmoother {
  constructor(windowSize = 5) {
    this.buffer = [];
    this.windowSize = windowSize;
  }
  
  process(rawPitch) {
    if (rawPitch === null) return null;
    
    this.buffer.push(rawPitch);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }
    
    // Median filter removes outliers
    const sorted = [...this.buffer].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Reject if too far from median (octave jump detection)
    const ratio = rawPitch / median;
    if (ratio > 1.8 || ratio < 0.55) {
      return median; // Likely octave error, use median
    }
    
    return rawPitch;
  }
}
```

---

### Offline Mode

**Files to Create:**
- `src/services/OfflineManager.js`
- `src/hooks/useOfflineStatus.js`

**Implementation:**
```javascript
// OfflineManager.js
export class OfflineManager {
  constructor() {
    this.offlineQueue = [];
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => this.syncQueue());
    window.addEventListener('offline', () => this.isOnline = false);
  }
  
  // Queue data for sync when back online
  queueForSync(type, data) {
    this.offlineQueue.push({
      type,
      data,
      timestamp: Date.now()
    });
    localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
  }
  
  async syncQueue() {
    this.isOnline = true;
    const queue = [...this.offlineQueue];
    
    for (const item of queue) {
      try {
        await this.syncItem(item);
        this.offlineQueue.shift();
      } catch (e) {
        break; // Stop on first failure
      }
    }
  }
  
  // Features that work offline
  static OFFLINE_FEATURES = [
    'pitch-visualizer',
    'resonance-orb', 
    'spectrogram',
    'basic-warm-up',
    'lesson-viewing' // cached content
  ];
}
```

---

## 🎯 Tier 2: Measurement Accuracy

### Multi-Algorithm Pitch Detection

**Files to Create:**
- `src/utils/pitchEnsemble.js`

**Implementation:**
```javascript
import { detectPitchYIN } from './pitchYIN';
import { detectPitchAutocorr } from './pitchAutocorr';
import { detectPitchMcLeod } from './pitchMcLeod';

export class PitchEnsemble {
  detectPitch(audioBuffer, sampleRate) {
    // Run all algorithms
    const results = [
      { algo: 'yin', result: detectPitchYIN(audioBuffer, sampleRate) },
      { algo: 'autocorr', result: detectPitchAutocorr(audioBuffer, sampleRate) },
      { algo: 'mcleod', result: detectPitchMcLeod(audioBuffer, sampleRate) }
    ].filter(r => r.result.pitch !== null);
    
    if (results.length === 0) return { pitch: null, confidence: 0 };
    
    // Consensus voting: find cluster of agreeing algorithms
    const tolerance = 0.05; // 5% tolerance
    let bestCluster = [];
    
    for (const r1 of results) {
      const cluster = results.filter(r2 => 
        Math.abs(r1.result.pitch - r2.result.pitch) / r1.result.pitch < tolerance
      );
      if (cluster.length > bestCluster.length) {
        bestCluster = cluster;
      }
    }
    
    // Average the agreeing algorithms
    const avgPitch = bestCluster.reduce((sum, r) => sum + r.result.pitch, 0) / bestCluster.length;
    const confidence = (bestCluster.length / results.length) * 
                       Math.max(...bestCluster.map(r => r.result.confidence));
    
    return { pitch: avgPitch, confidence, algorithms: bestCluster.map(r => r.algo) };
  }
}
```

---

### Formant Tracking (F1-F4)

**Files to Create:**
- `src/utils/formantTracker.js`

**Implementation:**
```javascript
export class FormantTracker {
  constructor(sampleRate, lpcOrder = 12) {
    this.sampleRate = sampleRate;
    this.lpcOrder = lpcOrder;
  }
  
  extractFormants(audioBuffer) {
    // Pre-emphasis filter
    const preEmph = this.preEmphasis(audioBuffer, 0.97);
    
    // LPC analysis
    const lpcCoeffs = this.computeLPC(preEmph, this.lpcOrder);
    
    // Find roots of LPC polynomial
    const roots = this.findRoots(lpcCoeffs);
    
    // Convert roots to formant frequencies
    const formants = roots
      .filter(r => r.imag > 0) // Upper half-plane only
      .map(r => {
        const freq = Math.atan2(r.imag, r.real) * this.sampleRate / (2 * Math.PI);
        const bw = -Math.log(Math.sqrt(r.real**2 + r.imag**2)) * this.sampleRate / Math.PI;
        return { frequency: freq, bandwidth: bw };
      })
      .filter(f => f.frequency > 90 && f.frequency < 5000 && f.bandwidth < 500)
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, 4);
    
    return {
      F1: formants[0]?.frequency || null, // ~300-800 Hz (open/close)
      F2: formants[1]?.frequency || null, // ~800-2500 Hz (front/back)
      F3: formants[2]?.frequency || null, // ~2500-3500 Hz (brightness)
      F4: formants[3]?.frequency || null  // ~3500+ Hz (speaker ID)
    };
  }
}
```

---

### Background Noise Compensation

**Files to Modify:**
- `src/utils/DSP.js`

**Implementation:**
```javascript
export class NoiseReducer {
  constructor(fftSize = 2048) {
    this.fftSize = fftSize;
    this.noiseProfile = null;
    this.alpha = 2.0; // Oversubtraction factor
    this.beta = 0.01; // Spectral floor
  }
  
  // Call during silence to capture noise profile
  captureNoiseProfile(silentBuffer) {
    const spectrum = this.computeSpectrum(silentBuffer);
    this.noiseProfile = spectrum.map(bin => bin * this.alpha);
  }
  
  // Apply spectral subtraction
  reduce(audioBuffer) {
    if (!this.noiseProfile) return audioBuffer;
    
    const spectrum = this.computeSpectrum(audioBuffer);
    const phase = this.computePhase(audioBuffer);
    
    // Subtract noise estimate
    const cleanSpectrum = spectrum.map((mag, i) => {
      const cleaned = mag - this.noiseProfile[i];
      return Math.max(cleaned, mag * this.beta); // Spectral floor
    });
    
    // Reconstruct signal
    return this.inverseFFT(cleanSpectrum, phase);
  }
}
```

---

## 🔔 Tier 3: Real-Time Feedback Evolution

### Latency Optimization

**Strategy:**
1. Use AudioWorklet instead of ScriptProcessorNode
2. Reduce FFT size for faster processing
3. Use SharedArrayBuffer for zero-copy audio transfer
4. Process in WebWorker to avoid main thread blocking

**Files to Create:**
- `src/audio/PitchWorklet.js`

**Implementation:**
```javascript
// PitchWorklet.js - runs in audio thread
class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(1024);
    this.bufferIndex = 0;
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0][0];
    if (!input) return true;
    
    // Fill buffer
    for (let i = 0; i < input.length; i++) {
      this.buffer[this.bufferIndex++] = input[i];
      
      if (this.bufferIndex >= this.buffer.length) {
        // Process immediately when buffer full
        const pitch = this.detectPitch(this.buffer);
        this.port.postMessage({ pitch, timestamp: currentTime });
        this.bufferIndex = 0;
      }
    }
    return true;
  }
  
  detectPitch(buffer) {
    // Fast YIN implementation inline
    // Target: <5ms processing time
  }
}
registerProcessor('pitch-processor', PitchProcessor);
```

---

### Adaptive Feedback Sensitivity

**Files to Create:**
- `src/services/AdaptiveFeedback.js`

**Implementation:**
```javascript
export class AdaptiveFeedbackController {
  constructor() {
    this.skillLevel = 0.5; // 0 = beginner, 1 = advanced
    this.recentPerformance = [];
  }
  
  updateSkillLevel(performance) {
    this.recentPerformance.push(performance);
    if (this.recentPerformance.length > 20) {
      this.recentPerformance.shift();
    }
    
    // Calculate skill from recent accuracy
    const avgAccuracy = this.recentPerformance.reduce((s, p) => s + p.accuracy, 0) 
                        / this.recentPerformance.length;
    
    // Smooth skill level changes
    this.skillLevel = this.skillLevel * 0.9 + avgAccuracy * 0.1;
  }
  
  getThresholds() {
    // Beginners get wider acceptable ranges
    const baseRange = 20; // Hz
    const skillMultiplier = 1 + (1 - this.skillLevel); // 1.0 to 2.0
    
    return {
      pitchTolerance: baseRange * skillMultiplier,
      resonanceTolerance: 0.15 * skillMultiplier,
      feedbackDelay: 500 + (1 - this.skillLevel) * 500, // 500-1000ms
      feedbackFrequency: this.skillLevel > 0.7 ? 'rare' : 'frequent'
    };
  }
}
```

---

### Haptic Feedback Patterns

**Files to Create:**
- `src/services/HapticFeedback.js`

**Implementation:**
```javascript
export class HapticFeedback {
  static patterns = {
    pitchLow: [100, 50, 100], // Two short pulses
    pitchHigh: [200], // One long pulse
    onTarget: [50], // Quick tap
    resonanceDark: [100, 100, 100, 100], // Rumble
    resonanceBright: [30, 30, 30], // Quick taps
    strain: [500], // Long warning
    achievement: [50, 50, 50, 100, 200] // Celebration
  };
  
  static play(patternName) {
    if (!navigator.vibrate) return;
    
    const pattern = this.patterns[patternName];
    if (pattern) {
      navigator.vibrate(pattern);
    }
  }
  
  static playProportional(value, min, max) {
    // Vibration intensity proportional to deviation
    const deviation = Math.abs(value - (min + max) / 2) / ((max - min) / 2);
    const duration = Math.round(50 + deviation * 200);
    navigator.vibrate(duration);
  }
}
```

---

## 🧬 Tier 4: Personalization Engine

### Voice Profile System

**Files to Create:**
- `src/services/VoiceProfile.js`
- `src/context/VoiceProfileContext.jsx`

**Data Structure:**
```javascript
export const createVoiceProfile = (recordings) => ({
  // Baseline measurements
  baseline: {
    pitchRange: { min: 85, max: 250, habitual: 140 },
    resonanceRange: { brightest: 0.8, darkest: 0.2, habitual: 0.5 },
    vocalWeight: { lightest: 0.3, heaviest: 0.9, habitual: 0.6 },
    mpt: 18.5, // Maximum phonation time in seconds
    jitter: 0.8, // Pitch stability %
    shimmer: 2.1, // Amplitude stability %
  },
  
  // User-defined goals
  goals: {
    targetPitchRange: { min: 180, max: 280 },
    targetResonance: 0.7,
    targetWeight: 0.35,
    voiceType: 'feminine', // 'feminine' | 'masculine' | 'androgynous'
  },
  
  // Progress tracking
  progress: {
    currentAverages: { pitch: 165, resonance: 0.55, weight: 0.5 },
    weeklyTrend: { pitch: +5, resonance: +0.03, weight: -0.02 },
    estimatedTimeToGoal: { weeks: 12, confidence: 0.7 }
  },
  
  // Learning preferences
  preferences: {
    learningStyle: 'visual', // 'visual' | 'auditory' | 'kinesthetic'
    sessionLength: 'short', // 'micro' | 'short' | 'standard' | 'long'
    feedbackIntensity: 'moderate',
    preferredExercises: ['sirens', 'resonance-slides', 'reading']
  },
  
  // Health factors
  health: {
    hasHadVFS: false,
    onHRT: true,
    hrtDuration: 18, // months
    vocalIssues: [],
    restDays: ['Sunday']
  }
});
```

---

### AI Target Recommendation

**Files to Create:**
- `src/services/TargetRecommender.js`

**Implementation:**
```javascript
export class TargetRecommender {
  recommend(profile) {
    const { baseline, goals, health } = profile;
    
    // Calculate achievable targets based on starting point
    let targetPitch = this.calculatePitchTarget(baseline, goals, health);
    let targetResonance = this.calculateResonanceTarget(baseline, goals);
    
    // Adjust for health factors
    if (health.onHRT && goals.voiceType === 'masculine') {
      // HRT will help pitch, focus on resonance
      targetPitch = baseline.pitchRange.habitual * 0.85;
    }
    
    if (health.hasHadVFS) {
      // Post-surgery, more aggressive targets possible
      targetPitch = Math.max(targetPitch, 180);
    }
    
    return {
      shortTerm: { // 4 weeks
        pitch: baseline.pitchRange.habitual + (targetPitch - baseline.pitchRange.habitual) * 0.25,
        resonance: baseline.resonanceRange.habitual + (targetResonance - baseline.resonanceRange.habitual) * 0.3
      },
      mediumTerm: { // 12 weeks
        pitch: baseline.pitchRange.habitual + (targetPitch - baseline.pitchRange.habitual) * 0.6,
        resonance: baseline.resonanceRange.habitual + (targetResonance - baseline.resonanceRange.habitual) * 0.7
      },
      longTerm: { // 6+ months
        pitch: targetPitch,
        resonance: targetResonance
      },
      confidence: this.calculateConfidence(baseline, targetPitch, health),
      rationale: this.explainRecommendation(baseline, targetPitch, targetResonance, health)
    };
  }
}
```

---

## 🤖 Tier 5: AI Coach Enhancement

### Context-Aware AI Responses

**Files to Modify:**
- `src/services/AIService.js`

**Implementation:**
```javascript
export class ContextAwareCoach {
  buildContext(userState) {
    return {
      // Current session context
      session: {
        currentExercise: userState.currentExercise,
        timeInSession: userState.sessionDuration,
        recentMetrics: userState.last5Readings,
        currentMood: userState.moodCheck
      },
      
      // Historical context
      history: {
        sessionsThisWeek: userState.weeklySessionCount,
        streakDays: userState.currentStreak,
        recentChallenges: userState.recentStruggles,
        recentWins: userState.recentAchievements
      },
      
      // Profile context
      profile: {
        voiceGoal: userState.profile.goals.voiceType,
        experienceLevel: userState.profile.experienceLevel,
        preferredStyle: userState.profile.coachingStyle
      }
    };
  }
  
  async getResponse(userMessage, context) {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const response = await fetch('/api/coach', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory,
          { role: 'user', content: userMessage }
        ],
        context: context
      })
    });
    
    return response.json();
  }
  
  buildSystemPrompt(context) {
    return `You are a supportive voice coach helping with ${context.profile.voiceGoal} voice training.

Current session: User is doing ${context.session.currentExercise || 'free practice'}.
Recent performance: Pitch averaging ${context.session.recentMetrics?.avgPitch || 'N/A'} Hz.
User's streak: ${context.history.streakDays} days.
Recent challenges: ${context.history.recentChallenges.join(', ') || 'None noted'}.

Coaching style preference: ${context.profile.preferredStyle}.
Remember to be encouraging, specific, and suggest actionable next steps.`;
  }
}
```

---

### Real-Time Coaching

**Files to Create:**
- `src/components/ui/LiveCoachWidget.jsx`

**Implementation:**
```jsx
export const LiveCoachWidget = ({ metrics, exercise }) => {
  const [tip, setTip] = useState(null);
  const tipQueue = useRef([]);
  const lastTipTime = useRef(0);
  
  useEffect(() => {
    // Analyze current performance
    const analysis = analyzePerformance(metrics, exercise);
    
    // Generate tip if needed (max once per 10 seconds)
    if (analysis.needsTip && Date.now() - lastTipTime.current > 10000) {
      const newTip = generateTip(analysis);
      tipQueue.current.push(newTip);
      lastTipTime.current = Date.now();
    }
    
    // Display next tip if available
    if (!tip && tipQueue.current.length > 0) {
      setTip(tipQueue.current.shift());
      setTimeout(() => setTip(null), 5000);
    }
  }, [metrics]);
  
  const generateTip = (analysis) => {
    if (analysis.pitchTooLow) {
      return { 
        text: "Try thinking of your voice starting higher in your head",
        icon: "↑"
      };
    }
    if (analysis.resonanceTooBack) {
      return {
        text: "Smile slightly and think of the sound coming forward",
        icon: "😊"
      };
    }
    // ... more tips
  };
  
  return tip ? (
    <motion.div className="live-coach-tip" animate={{ opacity: 1 }}>
      <span className="tip-icon">{tip.icon}</span>
      <span className="tip-text">{tip.text}</span>
    </motion.div>
  ) : null;
};
```

---

## 👥 Tier 6: Social & Community

### Anonymous Voice Sharing

**Backend Implementation:**
```python
# backend/app/routes/community.py
from flask import Blueprint, request
import librosa
import numpy as np

community_bp = Blueprint('community', __name__)

@community_bp.route('/share-voice', methods=['POST'])
def share_voice_anonymously():
    audio_file = request.files['audio']
    
    # Load and process
    y, sr = librosa.load(audio_file, sr=22050)
    
    # Anonymization: slight pitch shift + formant scramble
    y_anon = anonymize_voice(y, sr)
    
    # Strip all metadata
    # Save with random ID only
    share_id = generate_random_id()
    save_anonymous_clip(share_id, y_anon, sr)
    
    return {'share_id': share_id, 'expires_in': '7d'}

def anonymize_voice(y, sr):
    # Random pitch shift ±10%
    shift = np.random.uniform(-0.1, 0.1)
    y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=shift*12)
    
    # Slight time stretch to alter rhythm
    rate = np.random.uniform(0.95, 1.05)
    y_stretched = librosa.effects.time_stretch(y_shifted, rate=rate)
    
    return y_stretched
```

---

### Mentor Matching

**Files to Create:**
- `src/services/MentorMatcher.js`

**Implementation:**
```javascript
export class MentorMatcher {
  async findMentors(userProfile) {
    const candidates = await this.fetchPotentialMentors();
    
    return candidates
      .map(mentor => ({
        ...mentor,
        matchScore: this.calculateMatchScore(userProfile, mentor)
      }))
      .filter(m => m.matchScore > 0.6)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }
  
  calculateMatchScore(user, mentor) {
    let score = 0;
    
    // Same voice goal
    if (user.goals.voiceType === mentor.expertise) score += 0.3;
    
    // Mentor was at similar starting point
    const pitchDiff = Math.abs(user.baseline.pitchRange.habitual - mentor.startingPitch);
    if (pitchDiff < 20) score += 0.2;
    
    // Mentor has achieved user's target
    if (mentor.currentPitch >= user.goals.targetPitchRange.min) score += 0.25;
    
    // Activity level
    if (mentor.responsiveness > 0.8) score += 0.15;
    
    // Timezone compatibility
    if (Math.abs(user.timezone - mentor.timezone) < 3) score += 0.1;
    
    return score;
  }
}
```

---

## 📈 Tier 7: Advanced Analytics

### Long-Term Trend Analysis

**Files to Create:**
- `src/services/TrendAnalyzer.js`

**Implementation:**
```javascript
export class TrendAnalyzer {
  analyzeProgress(sessions, timeframe = 'month') {
    const grouped = this.groupByPeriod(sessions, timeframe);
    
    return {
      pitch: this.analyzeTrend(grouped.map(g => g.avgPitch)),
      resonance: this.analyzeTrend(grouped.map(g => g.avgResonance)),
      consistency: this.analyzeConsistency(grouped),
      practiceVolume: this.analyzePracticePatterns(grouped)
    };
  }
  
  analyzeTrend(values) {
    // Linear regression
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0, denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
    }
    
    const slope = numerator / denominator;
    const rSquared = this.calculateRSquared(values, slope);
    
    return {
      direction: slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable',
      rateOfChange: slope,
      confidence: rSquared,
      prediction: {
        nextWeek: values[n-1] + slope,
        nextMonth: values[n-1] + slope * 4
      }
    };
  }
  
  detectPlateau(values, threshold = 0.02) {
    const recent = values.slice(-8); // Last 8 data points
    const range = Math.max(...recent) - Math.min(...recent);
    const avgValue = recent.reduce((a, b) => a + b, 0) / recent.length;
    
    const isPlateau = (range / avgValue) < threshold;
    
    if (isPlateau) {
      return {
        detected: true,
        duration: this.countPlateauDuration(values, threshold),
        suggestions: this.getPlateauBreakers()
      };
    }
    
    return { detected: false };
  }
  
  getPlateauBreakers() {
    return [
      "Try a different exercise modality (e.g., switch from scales to reading)",
      "Increase session intensity with focused 5-minute drills",
      "Take 2-3 rest days then return with fresh ears",
      "Record yourself in a new context (e.g., phone call simulation)",
      "Book a session with a voice coach for professional feedback"
    ];
  }
}
```

---

### Weekly Digest Generator

**Files to Create:**
- `src/services/DigestGenerator.js`

**Implementation:**
```javascript
export class DigestGenerator {
  generateWeeklyDigest(userId) {
    const weekData = this.fetchWeekData(userId);
    
    return {
      summary: this.generateSummary(weekData),
      highlights: this.extractHighlights(weekData),
      challenges: this.identifyChallenges(weekData),
      recommendations: this.generateRecommendations(weekData),
      comparison: this.compareToLastWeek(weekData),
      streak: weekData.currentStreak,
      nextMilestone: this.getNextMilestone(weekData)
    };
  }
  
  generateSummary(data) {
    return {
      totalPracticeTime: data.sessions.reduce((t, s) => t + s.duration, 0),
      sessionsCompleted: data.sessions.length,
      averagePitch: this.average(data.sessions.map(s => s.avgPitch)),
      averageResonance: this.average(data.sessions.map(s => s.avgResonance)),
      bestSession: this.findBestSession(data.sessions),
      mostPracticedExercise: this.findMostPracticed(data.sessions)
    };
  }
  
  extractHighlights(data) {
    const highlights = [];
    
    // New personal bests
    if (data.newPersonalBests.length > 0) {
      highlights.push({
        type: 'personal_best',
        icon: '🏆',
        text: `New personal best: ${data.newPersonalBests[0].metric} - ${data.newPersonalBests[0].value}`
      });
    }
    
    // Streak milestone
    if (data.currentStreak % 7 === 0 && data.currentStreak > 0) {
      highlights.push({
        type: 'streak',
        icon: '🔥',
        text: `${data.currentStreak}-day streak! Amazing consistency!`
      });
    }
    
    // Improvement in key metrics
    const pitchImprovement = data.weeklyChange.pitch;
    if (Math.abs(pitchImprovement) > 5) {
      highlights.push({
        type: 'progress',
        icon: pitchImprovement > 0 ? '📈' : '📉',
        text: `Pitch ${pitchImprovement > 0 ? 'increased' : 'decreased'} by ${Math.abs(pitchImprovement).toFixed(0)} Hz this week`
      });
    }
    
    return highlights;
  }
}
```

---

## 🩺 Tier 8: Professional Tools

### Client Management System

**Files to Create:**
- `src/components/professional/ClientDashboard.jsx`
- `backend/app/routes/professional.py`

**Database Schema:**
```sql
-- Professional accounts
CREATE TABLE professionals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  license_number VARCHAR(100),
  specialty VARCHAR(50), -- 'SLP', 'voice_coach', 'singing_teacher'
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client relationships
CREATE TABLE client_relationships (
  id UUID PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id),
  client_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'paused', 'ended'
  notes_visible_to_client BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Professional notes
CREATE TABLE session_notes (
  id UUID PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id),
  client_id UUID REFERENCES users(id),
  session_date DATE,
  notes TEXT,
  goals_discussed TEXT[],
  homework_assigned TEXT[],
  private_notes TEXT, -- Never visible to client
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Assessment Protocols (CAPE-V)

**Files to Create:**
- `src/components/professional/CAPEVAssessment.jsx`

**Implementation:**
```javascript
export const CAPEVAssessment = () => {
  const [scores, setScores] = useState({
    overallSeverity: 0,
    roughness: 0,
    breathiness: 0,
    strain: 0,
    pitch: 0,
    loudness: 0
  });
  
  const tasks = [
    { id: 'sustained_ah', prompt: 'Sustain /a/ for as long as comfortable', duration: null },
    { id: 'sustained_ee', prompt: 'Sustain /i/ for as long as comfortable', duration: null },
    { id: 'sentence_1', prompt: 'Read: "The blue spot is on the key again"', text: true },
    { id: 'sentence_2', prompt: 'Read: "How hard did he hit him?"', text: true },
    { id: 'sentence_3', prompt: 'Read: "We were away a year ago"', text: true },
    { id: 'conversation', prompt: 'Tell me about your voice problem', freeform: true }
  ];
  
  const calculateResults = () => {
    // Compute CAPE-V composite score
    const composite = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
    
    return {
      scores,
      composite,
      interpretation: getInterpretation(composite),
      recommendations: getRecommendations(scores)
    };
  };
  
  return (
    <div className="cape-v-assessment">
      <h2>CAPE-V Assessment</h2>
      
      {tasks.map(task => (
        <TaskRecorder key={task.id} task={task} onComplete={handleTaskComplete} />
      ))}
      
      <div className="scoring-panel">
        {Object.keys(scores).map(dimension => (
          <VASSlider 
            key={dimension}
            label={dimension}
            value={scores[dimension]}
            onChange={v => setScores({...scores, [dimension]: v})}
            min={0}
            max={100}
            markers={['Normal', 'Mild', 'Moderate', 'Severe']}
          />
        ))}
      </div>
      
      <button onClick={calculateResults}>Generate Report</button>
    </div>
  );
};
```

---

## 🔬 Tier 9: Research & Clinical Validation

### Clinical Trial Mode

**Files to Create:**
- `src/services/ResearchMode.js`
- `backend/app/routes/research.py`

**Implementation:**
```javascript
export class ResearchModeController {
  constructor(studyConfig) {
    this.studyId = studyConfig.id;
    this.protocol = studyConfig.protocol;
    this.consentVersion = studyConfig.consentVersion;
    this.dataRetention = studyConfig.dataRetention;
  }
  
  async enrollParticipant(userId, consentSignature) {
    // Verify consent
    const consent = await this.recordConsent(userId, consentSignature);
    
    // Assign to study arm (if randomized)
    const arm = this.protocol.randomize ? this.randomizeArm() : 'single';
    
    // Generate participant ID (de-identified)
    const participantId = this.generateParticipantId();
    
    // Initialize data collection
    return {
      participantId,
      studyArm: arm,
      startDate: new Date(),
      protocol: this.protocol,
      dataCollectionSchedule: this.getCollectionSchedule(arm)
    };
  }
  
  collectDataPoint(participantId, dataType, data) {
    const anonymizedData = {
      participantId, // De-identified
      timestamp: Date.now(),
      dataType,
      studyId: this.studyId,
      // Voice data processed to remove identifying features
      acousticFeatures: this.extractAnonymousFeatures(data),
      // No raw audio in research export
    };
    
    return this.storeResearchData(anonymizedData);
  }
  
  extractAnonymousFeatures(audioData) {
    // Extract only aggregate acoustic features
    // No spectrograms (voice fingerprint risk)
    return {
      pitchMean: audioData.pitch.mean,
      pitchStd: audioData.pitch.std,
      f1Mean: audioData.formants.f1.mean,
      f2Mean: audioData.formants.f2.mean,
      cppMean: audioData.cpp.mean,
      hnrMean: audioData.hnr.mean
      // ... other aggregate features
    };
  }
}
```

---

### Algorithm Validation Framework

**Files to Create:**
- `tests/validation/algorithmValidation.js`

**Implementation:**
```javascript
describe('Pitch Detection Validation', () => {
  // Test against PRAAT reference values
  const referenceData = loadPraatReferences('./praat_references.json');
  
  referenceData.forEach(reference => {
    it(`matches PRAAT within 2Hz for ${reference.filename}`, async () => {
      const audio = await loadAudio(reference.path);
      const detected = detectPitch(audio);
      
      expect(Math.abs(detected.f0 - reference.praatF0)).toBeLessThan(2);
    });
  });
  
  // Test on diverse voice samples
  const diverseVoices = [
    { type: 'cisgender_female', expectedRange: [165, 255] },
    { type: 'cisgender_male', expectedRange: [85, 155] },
    { type: 'trans_feminine', expectedRange: [120, 280] },
    { type: 'trans_masculine', expectedRange: [90, 200] },
    { type: 'child', expectedRange: [200, 400] },
  ];
  
  diverseVoices.forEach(voice => {
    it(`correctly ranges ${voice.type} voices`, async () => {
      const samples = await loadVoiceSamples(voice.type);
      const results = samples.map(s => detectPitch(s).f0);
      
      results.forEach(f0 => {
        expect(f0).toBeGreaterThanOrEqual(voice.expectedRange[0]);
        expect(f0).toBeLessThanOrEqual(voice.expectedRange[1]);
      });
    });
  });
});
```

---

## 🚀 Tier 10: Platform Evolution

### On-Device ML (Edge ML)

**Files to Create:**
- `src/ml/EdgePitchModel.js`

**Implementation:**
```javascript
import * as tf from '@tensorflow/tfjs';

export class EdgePitchModel {
  constructor() {
    this.model = null;
    this.isLoaded = false;
  }
  
  async load() {
    // Load quantized model for mobile
    this.model = await tf.loadGraphModel('/models/pitch_detector_quantized/model.json');
    this.isLoaded = true;
  }
  
  async predict(audioBuffer) {
    // Preprocess
    const input = this.preprocess(audioBuffer);
    
    // Run inference
    const tensor = tf.tensor2d([input]);
    const output = await this.model.executeAsync(tensor);
    
    // Postprocess
    const pitch = this.postprocess(output);
    
    // Cleanup
    tensor.dispose();
    output.dispose();
    
    return pitch;
  }
  
  preprocess(audioBuffer) {
    // Compute mel spectrogram (same as training)
    const melSpec = computeMelSpectrogram(audioBuffer, {
      sampleRate: 16000,
      nMels: 80,
      hopLength: 160,
      fMin: 50,
      fMax: 8000
    });
    
    return melSpec;
  }
}

// Service Worker for background processing
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ml-worker.js');
}
```

---

### Voice Training Marketplace

**Database Schema:**
```sql
-- Exercise packs created by community/professionals
CREATE TABLE exercise_packs (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  title VARCHAR(200),
  description TEXT,
  category VARCHAR(50), -- 'pitch', 'resonance', 'prosody', 'full_course'
  target_audience VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  voice_goal VARCHAR(50), -- 'feminine', 'masculine', 'androgynous'
  price_cents INTEGER DEFAULT 0, -- 0 = free
  rating DECIMAL(2,1),
  download_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE, -- Staff reviewed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exercises within packs
CREATE TABLE pack_exercises (
  id UUID PRIMARY KEY,
  pack_id UUID REFERENCES exercise_packs(id),
  order_index INTEGER,
  title VARCHAR(200),
  instructions TEXT,
  audio_demo_url VARCHAR(500),
  duration_minutes INTEGER,
  tool_id VARCHAR(100), -- Which app tool to use
  target_metrics JSONB -- { pitch: {min: 180, max: 220}, resonance: 0.7 }
);

-- User purchases/downloads
CREATE TABLE pack_downloads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  pack_id UUID REFERENCES exercise_packs(id),
  purchased_at TIMESTAMP DEFAULT NOW(),
  rating INTEGER, -- 1-5
  review TEXT
);
```

---

## 📋 Summary

This implementation guide provides:

1. **Code-level specifications** for each major feature
2. **Database schemas** for new data structures  
3. **Algorithm descriptions** for analysis improvements
4. **Component outlines** for UI features
5. **Integration patterns** for connecting features

Each tier builds progressively on the previous, ensuring a stable foundation before adding complexity.

---

*Document Version: 1.0*
*Created: January 2026*
