export const FEMINIZATION_COURSE = [
    {
        id: 'module-1',
        title: 'Module 1: Foundations',
        description: 'Master the core pillars of vocal feminization: Pitch, Resonance, and Weight.',
        lessons: [
            {
                id: 'lesson-1-0',
                title: 'Vocal Safety & Health Guide',
                type: 'theory',
                duration: '5 min',
                description: 'Essential safety information before beginning your voice training journey.',
                content: `
# Vocal Safety & Health Guide

Your voice is a delicate instrument that requires care and respect. Before beginning any voice training, please read this safety guide carefully.

## 🛑 Red Flags - Stop Immediately If:

- You experience **pain** in your throat or neck
- Your voice becomes **hoarse** for more than 2 days
- You feel **choking or gagging** sensations
- You experience **dizziness** or lightheadedness
- You notice **blood** when you cough or clear your throat
- Your voice **completely disappears** (aphonia)

**If any of these occur, stop all exercises and consult a healthcare provider or speech-language pathologist.**

## ⚠️ Important Safety Principles

1. **Hydration is Essential**: Drink 8+ glasses of water daily. Hydration takes 4 hours to reach your vocal folds, so drink water throughout the day, not just before practice.

2. **Never Force It**: If an exercise feels difficult or causes strain, you're pushing too hard. Back off and try a gentler approach.

3. **Rest is Part of Training**: Your vocal folds need recovery time. Take at least 1-2 rest days per week with minimal voice use.

4. **Warm Up Every Session**: Just like athletes warm up muscles, you must warm up your voice before practice. Never skip the warm-up.

5. **Listen to Your Body**: Mild fatigue is normal, but pain is never normal. Learn the difference between "working hard" and "injury."

## 🟢 Green Light Checklist

Before each practice session, ensure:
- ✅ You've had water in the last hour
- ✅ You're not sick (cold, allergies, sore throat)
- ✅ You're well-rested (not exhausted)
- ✅ You have 15+ minutes of focused time
- ✅ You're in a relaxed mental state

## 🔄 Recovery Protocols

**If your voice feels tired:**
- Rest for 24-48 hours
- Steam inhalation (warm, not hot)
- Gentle humming only
- Avoid whispering (it's actually harder on your voice)

**Daily Vocal Hygiene:**
- Avoid excessive throat clearing (swallow instead)
- Limit caffeine and alcohol (dehydrating)
- Avoid shouting or screaming
- Use a humidifier in dry environments
- Don't smoke or vape

## 📊 Normal vs Concerning

**Normal sensations during practice:**
- Mild muscle fatigue in neck/jaw
- Awareness of larynx movement
- Slight breathiness when learning light weight
- Mental fatigue from concentration

**Concerning sensations - stop immediately:**
- Sharp or burning pain
- Prolonged hoarseness (>2 days)
- Loss of vocal range
- Persistent cough or throat irritation
- Clicking or popping sounds in throat

## 🏥 When to See a Professional

Consider consulting a **laryngologist** (ENT doctor) or **speech-language pathologist** if:
- You have persistent hoarseness
- You want to assess your vocal fold health
- You have a history of vocal nodules or polyps
- You're not making progress after 3+ months
- You experience any red flag symptoms

## Remember

Voice feminization is a marathon, not a sprint. **Progress takes months, not days.** Be patient with yourself, prioritize safety, and celebrate small victories along the way.

Your voice is precious - treat it with care! 💜
                `
            },
            {
                id: 'lesson-1-1',
                title: 'The 3 Pillars of Feminization',
                type: 'theory',
                duration: '5 min',
                description: 'Understanding how Pitch, Resonance, and Weight work together.',
                content: `
# The 3 Pillars of Vocal Feminization

To achieve a natural-sounding feminine voice, we focus on three main components:

1. **Pitch**: The fundamental frequency of your voice (how high or low it sounds).
2. **Resonance**: The "size" or "brightness" of your voice, determined by the shape of your vocal tract.
3. **Vocal Weight**: The "heaviness" or "buzz" in your voice.

### Why Resonance Matters Most
While pitch is often the first thing people think of, **resonance** is actually the most critical factor for gender perception. A high pitch with masculine resonance will sound like a "falsetto" or "Mickey Mouse" voice. A lower pitch with feminine resonance can still sound undeniably female.

### The Goal
Our goal is not just to raise your pitch, but to brighten your resonance and lighten your vocal weight simultaneously.
                `
            },
            {
                id: 'lesson-1-2',
                title: 'Pitch (F0) Awareness',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '10 min',
                citations: ['paper_leung_2018', 'paper_carew_2007'],
                description: 'Visualize your pitch in real-time and find your target range.',
                successCriteria: {
                    primary: 'Maintain pitch within 170-220Hz target zone for 10 consecutive seconds',
                    secondary: ['Identify your current average speaking pitch', 'Notice pitch variations during natural speech']
                },
                safety: {
                    warnings: ['Do not strain to reach high pitches', 'If you feel throat tension, lower your pitch and relax'],
                    stopIf: ['You feel pain or discomfort', 'Your voice becomes hoarse or scratchy']
                },
                content: `
# Finding Your Pitch

Let's start by simply observing your current speaking pitch.

1. **Speak naturally**: Read a book or talk about your day.
2. **Watch the graph**: See where your voice lands on the scale.
3. **Target Range**: For a feminine voice, we generally aim for an average between **170Hz and 220Hz**, but consistency is more important than height.

**Exercise**: Try to keep your pitch line within the highlighted target zone for 10 seconds.

## Safety Tips
⚠️ **Do not strain** to reach high pitches. If you feel throat tension, lower your pitch and relax.
🛑 **Stop immediately** if you feel pain or if your voice becomes hoarse.
                `
            },
            {
                id: 'lesson-1-3',
                title: 'Resonance (F1 & F2) Basics',
                type: 'interactive',
                toolId: 'resonance-orb',
                duration: '15 min',
                citations: ['paper_hillenbrand_2009'],
                description: 'Learn to brighten your voice by changing the shape of your throat.',
                successCriteria: {
                    primary: 'Move the Resonance Orb into the bright (top-right) zone and sustain for 5 seconds',
                    secondary: ['Feel the difference between dark and bright resonance', 'Control larynx height consciously']
                },
                safety: {
                    warnings: ['Avoid excessive throat tension when raising the larynx', 'Keep breathing steady - do not hold your breath'],
                    stopIf: ['You feel choking or gagging sensations', 'You experience throat pain or tightness']
                },
                commonMistakes: [
                    'Squeezing the throat instead of gently raising the larynx',
                    'Holding breath while attempting to brighten resonance',
                    'Confusing pitch change with resonance change'
                ],
                content: `
# Brightening Your Resonance

Resonance is controlled by the space in your throat and mouth.

*   **Dark Resonance (Masculine)**: Large space, like a cello. Yawning creates this space.
*   **Bright Resonance (Feminine)**: Small space, like a violin. Swallowing or making an "eeee" sound creates this space.

**Exercise**:
1.  Hum a steady note.
2.  Try to move the **Resonance Orb** from the dark/bottom area to the bright/top-right area.
3.  Imagine smiling with your throat.

## Safety Tips
⚠️ **Avoid excessive tension** when raising the larynx. Keep breathing steady.
🛑 **Stop if** you feel choking, gagging, or throat pain.

## Common Mistakes
❌ Squeezing the throat instead of gently raising the larynx
❌ Holding breath while attempting to brighten resonance
❌ Confusing pitch change with resonance change
                `
            }
        ]
    },
    {
        id: 'module-2',
        title: 'Module 2: Vocal Weight',
        description: 'Refining the texture of your voice for a softer, lighter sound.',
        lessons: [
            {
                id: 'lesson-2-1',
                title: 'Understanding Vocal Weight',
                type: 'theory',
                duration: '5 min',
                description: 'The difference between "heavy" and "light" sounds.',
                content: `
# What is Vocal Weight?

Vocal weight refers to how "thick" or "buzzy" your voice sounds.

*   **Heavy Weight**: Loud, buzzy, intense. Think of a shout or a stern command.
*   **Light Weight**: Soft, breathy, gentle. Think of a whisper or a lullaby.

For feminization, we want to reduce the "buzz" without becoming completely breathless. We aim for a **light but clear** sound.
                `
            },
            {
                id: 'lesson-2-2',
                title: 'Vocal Weight (CPP & Spectral Tilt)',
                type: 'interactive',
                toolId: 'voice-quality',
                duration: '10 min',
                description: 'Practice reducing vocal weight using the Quality Meter.',
                successCriteria: {
                    primary: 'Maintain voice quality indicator in "Neutral" or "Light" zone while counting 1-10',
                    secondary: ['Distinguish between heavy and light vocal weight', 'Apply light weight to simple phrases']
                },
                safety: {
                    warnings: ['Do not become completely breathy - maintain some vocal tone', 'Avoid straining to achieve lightness'],
                    stopIf: ['You feel dizzy from excessive breathiness', 'Your throat feels scratchy or irritated']
                },
                commonMistakes: [
                    'Going too breathy and losing all vocal tone',
                    'Tensing the throat while trying to lighten',
                    'Reducing volume excessively instead of just reducing weight'
                ],
                content: `
# Lightening the Load

Use the meter below to monitor your vocal weight.

1.  Start by counting from 1 to 5 in your "normal" voice. Notice if the meter shows "Heavy".
2.  Now, try to say "Haaaa" softly, like you are fogging up a mirror.
3.  Try counting again, keeping the sound as soft as that "Haaaa".
4.  **Goal**: Keep the indicator in the "Neutral" or "Light" zone. Avoid the "Pressed/Heavy" red zone.

## Safety Tips
⚠️ **Don't go too breathy** - maintain some vocal tone. Avoid straining to achieve lightness.
🛑 **Stop if** you feel dizzy from excessive breathiness or throat irritation.

## Common Mistakes
❌ Going too breathy and losing all vocal tone
❌ Tensing the throat while trying to lighten
❌ Reducing volume excessively instead of just reducing weight
                `
            },
            {
                id: 'lesson-2-3',
                title: 'Finding Thin Vocal Fold Mass',
                type: 'practice',
                toolId: 'weight-visualizer',
                duration: '15 min',
                citations: ['paper_sodersten_2009', 'paper_titze_2006'],
                description: 'Exercises to find a lighter, thinner vocal fold configuration.',
                content: `
# Thin Fold Exercises

These three exercises help you find a lighter vocal fold configuration - essential for a natural feminine voice.

## 1. Light Airy Sigh
Take a relaxed breath and release it on a **light, airy sigh** - like a contented "ahh" after a long day. Let air escape freely without pressing or holding.

## 2. High-to-Low Glissando
Start at a **comfortable high pitch** and glide smoothly down to your lowest note. Keep the sound light and effortless as you descend. Starting high encourages thinner folds.

## 3. Thin Fold Flow Phonation
Sustain a gentle **"oo"** or **"ee"** vowel with maximum airflow and minimum effort. Imagine your vocal folds are thin ribbons barely touching. If you feel pressing, add more breath.

**Practice Order**: Sigh → Glissando → Flow → Speak

Try speaking immediately after the flow exercise to carry over that thin, light feeling.
                `
            }
        ]
    },
    {
        id: 'module-3',
        title: 'Module 3: Vowels & Articulation',
        description: 'Mastering vowel modification and clear articulation.',
        lessons: [
            {
                id: 'lesson-3-1',
                title: 'Vowel Space (F1 vs F2)',
                type: 'interactive',
                toolId: 'vowel-plot',
                duration: '15 min',
                citations: ['paper_gelfer_2013', 'paper_hillenbrand_2009'],
                description: 'Visualize your vowel space and brighten your vowels.',
                content: `
# Brightening Vowels

Vowels are the core of resonance. By slightly modifying how we shape our vowels, we can brighten the entire voice.

**The Vowel Space Plot** shows where your vowels land acoustically.
*   **F1 (Vertical)**: Related to jaw opening.
*   **F2 (Horizontal)**: Related to tongue position.

**Exercise**:
1.  Say "Eeee" (as in beet). This should be high and to the right.
2.  Say "Ahhh" (as in father).
3.  Try to keep your vowels towards the top-right of the chart for a brighter, more feminine sound.
                `
            },
            {
                id: 'lesson-3-2',
                title: 'Clear Articulation',
                type: 'interactive',
                toolId: 'articulation-view',
                duration: '10 min',
                description: 'Practice precise articulation for a polished sound.',
                content: `
# Articulation & Clarity

Feminine speech often tends to be more precise and articulate.

**Exercise**:
1.  Read the phrases provided in the tool.
2.  Focus on crisp consonants (T, K, P, S).
3.  Avoid "mumbling" or swallowing the ends of words.
                `
            }
        ]
    },
    {
        id: 'module-4',
        title: 'Module 4: Intonation & Prosody',
        description: 'Adding melody and expression to your speech.',
        lessons: [
            {
                id: 'lesson-4-1',
                title: 'Pitch Contour (F0 Variance)',
                type: 'interactive',
                toolId: 'contour-visualizer',
                duration: '15 min',
                description: 'Visualize the melody of your speech.',
                content: `
# Speech Melody

Masculine speech is often "monotone" (flat). Feminine speech typically has more "contour" or melody.

**Exercise**:
1.  Speak a sentence like "I am going to the store."
2.  Watch the blue line. Is it flat?
3.  Try to add "hills and valleys" to the line. Go up on important words and down at the end of sentences.
                `
            },
            {
                id: 'lesson-4-2',
                title: 'Intonation Practice',
                type: 'interactive',
                toolId: 'intonation-exercise',
                duration: '15 min',
                description: 'Match target intonation patterns.',
                content: `
# Matching Patterns

Practice mimicking specific intonation patterns.

1.  Listen to the target phrase.
2.  Repeat it back, trying to match the pitch curve.
3.  Focus on the *movement* of the pitch, not just the absolute height.
                `
            }
        ]
    },
    {
        id: 'module-5',
        title: 'Module 5: Advanced Analysis',
        description: 'Deep dive into the spectral characteristics of your voice.',
        lessons: [
            {
                id: 'lesson-5-1',
                title: 'Spectrogram (Harmonics & Formants)',
                type: 'interactive',
                toolId: 'spectrogram',
                duration: '10 min',
                description: 'See the harmonics of your voice in high resolution.',
                content: `
# Reading the Spectrogram

The spectrogram shows the "fingerprint" of your voice.

*   **Vertical Axis**: Frequency (Pitch/Harmonics).
*   **Horizontal Axis**: Time.
*   **Brightness**: Loudness.

**Feminine Voice**: You want to see more energy (brightness) in the higher frequencies (above 500Hz) and less in the low "muddy" frequencies.
                `
            },
            {
                id: 'lesson-5-2',
                title: 'Voice Quality (Jitter, Shimmer, HNR)',
                type: 'interactive',
                toolId: 'quality-visualizer',
                duration: '10 min',
                description: 'Analyze stability, breathiness, and roughness.',
                content: `
# Advanced Quality Metrics

This tool breaks down your voice into:
*   **Jitter**: Pitch instability.
*   **Shimmer**: Volume instability.
*   **HNR (Harmonics-to-Noise Ratio)**: How "clean" vs "breathy" your voice is.

**Goal**: Aim for low Jitter/Shimmer and high HNR for a clear, healthy voice.
                `
            }
        ]
    },
    {
        id: 'module-6',
        title: 'Module 6: Physiology & Health',
        description: 'Understanding the instrument and keeping it healthy.',
        lessons: [
            {
                id: 'lesson-6-1',
                title: 'Vocal Folds Simulation',
                type: 'interactive',
                toolId: 'vocal-folds',
                duration: '10 min',
                description: 'Interactive physics model of the vocal folds.',
                content: `
# How Sound is Made

Explore how air pressure and muscle tension create sound.

*   **Tension**: Increases pitch.
*   **Mass**: Thicker folds create lower pitch and heavier weight.
*   **Airflow**: More air creates louder sound but can lead to breathiness.

Use the sliders to see how these factors interact.
                `
            },
            {
                id: 'lesson-6-2',
                title: 'Breath Control',
                type: 'interactive',
                toolId: 'breath-pacer',
                duration: '10 min',
                description: 'Guided breathing exercises for vocal support.',
                content: `
# The Engine of Voice

Breath is the fuel for your voice. Shallow breathing leads to tension and strain.

**Box Breathing**:
1.  Inhale for 4 seconds.
2.  Hold for 4 seconds.
3.  Exhale for 4 seconds.
4.  Hold for 4 seconds.

Follow the pacer to regulate your breathing.
                `
            }
        ]
    },
    {
        id: 'module-7',
        title: 'Module 7: Practice & Review',
        description: 'Tools for consistent practice and self-evaluation.',
        lessons: [
            {
                id: 'lesson-7-1',
                title: 'Comparison Tool',
                type: 'interactive',
                toolId: 'comparison-tool',
                duration: '15 min',
                description: 'Record and compare your voice against target samples.',
                content: `
# Self-Evaluation

The best way to progress is to listen to yourself objectively.

1.  Record a phrase.
2.  Listen back.
3.  Compare it to a previous recording or a target sample.
4.  What changed? Is the pitch higher? Is the resonance brighter?
                `
            }
        ]
    }
];

export const MASCULINIZATION_COURSE = [
    {
        id: 'module-m-1',
        title: 'Module 1: Foundations',
        description: 'Core pillars of vocal masculinization and safety.',
        lessons: [
            {
                id: 'lesson-m-1-0',
                title: 'Vocal Safety & Health Guide',
                type: 'theory',
                duration: '5 min',
                description: 'Essential safety information for masculinization training.',
                content: `
# Vocal Safety for Masculinization

Voice masculinization requires the same care and safety as any vocal training. Your voice is precious - protect it!

## 🛑 Red Flags - Stop Immediately If:

- You experience **pain** in your throat or neck
- Your voice becomes **hoarse** for more than 2 days
- You feel **strain** when speaking at lower pitches
- You experience **breathlessness** or dizziness
- Your throat feels **scratchy or raw**

## ⚠️ Safety Principles

1. **Don't Force Low Pitches**: Your natural range has limits. Work gradually.
2. **Hydrate Constantly**: Lower pitch requires more vocal fold mass engagement - hydration is critical.
3. **Warm Up First**: Always warm up before practicing low pitch exercises.
4. **Rest Between Sessions**: Take 1-2 rest days per week.
5. **Testosterone Note**: If you're on T, your voice will naturally lower over 6-12 months. Don't force it.

## 🟢 Green Light Checklist

Before practice:
- ✅ Well-hydrated
- ✅ Not sick or hoarse
- ✅ Relaxed throat and jaw
- ✅ 15+ minutes of focus time

Your voice is your identity - train smart, not hard! 💪
                `
            },
            {
                id: 'lesson-m-1-1',
                title: 'The 3 Pillars of Masculinization',
                type: 'theory',
                duration: '5 min',
                description: 'Pitch, Resonance, and Weight for masculine voices.',
                content: `
# The 3 Pillars of Vocal Masculinization

To achieve a natural-sounding masculine voice, we focus on:

1. **Pitch**: Lowering the fundamental frequency (85-135Hz target).
2. **Resonance**: Darkening the voice by creating more space in the vocal tract.
3. **Vocal Weight**: Increasing the "buzz" or thickness of the voice.

## Why Resonance Still Matters

Just like feminization, **resonance is the most critical factor**. A low pitch with bright resonance will sound like "putting on a voice." A moderate pitch with dark resonance sounds authentically masculine.

## The Goal

Lower pitch + darker resonance + fuller vocal weight = natural masculine voice.
                `
            },
            {
                id: 'lesson-m-1-2',
                title: 'Finding Your Lower Range',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '10 min',
                description: 'Visualize your pitch and find a comfortable lower range.',
                successCriteria: {
                    primary: 'Maintain pitch within 85-135Hz target zone for 10 consecutive seconds',
                    secondary: ['Identify your current average speaking pitch', 'Feel chest resonance when speaking low']
                },
                safety: {
                    warnings: ['Do not force your voice lower than comfortable', 'Avoid vocal fry as your primary voice'],
                    stopIf: ['You feel throat strain or pain', 'Your voice becomes hoarse']
                },
                content: `
# Lowering Pitch

Let's find your comfortable lower range.

1. **Speak naturally** and observe your baseline.
2. **Watch the graph** - where does your voice naturally sit?
3. **Target Range**: Aim for **85Hz to 135Hz**.
4. **Chest Voice**: Hum a low note and feel the vibration in your chest.

**Exercise**: Say "Hello" while keeping your pitch in the target zone. Feel the chest resonance.

## Safety Tips
⚠️ **Do not force** your voice lower than comfortable. Work gradually.
🛑 **Stop if** you feel throat strain or hoarseness.
                `
            }
        ]
    },
    {
        id: 'module-m-2',
        title: 'Module 2: Darkening Resonance',
        description: 'Creating space in the vocal tract for a darker, richer sound.',
        lessons: [
            {
                id: 'lesson-m-2-1',
                title: 'Understanding Dark Resonance',
                type: 'theory',
                duration: '5 min',
                description: 'The physics of dark vs bright resonance.',
                content: `
# Dark Resonance Fundamentals

Resonance is about **space**. More space = darker sound.

## Dark vs Bright

- **Dark (Masculine)**: Large vocal tract space, like a cello or bassoon. Created by lowering the larynx and creating space in the throat.
- **Bright (Feminine)**: Small vocal tract space, like a violin or flute. Created by raising the larynx and narrowing the throat.

## The Larynx Position

Your larynx (voice box) can move up and down. For masculine resonance, we **lower the larynx** to create more space.

## Triggers for Dark Resonance

- Yawning (creates maximum space)
- The feeling of "dopey" or "sleepy" voice
- Imagining speaking with a mouthful of hot potato
- The "ooh" and "oh" vowels naturally darken resonance
                `
            },
            {
                id: 'lesson-m-2-2',
                title: 'Larynx Lowering Exercises',
                type: 'interactive',
                toolId: 'resonance-orb',
                duration: '15 min',
                description: 'Learn to lower your larynx for darker resonance.',
                successCriteria: {
                    primary: 'Move the Resonance Orb into the dark (bottom-left) zone and sustain for 5 seconds',
                    secondary: ['Feel larynx lowering physically', 'Control larynx height consciously']
                },
                safety: {
                    warnings: ['Do not create excessive tension in the neck', 'Keep breathing natural - do not constrict'],
                    stopIf: ['You feel choking sensations', 'Your neck muscles cramp']
                },
                content: `
# Lowering the Larynx

Use the Resonance Orb tool to visualize your resonance changes.

## Exercise 1: The Yawn
1. Begin a yawn and notice how your throat opens
2. Hold that open feeling
3. Try to speak "Hello" while maintaining that space
4. Watch the orb move toward the dark zone

## Exercise 2: Dopey Voice
1. Imitate a "dumb surfer dude" or "sleepy morning voice"
2. Notice the orb moving to the dark zone
3. Practice sustaining that darkness

## Exercise 3: Ooh Anchor
1. Say "Ooh" (as in "boot") - this naturally lowers the larynx
2. Sustain it and watch the orb
3. Try transitioning from "Ooh" to other vowels while keeping the dark resonance

**Goal**: Keep the Resonance Orb in the dark (bottom-left) zone.

## Safety Tips
⚠️ **Avoid neck tension** - keep muscles relaxed.
🛑 **Stop if** you feel choking or muscle cramping.
                `
            },
            {
                id: 'lesson-m-2-3',
                title: 'Dark Vowel Practice',
                type: 'interactive',
                toolId: 'vowel-plot',
                duration: '10 min',
                description: 'Practice darkening your vowels.',
                content: `
# Vowel Darkening

Masculine vowels are produced with more space in the back of the mouth.

## The Vowel Space

- **Dark vowels**: "Ooh" (boot), "Oh" (boat), "Aw" (thought)
- **Neutral vowels**: "Uh" (but), "Ah" (father)
- **Bright vowels**: "Ee" (beet), "Ay" (bait)

## Exercise

Practice shifting all your vowels toward the darker/back area of the vowel space plot. Imagine speaking "from the back of your throat."
                `
            }
        ]
    },
    {
        id: 'module-m-3',
        title: 'Module 3: Vocal Weight & Fullness',
        description: 'Adding thickness and "buzz" to your voice.',
        lessons: [
            {
                id: 'lesson-m-3-1',
                title: 'Understanding Vocal Weight',
                type: 'theory',
                duration: '5 min',
                description: 'The mechanics of heavy vs light vocal weight.',
                content: `
# Vocal Weight for Masculinization

Vocal weight refers to how much of the vocal fold mass is engaged during phonation.

## Heavy vs Light

- **Heavy (Masculine)**: Full, thick vocal folds vibrating. Strong "buzz" or "ring." Think of a commanding voice or a shout.
- **Light (Feminine)**: Thin edges of vocal folds vibrating. Less "buzz," more air. Think of a whisper or soft voice.

## Goal

For masculinization, we want **fuller engagement** of the vocal folds - more "buzz," more chest resonance, more fullness.

## How to Add Weight

1. **Speak from the chest**: Focus on chest vibrations, not head vibrations.
2. **Increase vocal effort**: Think "projecting to someone across the room."
3. **Reduce breathiness**: Engage the folds more fully - less air escape.
4. **Use "call" voice**: Like calling someone's name from a distance.
                `
            },
            {
                id: 'lesson-m-3-2',
                title: 'Heavy Weight Exercises',
                type: 'interactive',
                toolId: 'voice-quality',
                duration: '10 min',
                description: 'Practice increasing vocal weight.',
                successCriteria: {
                    primary: 'Maintain voice quality indicator in "Heavy" or "Full" zone while counting 1-10',
                    secondary: ['Feel strong chest resonance', 'Reduce breathiness']
                },
                safety: {
                    warnings: ['Do not shout or yell - add weight, not volume', 'Avoid pressing or straining'],
                    stopIf: ['You feel throat pain', 'Your voice becomes hoarse']
                },
                content: `
# Adding Weight

Use the Voice Quality Meter to monitor your vocal weight.

## Exercise 1: Chest Voice
1. Place your hand on your chest
2. Count 1-5 and try to maximize the chest vibration
3. Watch the meter move toward "Heavy"

## Exercise 2: Call Voice
1. Imagine calling someone across a park: "Hey!"
2. Notice the fuller engagement
3. Apply that feeling to regular speech

## Exercise 3: Command Voice
1. Say "Stop" or "Listen" with authority
2. Feel the increase in vocal weight
3. Try to maintain that weight in normal sentences

**Goal**: Keep the Voice Quality Meter in the "Heavy" or "Full" zone.

## Safety Tips
⚠️ **Add weight, not volume** - don't shout.
🛑 **Stop if** you feel pain or strain.
                `
            }
        ]
    },
    {
        id: 'module-m-4',
        title: 'Module 4: Masculine Prosody & Integration',
        description: 'Adding masculine speech patterns and combining all elements.',
        lessons: [
            {
                id: 'lesson-m-4-1',
                title: 'Masculine Speech Patterns',
                type: 'theory',
                duration: '5 min',
                description: 'Intonation, pacing, and rhythm in masculine speech.',
                content: `
# Masculine Prosody

Prosody is the melody and rhythm of speech. Masculine speech has distinct patterns.

## Key Characteristics

1. **Flatter Intonation**: Less pitch variation, more monotone. Statements tend to drop in pitch at the end.
2. **Slower Tempo**: Generally slower, more deliberate pacing.
3. **Shorter Vowels**: Vowels are often clipped shorter.
4. **Direct Statements**: Less uptalk (rising pitch at end of statements).
5. **Stronger Emphasis**: Stress important words with volume and weight, not just pitch.

## Practice Tips

- Listen to male speakers you admire
- Notice the flatter pitch contour
- Practice ending statements with a downward pitch drop
- Use pauses for emphasis instead of pitch changes
                `
            },
            {
                id: 'lesson-m-4-2',
                title: 'Integration Practice',
                type: 'interactive',
                toolId: 'comparison-tool',
                duration: '15 min',
                description: 'Combine pitch, resonance, weight, and prosody.',
                content: `
# Putting It All Together

Now we combine all three pillars: Pitch + Resonance + Weight + Prosody.

## The Formula

1. **Start low** (85-135Hz pitch)
2. **Add darkness** (lowered larynx, open throat)
3. **Add weight** (full vocal fold engagement)
4. **Flatten intonation** (less melody, more monotone)
5. **Slow down** (deliberate pacing)

## Practice Phrases

Read these phrases with all elements combined:

- "Hello, my name is [your name]."
- "I'd like a coffee, please."
- "That's interesting."
- "Let me think about that."

**Record yourself** and compare to your baseline. Notice the changes!
                `
            }
        ]
    }
];

export const ANDROGYNY_COURSE = [
    {
        id: 'module-n-1',
        title: 'Module 1: Foundations & Balance',
        description: 'Understanding the androgynous voice and finding your neutral zone.',
        lessons: [
            {
                id: 'lesson-n-1-0',
                title: 'Vocal Safety & Health Guide',
                type: 'theory',
                duration: '5 min',
                description: 'Safety for neutral voice training.',
                content: `
# Vocal Safety for Androgyny

Androgynous voice training requires the same care as any vocal work. Protect your instrument!

## 🛑 Red Flags - Stop Immediately If:

- You experience **pain** in your throat or neck
- Your voice becomes **hoarse** for more than 2 days
- You feel **strain** when exploring different pitch ranges
- You experience **dizziness** or breathlessness
- Your throat feels **scratchy or raw**

## ⚠️ Safety Principles

1. **Don't Force Any Range**: Androgyny is about balance, not extremes.
2. **Hydrate Well**: Vocal flexibility requires well-hydrated vocal folds.
3. **Warm Up Always**: Prepare your voice before exploring ranges.
4. **Rest Regularly**: Take 1-2 rest days per week.
5. **Listen to Fatigue**: If your voice feels tired, rest it.

## 🟢 Green Light Checklist

Before practice:
- ✅ Well-hydrated
- ✅ Not sick or hoarse
- ✅ Relaxed and focused
- ✅ 15+ minutes available

Your voice is your freedom - train with care! ✨
                `
            },
            {
                id: 'lesson-n-1-1',
                title: 'The Balance Point',
                type: 'theory',
                duration: '5 min',
                description: 'Understanding the androgynous voice.',
                content: `
# The Androgynous Voice

An androgynous voice sits in the **overlap zone** between masculine and feminine characteristics. It's ambiguous - listeners can't immediately categorize it.

## The Three Pillars (Balanced)

1. **Pitch**: **135Hz to 175Hz** - the neutral zone where gender perception is ambiguous.
2. **Resonance**: **Balanced** - neither distinctly bright nor dark. Moderate larynx height.
3. **Weight**: **Moderate** - not too heavy (masculine buzz) nor too light (feminine breathiness).

## Why Androgyny?

For many non-binary, genderfluid, or questioning individuals, an androgynous voice offers:
- **Freedom**: Express yourself without gender constraints
- **Authenticity**: A voice that matches your internal identity
- **Flexibility**: Ability to shift between ranges as needed
- **Ambiguity**: Keep listeners guessing

## The Goal

Master the **neutral zone** and develop **control** to shift in any direction. You're not limited - you're liberated.
                `
            },
            {
                id: 'lesson-n-1-2',
                title: 'Finding Your Neutral Zone',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '10 min',
                description: 'Locate your androgynous pitch range.',
                successCriteria: {
                    primary: 'Maintain pitch within 135-175Hz neutral zone for 10 consecutive seconds',
                    secondary: ['Identify your natural pitch baseline', 'Feel comfortable in the neutral range']
                },
                safety: {
                    warnings: ['Do not strain to stay in the neutral zone', 'Find a comfortable, sustainable pitch'],
                    stopIf: ['You feel throat tension', 'Your voice becomes hoarse']
                },
                content: `
# The Neutral Pitch Range

Let's find your androgynous pitch sweet spot.

1. **Baseline Check**: Speak naturally and observe your current pitch.
2. **Target Zone**: Aim for **135-175Hz** - the ambiguous range.
3. **Comfort Test**: This should feel sustainable, not forced.

## Exercise

Say "Hello, I'm [your name]" and try to land in the neutral zone. Notice:
- Does it feel too high or too low?
- Can you sustain this comfortably?
- Would a listener immediately gender this voice?

**Goal**: Find a pitch in the neutral zone that feels like "home."

## Safety Tips
⚠️ **Don't strain** - the neutral zone should feel comfortable.
🛑 **Stop if** you feel tension or discomfort.
                `
            }
        ]
    },
    {
        id: 'module-n-2',
        title: 'Module 2: Balanced Resonance',
        description: 'Achieving neither bright nor dark resonance.',
        lessons: [
            {
                id: 'lesson-n-2-1',
                title: 'The Middle Path',
                type: 'theory',
                duration: '5 min',
                description: 'Understanding balanced resonance.',
                content: `
# Balanced Resonance

Resonance is the most powerful gender cue. For androgyny, we want **neutral resonance** - neither distinctly bright nor dark.

## The Spectrum

- **Bright (Feminine)**: Small space, raised larynx, "violin" quality
- **Neutral (Androgynous)**: Moderate space, comfortable larynx position, "viola" quality
- **Dark (Masculine)**: Large space, lowered larynx, "cello" quality

## The Middle Ground

For androgyny, the larynx sits at a **relaxed, neutral height** - neither raised nor lowered. Think of your most comfortable, effortless speaking voice.

## Key Concept

You're not trying to be "between" two voices. You're finding a **third voice** that stands on its own. It's not masculine-lite or feminine-lite - it's neutral.
                `
            },
            {
                id: 'lesson-n-2-2',
                title: 'Neutral Resonance Control',
                type: 'interactive',
                toolId: 'resonance-orb',
                duration: '15 min',
                description: 'Practice maintaining balanced resonance.',
                successCriteria: {
                    primary: 'Keep Resonance Orb in the center/neutral zone for 10 seconds',
                    secondary: ['Feel larynx at neutral height', 'Avoid drifting to bright or dark extremes']
                },
                safety: {
                    warnings: ['Avoid forcing the larynx to stay still - let it rest naturally', 'Breathe normally'],
                    stopIf: ['You feel throat tension', 'You experience discomfort']
                },
                content: `
# Finding Neutral Resonance

Use the Resonance Orb to visualize your resonance position.

## Exercise 1: The Neutral Point
1. Start by humming at your most comfortable, relaxed pitch
2. Notice where the orb lands
3. Try to keep it in the **center zone** - neither bright nor dark
4. This is your neutral resonance

## Exercise 2: Avoiding Extremes
1. Intentionally make your voice bright (raise larynx)
2. Then dark (lower larynx)
3. Then return to center - notice the difference
4. Practice maintaining that center position

## Exercise 3: Speaking in Neutral
1. Maintain neutral resonance while saying "Hello"
2. Try simple phrases while keeping the orb centered
3. Focus on effortlessness - don't force it

**Goal**: Keep the Resonance Orb in the neutral (center) zone.

## Safety Tips
⚠️ **Let your larynx rest naturally** - don't force it.
🛑 **Stop if** you feel tension or strain.
                `
            },
            {
                id: 'lesson-n-2-3',
                title: 'Neutral Vowel Practice',
                type: 'interactive',
                toolId: 'vowel-plot',
                duration: '10 min',
                description: 'Practice balanced vowel production.',
                content: `
# Neutral Vowels

Vowels can sound gendered based on how we shape them. For androgyny, we want **centered vowels**.

## The Vowel Space

Practice keeping your vowels in the **middle of the vowel plot** - not too far forward (bright) or back (dark).

## Exercise

Say these vowels while watching the plot:
- "Ah" (father) - aim for center
- "Eh" (bed) - aim for center
- "Oo" (boot) - slightly back, but not too dark

Focus on **neutral positioning** for all vowels.
                `
            }
        ]
    },
    {
        id: 'module-n-3',
        title: 'Module 3: Flexibility & Code-Switching',
        description: 'Developing the ability to shift presentation as needed.',
        lessons: [
            {
                id: 'lesson-n-3-1',
                title: 'The Art of Code-Switching',
                type: 'theory',
                duration: '5 min',
                description: 'Understanding vocal flexibility.',
                content: `
# Vocal Code-Switching

One powerful aspect of an androgynous voice is **flexibility** - the ability to shift toward masculine or feminine as desired.

## Why Code-Switch?

Many non-binary and genderfluid people want:
- **Safety**: Ability to "pass" in unsafe situations
- **Expression**: Match voice to how you feel today
- **Control**: Choose how you're perceived
- **Play**: Experiment with different presentations

## The Three Modes

1. **Neutral (Home Base)**: Your default androgynous voice
2. **Femme Lean**: Shift slightly toward feminine (raise pitch/resonance slightly)
3. **Masc Lean**: Shift slightly toward masculine (lower pitch/resonance slightly)

## Key Principle

You're not becoming a different person - you're **shading** your voice like an artist adjusts tone. Subtle shifts make big differences.
                `
            },
            {
                id: 'lesson-n-3-2',
                title: 'Shifting Exercises',
                type: 'interactive',
                toolId: 'comparison-tool',
                duration: '15 min',
                description: 'Practice shifting between neutral, femme, and masc.',
                successCriteria: {
                    primary: 'Successfully demonstrate three distinct vocal modes: neutral, femme-leaning, masc-leaning',
                    secondary: ['Control pitch shifts consciously', 'Adjust resonance intentionally', 'Shift smoothly between modes']
                },
                content: `
# Three-Mode Practice

Let's practice shifting between your three vocal modes.

## Exercise 1: Neutral Baseline
Record yourself saying: "Hello, my name is [name]" in your neutral, androgynous voice.

## Exercise 2: Femme Lean
Now shift slightly feminine:
- Raise pitch 10-20Hz
- Brighten resonance slightly (raise larynx just a bit)
- Lighten vocal weight
- Add a bit more melody

Record the same phrase.

## Exercise 3: Masc Lean
Now shift slightly masculine:
- Lower pitch 10-20Hz
- Darken resonance slightly (lower larynx just a bit)
- Add a bit more vocal weight
- Flatten intonation slightly

Record the same phrase.

## Compare

Listen to all three. Notice the differences - they should be subtle but distinct.

**Practice switching** between these modes until you can do it smoothly.
                `
            },
            {
                id: 'lesson-n-3-3',
                title: 'Integration & Real-World Practice',
                type: 'practice',
                duration: '10 min',
                description: 'Apply your androgynous voice in realistic scenarios.',
                content: `
# Living in the Neutral Zone

Now let's practice using your androgynous voice in real-world contexts.

## Scenario Practice

Practice these common phrases in your neutral voice:

1. **Coffee Order**: "Hi, can I get a medium latte, please?"
2. **Phone Call**: "Hello, this is [name] calling about..."
3. **Introduction**: "Nice to meet you, I'm [name]."
4. **Question**: "Excuse me, do you know where the bathroom is?"

## Code-Switching Scenarios

Practice choosing your mode based on context:

- **Safe Space** (friends, home): Use whatever feels right today
- **Professional** (work, phone): Neutral or slightly masc/femme as preferred
- **Unsafe Space** (if needed): Shift to passing voice for safety

## Remember

Your voice is a **tool for self-expression and safety**. There's no "right" way to use it. The goal is control, choice, and comfort.

You are valid. Your voice is valid. 💚
                `
            }
        ]
    }
];

export const getCourseForProfile = (profileId) => {
    switch (profileId) {
        case 'masc':
            return MASCULINIZATION_COURSE;
        case 'neutral':
            return ANDROGYNY_COURSE;
        case 'fem':
        default:
            return FEMINIZATION_COURSE;
    }
};

// Backward compatibility
export const COURSE_DATA = FEMINIZATION_COURSE;
