/**
 * Guided Journey Data - Voice Feminization
 * 
 * A step-by-step beginner experience that guides users through
 * voice feminization concepts one at a time.
 */

export const FEMINIZATION_JOURNEY = {
    id: 'fem-journey',
    title: 'Voice Feminization Journey',
    tagline: 'Your personal step-by-step guide to a more feminine voice',
    estimatedTime: '45-60 minutes',
    theme: {
        gradient: 'from-pink-600 to-purple-600',
        accent: 'pink',
        icon: '🌸'
    },
    steps: [
        // Step 0: Initial Assessment (NEW)
        {
            id: 'student-self-eval',
            type: 'assessment',
            title: 'Initial Self-Assessment',
            subtitle: 'Where are you starting from?',
            content: `
# Unlocking Your Profile

Before we begin, let's take a snapshot of where you are right now. 
This isn't a test—it's a map. By understanding your starting point, we can track your growth.
            `,
            exercise: {
                type: 'student-self-eval'
            },
            coachTip: "Be honest. You don't get points for inflating your score. You get points for growth."
        },

        // Step 0.5: Self-Care Foundation
        {
            id: 'self-care',
            type: 'self-care',
            title: 'Self-Care Foundation',
            subtitle: 'Preparing for the journey ahead',
            content: `
# Why Self-Care Comes First

When we work on feminizing our voice, we're confronting dysphoria around core elements of our being.

This is different from other voice practice. If a singer fails to hit a note, it's frustrating—but it doesn't threaten who they *are* as a person.

**Voice feminization work can challenge the very essence of who you are.**

That's why we start here—not as an afterthought, but as the foundation.

The following questions will help you create a personal self-care plan. When challenges come up (not *if*, but *when*), you'll be prepared.
            `,
            exercise: {
                type: 'self-care-checklist'
            },
            coachTip: "Blocks will happen. It's not a matter of if, it's when. Being prepared in advance makes all the difference."
        },

        // Step 0.6: Practice Philosophy (NEW)
        {
            id: 'practice-philosophy',
            type: 'theory',
            title: 'How to Practice',
            subtitle: 'Active vs. Passive Learning',
            content: `
# The Rules of Engagement

Practice isn't just "doing it." It's HOW you do it.
We distinguish between **Active Practice** (building the car) and **Passive Practice** (driving it).
            `,
            exercise: {
                type: 'practice-philosophy'
            },
            coachTip: "Don't try to 'drive' (speak full time) before you've built the engine."
        },

        // Step 1: Welcome
        {
            id: 'welcome',
            type: 'intro',
            title: 'Welcome to Your Journey',
            subtitle: "Let's begin your voice transformation together",
            content: `
# Your Voice, Your Way

Welcome! 💜 You're about to begin a guided journey to discover and develop your authentic voice.

This isn't just a tutorial – it's a personal coaching experience designed to take you step-by-step through the foundations of voice feminization.

**What to expect:**
- We'll work on **one concept at a time** – no overwhelm
- Each step includes **hands-on practice** with real-time feedback
- You can pause and return **anytime** – your progress is saved

**Before we start**, let's record a quick voice sample. This will help you see your progress at the end!
            `,
            exercise: {
                type: 'baseline-recording',
                instruction: 'Read this sentence naturally: "Hello, my name is [your name] and this is my voice today."',
                duration: 10
            },
            coachTip: "There's no wrong way to start. Just speak naturally – we're capturing where you are right now."
        },

        // Step 1.5: Developing Awareness - Voice Audit
        {
            id: 'awareness-audit',
            type: 'discovery',
            title: 'Developing Awareness: Voice Audit',
            subtitle: 'Exploring the tools you already have',
            content: `
# Opening Your Ears

Before we build a "new" voice, we need to understand the one you already have.

Many people think they "can't do music" or "don't have control," but you actually use countless vocal modes every day!

### What is a Voice Audit?
It's simply taking inventory. You sound different when you:
- Talk to a pet 🐶
- Are angry 😠
- Speak to a baby 👶
- Are sleepy 😴

By noticing these shifts, you realize **you already know how to change your voice**.

### 🎯 The Exercise
1. Use the tool below to record the phrase **"Hi, how are you?"** in different modes.
2. Note how it *feels* physically. Is it tight? Breath? Forward? backward?
3. Don't judge the sound—just observe it.
            `,
            exercise: {
                type: 'voice-audit',
                goals: ['Record at least 3 distinct vocal modes', 'Write one physical sensation for each']
            },
            coachTip: "If you feel silly, GOOD based! That means you're stepping out of your comfort zone, which is where growth happens."
        },

        // Step 1.6: Developing Awareness - Sound Journal
        {
            id: 'awareness-journal',
            type: 'discovery',
            title: 'Developing Awareness: Sound Journal',
            subtitle: 'Expanding your vocal comfort zone',
            content: `
# The Sound Journal

Now that we've audited your speech, let's get weird! 🤪

A **Sound Journal** is a list of *all* the sounds you can make—not just speech. 

### Why do this?
- **Overcome Embarrassment**: Making "weird" noises normalizes vocal exploration.
- **Discover Textures**: You might find a "creak" or "whistle" that unlocks a new resonance control.
- **Expand Possibilities**: If you only practice "safe" sounds, your growth is limited.

### 🎯 The Exercise
1. Use the tool below to log unique sounds.
2. Try imitating nature (wind, dogs) or machines (microwaves, cars).
3. Focus on **texture** and **physical sensation**.
            `,
            exercise: {
                type: 'sound-journal',
                goals: ['Log 3 non-speech sounds', 'Describe the physical limitation or sensation']
            },
            coachTip: "Embarrassment is not fatal. If you feel weird making these sounds, take a breath and keep going. You're safe here."
        },

        // Step 1.7: Goal Setting - Name Design
        {
            id: 'goal-name',
            type: 'discovery',
            title: 'Goal Setting: Visualizing Your Voice',
            subtitle: 'Anchoring your goals with art',
            content: `
# Where Are We Going?

I am not the gender police 👮‍♀️. Maybe you want a hyper-feminine voice, or maybe that feels fake to you.

The goal of this lesson is to find what works **for you**. Not what others expect, but what gives *you* gender euphoria.

### Exercise: Design Your Name
1.  **Draw, paint, or collage** your name in a way that represents your gender presentation.
    *   Lacy and delicate? Bold and blocky? Floral?
2.  **Upload** a photo of it below.
3.  **Imagine** how that image would sound if spoken.

Put this image up in your space. When you feel lost, look at it. Does it still represent you?
            `,
            exercise: {
                type: 'name-visualizer',
                goals: ['Create a visual representation of your name', 'Connect the visual style to a vocal quality']
            },
            coachTip: "This art is your anchor. In six months, check if it still matches who you are becoming."
        },

        // Step 1.8: Goal Setting - Inspiration List
        {
            id: 'goal-inspiration',
            type: 'discovery',
            title: 'Goal Setting: Inspiration List',
            subtitle: 'Finding voices that resonate',
            content: `
# Who Do You Like?

We need a map. Your map is composed of voices you know—friends, family, celebrities.

### Transformation vs. Imitation
We aren't trying to *become* these people, but we can steal their "colors".

### Exercise: The List
1.  List voices you know well.
2.  Identify **Strong Feelings**: Euphoria? Jealousy? Repulsion?
3.  Jealousy is a map pointing to what you want. Repulsion points to what you don't.
            `,
            exercise: {
                type: 'inspiration-board',
                goals: ['List at least 3 voices', 'Identify strong feelings for each', 'Pick 1 top candidate for imitation']
            },
            coachTip: "Jealousy is a very useful emotion. It tells you exactly what you're hungry for."
        },

        // Step 1.9: Goal Setting - Transcription
        {
            id: 'goal-transcription',
            type: 'discovery',
            title: 'Goal Setting: Imitation & Transcription',
            subtitle: 'Learning through Kinesthetic Empathy',
            content: `
# The Power of Copying

Imitation is your strongest tool. If you ever feel stuck, stop thinking and just **copy**.

This is called **Kinesthetic Empathy**. Your body often knows how to mimic a sound even if your brain doesn't understand the mechanics yet.

### Exercise: The Loop
1.  **Passive Listening**: Play a clip while doing dishes. Let it wash over you.
2.  **Active Listening**: Close your eyes. Listen to *only* the sound for 1 minute.
3.  **Speak Along**: Say the words *with* the recording. Match the timing.
4.  **Speak After**: Listen, then fill the silence with your version.
            `,
            exercise: {
                type: 'transcription-practice',
                goals: ['Complete 1 minute of active listening', 'Record a comparison with the reference']
            },
            coachTip: "Go 'ham' on one clip. Listening 100 times reveals details you literally cannot hear on the first pass."
        },

        // Step 1.10: Module 1 Wrap Up
        {
            id: 'module-1-wrapup',
            type: 'module-wrap-up',
            title: 'Week 1: Wrap Up',
            subtitle: 'Reflection & Homework',
            content: '', // Content is handled by the component
            coachTip: "You are not special in your inability to improve. You CAN do this."
        },

        // Module 2: Mechanics & Warm Up

        // Step 2.0: Vocal Hygiene (Green Light)
        {
            id: 'vocal-hygiene',
            type: 'safety',
            title: 'Vocal Hygiene',
            subtitle: 'The Green Light Checklist',
            content: `
# Are you cleared for takeoff?

Before every session, we check our **Vocal Hygiene**.
Practicing on a damaged or dehydrated voice causes injury.
            `,
            exercise: {
                type: 'vocal-hygiene'
            },
            coachTip: "Hydration takes 4 hours to reach your cords. Drinking water NOW helps you LATER."
        },

        // Step 2.05: Relaxation Routine
        {
            id: 'relaxation-routine',
            type: 'action',
            title: 'Tension Release',
            subtitle: 'Unlocking the instrument',
            content: `
# Melting the Armor

Tension is the enemy. We carry stress in our jaw, neck, and shoulders.
We must manually release this armor before we can speak freely.
            `,
            exercise: {
                type: 'relaxation-routine'
            },
            coachTip: "If it hurts, stop. Massage should feel like 'good' pressure, not pain."
        },

        // Step 2.06: Breath Support
        {
            id: 'breath-support',
            type: 'mechanics',
            title: 'Breath Support',
            subtitle: 'The Engine of the Voice',
            content: `
# The Engine

Your voice is powered by AIR.
**Support** isn't about pushing hard—it's about controlling the release.

**Key Concept**: Keep the ribs expanded (like an inner tube) to resist the collapse.
            `,
            exercise: {
                type: 'breath-support'
            },
            coachTip: "Don't 'push' the air out. Let it fall out, but CONTROL the speed."
        },

        // Step 2.1: Why Warm Up?
        {
            id: 'warmup-intro',
            type: 'discovery',
            title: 'Module 2: Why Warm Up?',
            subtitle: 'Preparing mind and body',
            content: `
# Tension is the Enemy

If you try to lift a heavy desk, your throat closes. This is the **Valsalva Maneuver**.
For voice training, we need the opposite: **Sympathetic Relaxation**.

### 3 Reasons to Warm Up
1.  **Reduce Tension**: Relaxed muscles = free larynx movement.
2.  **Proprioception**: Build the brain-body map of tiny muscles.
3.  **Conditioning**: Teach your brain that "Warm Up = Target Voice Time".

### The Routine
We will stretch the body, massage the neck, doing breathing exercises, and finally activate the voice.
            `,
            coachTip: "If you do nothing else, just warm up. It gets your 'vote' in for being a voice practitioner today."
        },

        // Step 2.2: Full Warm-Up
        {
            id: 'full-warmup',
            type: 'discovery',
            title: 'The Full Warm-Up',
            subtitle: 'Stretching, Massage, Breathing, Voice',
            content: `
# Let's Get Loose! 🧘‍♀️

Follow this routine to release tension from your "desk body" and prepare your instrument.

*   **Body Stretches**: Arms, legs, spinal decompression.
*   **Massage**: Jaw, neck, and the "Mama Cat" grab.
*   **Breathing**: Square breathing, snake breath, doggy breath.
*   **Voice**: Glisses and lip trills.

Use the interactive checklist below to track your session.
            `,
            exercise: {
                type: 'warm-up-routine',
                goals: ['Complete physical stretches', 'Release jaw/neck tension', 'Activate breath support', 'Wake up the voice']
            },
            coachTip: "Don't prioritize the 'perfect' pitch here. Focus on the feeling of relaxation."
        },

        // Step 2.3: Quick Warm-Up
        {
            id: 'quick-warmup',
            type: 'discovery',
            title: 'The Quick Warm-Up',
            subtitle: 'For busy days',
            content: `
# No Time? No Problem.

If you can't do the full routine, do this abridged version. It takes 2 minutes.

> "A habit is a vote for the person you want to be."

Get your vote in today!
            `,
            exercise: {
                type: 'quick-warm-up',
                goals: ['Complete 6 quick activations']
            },
            coachTip: "Consistency > Intensity. A 2-minute daily practice beats a 1-hour weekly practice."
        },

        // Step 2.4: Follow Along Warm-Up
        {
            id: 'follow-along-warmup',
            type: 'discovery',
            title: 'Follow Along Warm-Up',
            subtitle: 'Guided Session',
            content: `
# Ready to Practice?

Click the player below to follow along with the guided warm-up routine. 
We'll go through the body stretch, face/neck relaxation, and vocal activation together.

> "Feel free to adapt anything for your body's strengths and weaknesses."
            `,
            exercise: {
                type: 'follow-along-warmup',
                goals: ['Follow the guided routine']
            }
        },

        // Step 2.5: Vocal Anatomy (Part of Module 2)
        {
            id: 'vocal-anatomy',
            type: 'theory',
            title: 'Vocal Anatomy',
            subtitle: 'Understanding the Instrument',
            content: `
# Knowledge is Power

The voice is a wind instrument. To master it, we need to understand how it works.
Don't worry if this feels complicated—you don't need to pass a test! We just want a common vocabulary.

### The 3 Parts of the Instrument
1.  **Power**: The Lungs (Air pressure)
2.  **Source**: The Larynx (Vibration/Buzz)
3.  **Filter**: The Vocal Tract (Shape/Color)

Explore the interactive diagrams below to see how these parts fit together.
            `,
            exercise: {
                type: 'vocal-anatomy',
                goals: ['Explore Power/Source/Filter', 'Identify Larynx parts']
            },
            coachTip: "If you can teach this to someone else, you truly understand it."
        },

        // Step 2.6: Voice Alteration Overview
        {
            id: 'voice-alteration',
            type: 'theory',
            title: 'Voice Alteration Overview',
            subtitle: 'The Framework',
            content: `
# The Big Picture

There is a finite amount of information to learn. 
Combat overwhelm by understanding the main framework:

1.  **Pitch** (High vs Low)
2.  **Weight** (Thick vs Thin)
3.  **Resonance** (Bright vs Dark)

We will dive deep into each, but first, let's get the overview.
            `,
            exercise: {
                type: 'voice-alteration',
                goals: ['Understand Pitch/Weight/Resonance']
            }
        },

        // Step 2.7: Big Picture Assessment
        {
            id: 'big-picture-assessment',
            type: 'action',
            title: 'Exercise: The Big Picture',
            subtitle: 'Re-evaluating Week 1',
            content: `
# Update Your Lists

Now that you have a vocabulary (Pitch, Weight, Resonance), go back to your **Voice Audit**, **Sound Journal**, and **Inspiration Board**.

Can you describe those sounds more accurately now?
            `,
            exercise: {
                type: 'big-picture',
                goals: ['Update previous observations']
            }
        },

        // Step 2.8: Module 2 Wrap Up
        {
            id: 'module-2-wrap-up',
            type: 'milestone',
            title: 'Module 2 Wrap Up',
            subtitle: 'Week 2 Complete!',
            content: `
# You Are A Voice Practitioner

You've built awareness, set goals, learned to warm up, and understood the machine.
This week was heavy on theory. Next week, we start the exercises.

### Journal Prompts
*   What areas of my body need extra love?
*   How do I feel making strange sounds?
*   What fears are coming up?
            `,
            exercise: {
                type: 'module-2-wrap-up',
                goals: ['Reflect on Week 2', 'Plan homework']
            }
        },

        // Module 3: Resonance
        // Step 3.1: Resonance Intro
        {
            id: 'resonance-intro',
            type: 'theory',
            title: 'Module 3: Resonance',
            subtitle: 'Understanding Hearing & Control',
            content: `
# The Most Important Characteristic

Resonance (R1) is the primary gender marker of the voice. 
Before we change it, we must learn to **hear** it and **control** the muscles that move it.

### Hearing Resonance
*   **Ee-Aw**: Pitch stays same, "Ee" is bright (small space), "Aw" is dark (big space).
*   **Ee-Ooh Flick**: Flick your throat while mouthing Ee vs Ooh. Hear the pitch change?
*   **The Concept**: Smaller container = Brighter sound.
            `,
            exercise: {
                type: 'info',
                goals: ['Understand Container Concept', 'Hear Ee vs Aw']
            },
            coachTip: "You are already an expert at this. You use resonance to distinguish vowels every day."
        },

        // Step 3.2: Larynx Control
        {
            id: 'larynx-control',
            type: 'action',
            title: 'Larynx Gym',
            subtitle: 'Controlling the Height',
            content: `
# Moving the Box

To brighten resonance, we raise the larynx (shorten the tube).
To darken it, we lower the larynx (lengthen the tube).

Let's find the triggers that work for you.
            `,
            exercise: {
                type: 'larynx-control',
                goals: ['Find a raising trigger', 'Find a lowering trigger']
            }
        },

        // Step 3.3: Acting Resonance
        {
            id: 'resonance-app',
            type: 'action',
            title: 'Applying Resonance',
            subtitle: 'Key-Oh & Whisper Scream',
            content: `
# Creating the Sound

Now that you can move the larynx, let's use it to speak.
We have two powerful methods to bridge the gap between "weird gym exercise" and "speaking".
            `,
            exercise: {
                type: 'resonance-app',
                goals: ['Master Key-Oh OR Whisper Scream']
            }
        },

        // Step 3.3.5: Tonal Consistency (New)
        {
            id: 'tonal-consistency',
            type: 'mechanics',
            title: 'Tonal Consistency',
            subtitle: 'R1, R2, R3 & Anchoring',
            content: `
# The Resonance Chambers

We can move the Larynx (R1), but what about the Mouth (R2) and Lips (R3)?
**Tonal Consistency** means maintaining your "Bright" shape while articulating different vowels.

**The "EE" Anchor**: The 'EE' vowel naturally keeps the tongue high and the space small. We use it as our home base.
            `,
            exercise: {
                type: 'tonal-consistency'
            },
            coachTip: "If you feel your resonance drop, go back to 'EE' to reset."
        },

        // Step 3.3.6: Vowel Glides (New)
        {
            id: 'vowel-glides',
            type: 'action',
            title: 'Exercise: Vowel Glides',
            subtitle: 'Maintaining the Ring',
            content: `
# Surfing the Anchors

Now we practice moving. Can you slide from **EE** to **AH** without letting the resonance collapse?
Imagine the 'Ring' of the voice is a ball you cannot drop.
            `,
            exercise: {
                type: 'vowel-glides'
            },
            coachTip: "Imagine your tongue is glued to your top molars (the 'Smile' muscles)."
        },

        // Step 3.4: M-Word Challenge
        {
            id: 'm-words',
            type: 'action',
            title: 'The M-Word Challenge',
            subtitle: 'Building Endurance',
            content: `
# "Umm..." is Magic

The "M" sound naturally brings vibration forward. 
Use "Umm" as a trigger to set your larynx height, then slide into words.
            `,
            exercise: {
                type: 'm-words',
                goals: ['Complete Level 1 & 2']
            }
        },

        // Step 3.4.5: Resonance + Breath Balance (New)
        {
            id: 'resonance-breath-balance',
            type: 'mechanics',
            title: 'Resonance + Breath Balance',
            subtitle: 'Finding the Sweet Spot',
            content: `
# Tension vs Breath

Often, when we "Brighten" the voice, we accidentally squeeze (Tension).
The antidote is **Airflow** (Open Quotient).

We need to find the balance between the **Pressed** "Nee" and the **Breathy** "Hee".
            `,
            exercise: {
                type: 'resonance-breath-balance'
            },
            coachTip: "If it feels tight, add 'H' (Breath). If it sounds weak, add 'Twang'."
        },

        // Step 3.4.6: Reading Practice (New)
        {
            id: 'reading-practice',
            type: 'action',
            title: 'Reading Lab: Rainbow Passage',
            subtitle: 'Application in Text',
            content: `
# The Final Boss

Can you keep your **Resonance Anchor** AND your **Breath Balance** while reading?
We use the "Rainbow Passage" because it contains every sound in Earth's languages.
            `,
            exercise: {
                type: 'reading-practice'
            },
            coachTip: "Monotone is fine. Accuracy > Melody."
        },

        // Step 3.5: Daily Phrases
        {
            id: 'daily-phrases',
            type: 'action',
            title: 'Homework: Daily Phrases',
            subtitle: 'Real Life Practice',
            content: `
# Practice What You Speak

Don't practice "The rain in Spain". Practice your coffee order.
Create a list of phrases you actually say.
            `,
            exercise: {
                type: 'daily-phrases',
                goals: ['Create list', 'Practice 5x daily']
            }
        },

        // Step 3.6: Module 3 Wrap Up
        {
            id: 'module-3-wrap-up',
            type: 'milestone',
            title: 'Module 3 Wrap Up',
            subtitle: 'Resonance Unlocked',
            content: `
# Week 3 Complete

You've tackled the hardest concept. Resonance is the key.
Next week, we add Pitch to the mix.
            `,
            exercise: {
                type: 'module-3-wrap-up',
                goals: ['Reflect', 'Check resources']
            }
        },

        // Module 4: Pitch
        // Step 4.1: Piano Theory
        {
            id: 'piano-theory',
            type: 'theory',
            title: 'Quickie Piano Theory',
            subtitle: 'The Language of Pitch',
            content: `
# A Common Language

To talk about pitch, we use the language of music.
You don't need to be a musician, but you need to know your ABCs (A through G).

*   **Octaves**: Groups of 8 notes. C3 is low, C4 is middle.
*   **Frequencies**: A4 = 440 vibrations per second.
            `,
            exercise: {
                type: 'piano-theory',
                goals: ['Understand Notes (A-G)', 'Find Middle C (C4)']
            }
        },

        // Step 4.2: Understanding Your Instrument
        {
            id: 'understanding-instrument',
            type: 'action',
            title: 'Understanding Your Instrument',
            subtitle: 'Range & Average Pitch',
            content: `
# Know Your Voice

Before we change anything, we must understand what we have.
Pitch perception depends on the instrument. A "High" note for a cello is a "Low" note for a violin.

Let's find *your* average speaking pitch and range.
            `,
            exercise: {
                type: 'pitch-exploration',
                goals: ['Find Flip point', 'Find Average Pitch', 'Find Speaking Range']
            }
        },

        // Step 4.3: Target Pitch
        {
            id: 'target-pitch',
            type: 'action',
            title: 'Your Target Range',
            subtitle: 'Choosing & Using',
            content: `
# Choosing a Range

Goal: Choose 4-5 notes that are comfortable and on the *high end* of your natural speaking chest voice.
We want to stay below the "Flip" into head voice.

**The Exercises**:
1.  **Sing Up to 5**: Finding the stable 5 notes.
2.  **Count Jump Slide**: 1-5 (Low), Jump to 10 (High), Slide down.
            `,
            exercise: {
                type: 'target-pitch',
                goals: ['Identify comfortable top/bottom notes']
            }
        },

        // Step 4.4: Memorizing Pitch
        {
            id: 'memorizing-pitch',
            type: 'action',
            title: 'Memorizing Pitch',
            subtitle: 'Anchoring the Voice',
            content: `
# How Low You Don't Go

A feminine voice is defined by its *floor*.
Memorize your starting note so you don't accidentally drop into the "basement".
            `,
            exercise: {
                type: 'pitch-memorizer',
                goals: ['Select Target Note', 'Memorize it']
            }
        },

        // Step 4.5: Module 4 Wrap Up
        {
            id: 'module-4-wrap-up',
            type: 'milestone',
            title: 'Module 4 Wrap Up',
            subtitle: 'Pitch Perfect',
            content: `
# Week 4 Complete

You've explored the controversial topic of Pitch.
Remember: Pitch is just one piece of the puzzle. Resonance (Week 3) + Pitch (Week 4) + Weight (Week 5) = Magic.
            `,
            exercise: {
                type: 'module-4-wrap-up',
                goals: ['Reflect', 'Check Homework']
            }
        },

        // Module 5: Vocal Weight
        {
            id: 'weight-theory',
            type: 'theory',
            title: 'Module 5: Vocal Weight',
            subtitle: 'Or: Vocal Fold Mass',
            content: `
# Heaviness vs. Lightness

Vocal Weight (or Mass) is the difference between a **Thick/Buzzy** sound (like a cough or a shout) and a **Thin/Light** sound (like a yawn or a whisper).
Testosterone makes vocal folds thick. Feminization involves learning to use just the thin edges.

**The Spectrum**:
*   **Pressed/Thick**: Buzzy. Strong vibrations.
*   **Balanced**: Clear tone.
*   **Breathy**: Air escaping.
            `,
            exercise: {
                type: 'weight-theory',
                goals: ['Understand Mass', 'Learn to Abduct/Adduct']
            }
        },
        {
            id: 'weight-toolbox',
            type: 'action',
            title: 'The Weight Toolbox',
            subtitle: '7 Tools to Find "Thin"',
            content: `
# Your Toolbox

We have 7 different tools to help you find that "Thin" sensation.
Different tools work for different people. Explore them all!

1.  **Imitation**: Mimic cartoon characters.
2.  **Triggers**: Yawning, Sobbing.
3.  **Chicken Neck**: Physical stretching.
4.  **SOVT**: Straw phonation (Bernoulli Effect).
5.  **Advanced**: Ingression, Slides, Pop Test.
            `,
            exercise: {
                type: 'weight-toolbox',
                goals: ['Find a tool that works', 'Practice Thin sensation']
            }
        },
        // Step 5.3: Register Blend (Advanced Weight)
        {
            id: 'register-blend',
            type: 'mechanics',
            title: 'Register Blending',
            subtitle: 'Messa di Voce',
            content: `
# The Swell

Can you get louder without getting thicker?
**Messa di Voce** (Placing the Voice) is the art of starting soft (Thin), swelling to loud (Mix), and returning to soft (Thin).
            `,
            exercise: {
                type: 'register-blend'
            },
            coachTip: "If you crack/break, you added too much weight too fast. Slow down."
        },

        // Step 5.4: Twang Dojo (New)
        {
            id: 'twang-dojo',
            type: 'mechanics',
            title: 'The Twang Dojo',
            subtitle: 'Loudness without Weight',
            content: `
# The Laser Beam

How do feminine voices get loud without sounding like a man shouting?
**Twang** (The Aryepiglottic Sphincter).
It adds piercing brightness (like a Witch or Baby) to cut through noise.
            `,
            exercise: {
                type: 'twang-dojo'
            },
            coachTip: "It should feel 'buzzy' in the nose, not scratchy in the throat."
        },

        // Step 5.5: Projection Practice (New)
        {
            id: 'projection-practice',
            type: 'action',
            title: 'Safe Projection',
            subtitle: 'The "Hey You!" Test',
            content: `
# Don't Grunt, Call.

When we yell, we instinctively drop pitch and thicken folds (Grunt).
We must retrain the brain to use **High Pitch + Twang** (Call).
            `,
            exercise: {
                type: 'projection-practice'
            },
            coachTip: "Imagine calling a dog from across the park. 'Puppy!'"
        },
        {
            id: 'module-5-wrap-up',
            type: 'milestone',
            title: 'Module 5 Wrap Up',
            subtitle: 'The Big Three Complete',
            content: `
# Week 5 Complete

You have now covered Pitch, Resonance, and Weight — the "Holy Trinity" of voice feminization.
Next week, we put them together with Inflection (Melody) and Advanced Habits.
            `,
            exercise: {
                type: 'module-5-wrap-up',
                goals: ['Reflect', 'Check Homework']
            }
        },

        // Module 6: Inflection & Habits
        // Step 6.1: Prosody Theory
        {
            id: 'prosody-theory',
            type: 'theory',
            title: 'Module 6: Prosody',
            subtitle: 'The 5 Key Ideas',
            content: `
# It's Not Just Pitch

If you have perfect Pitch, Resonance, and Weight, but you speak in a flat monotone... you'll sound like a "Male Robot".
**Prosody** is the melody of speech.

We break it down into **5 Keys**:
1. Bounciness (Pitch Movement)
2. Tempo Variation (Speed)
3. Vowel Elongation (Waaaarmth)
4. Diction (Crispness)
5. Syllable Separation (Clarity)
            `,
            exercise: {
                type: 'prosody-theory'
            },
            coachTip: "Think of your voice as a cello, not a typewriter."
        },

        // Step 6.2: Syllable Stacker
        {
            id: 'syllable-stacker',
            type: 'action',
            title: 'Syllable Separation',
            subtitle: 'Robot vs Elastic',
            content: `
# Stop Mumbling

A common masculine habit is "Slurring" words together (Mumbling).
Feminine speech tends to have cleaner separation between syllables.

We retrain this by going to the extreme (**Robot Mode**) and then softening it (**Elastic Mode**).
            `,
            exercise: {
                type: 'syllable-stacker'
            },
            coachTip: "Treat. Every. Syllable. Like. A. Brick."
        },

        // Step 6.3: Inflection Map
        {
            id: 'inflection-map',
            type: 'action',
            title: 'Inflection Mapping',
            subtitle: 'Visualizing the Melody',
            content: `
# Draw the Map

Reading text can trap us in "Boring Reader Voice".
To break out, we need to **visualize** the melody before we say it.
We use a Map of Arrows (Pitch), Boldness (Volume), and Spacing (Tempo).
            `,
            exercise: {
                type: 'inflection-map'
            },
            coachTip: "If it feels silly and exaggerated, you're doing it right."
        },
        {
            id: 'habit-builder',
            type: 'action',
            title: 'Building Habits',
            subtitle: 'How to make practice automatic',
            content: `
# Cue > Action > Reward

Willpower is finite. Habits are forever.
We want to move from "Trying hard to practice" to "Automatically practicing".

**Habit Stacking**:
"After I [Brush my teeth], I will [Hum for 1 minute]."
            `,
            exercise: {
                type: 'habit-builder',
                goals: ['Identify Cues', 'Create a Habit Stack']
            }
        },
        {
            id: 'cognitive-load',
            type: 'action',
            title: 'Cognitive Load Games',
            subtitle: 'Training Endurance',
            content: `
# Can you do it while distracted?

It's easy to hold a voice when you're focusing 100%.
But real life is distracting. We need to train your brain to hold the voice AUTOMATICALLY.

**The Games**:
*   Scattergories
*   Counting Backwards
*   Telling a story
            `,
            exercise: {
                type: 'cognitive-load',
                goals: ['Practice while distracted', 'Increase automaticity']
            }
        },
        {
            id: 'module-6-wrap-up',
            type: 'milestone',
            title: 'Module 6 Wrap Up',
            subtitle: 'Melody Mastered',
            content: `
# You Have The Melody

Now your voice dances instead of walking.
You have Pitch, Weight, Resonance, and Prosody.
Next: We bring it to LIFE.
            `,
            exercise: {
                type: 'module-6-wrap-up',
                goals: ['Reflect', 'Prepare for Style']
            }
        },

        // Module 7: Style & Life
        {
            id: 'style-intro',
            type: 'theory',
            title: 'Module 7: Style & Life',
            subtitle: 'Living in the Voice',
            content: `
# Beyond the Mechanics

You have built the instrument. Now you must learn to play jazz.
This module is about **Improvisation**, **Recovery**, and **Personality**.
            `,
            exercise: {
                type: 'info',
                goals: ['Understand Style', 'Ready for Life']
            }
        },
        {
            id: 'recovery-strategy',
            type: 'mechanics',
            title: 'Recovery Strategy',
            subtitle: 'When (Not If) You Fall',
            content: `
# The Art of Recovery

You WILL drop your voice. You WILL dip pitch.
The difference between a student and a master is not "Perfection", it is "Recovery Speed".
We use **Anchor Words** and **Resets** to bounce back instantly.
            `,
            exercise: {
                type: 'recovery-strategy'
            },
            coachTip: "Don't apologize when you mess up. Just reset."
        },
        {
            id: 'texture-play',
            type: 'action',
            title: 'Texture Laboratory',
            subtitle: 'Painting with Sound',
            content: `
# Your Voice has Color

Is your voice "Smooth"? "Scratchy"? "Breathy"? "Warm"?
You are not stuck with one texture. You can paint with all of them.
            `,
            exercise: {
                type: 'texture-play'
            },
            coachTip: "Try 'Marilyn Monroe' vs 'News Anchor'."
        },
        {
            id: 'style-mixer',
            type: 'action',
            title: 'The Style Mixer',
            subtitle: 'Designing your Preset',
            content: `
# Who Are You?

You are the audio engineer of your own soul.
Use the mixer to design your default "Preset".
Do you want to be Bubbly? Serious? Cozy? It's your choice.
            `,
            exercise: {
                type: 'style-mixer'
            },
            coachTip: "There is no 'Right' voice. Only 'Your' voice."
        },

        // Course Graduation
        {
            id: 'course-completion',
            type: 'milestone',
            title: 'The Final Reflection',
            subtitle: 'Are you ready to fly?',
            content: `
# The End of the Beginning

You have completed the **Green Light Protocol**.
But before we certify you as a "Graduate", we must verify your readiness.

**Self-Coaching** means you no longer need the app to tell you what is wrong.
You can hear it. You can feel it. You can fix it.
            `,
            exercise: {
                type: 'graduation-reflection',
                goals: ['Verify Readiness', 'Build Maintenance Plan']
            }
        }
    ]
};

// Helper to get step by ID
export const getStepById = (journeyData, stepId) => {
    return journeyData.steps.find(step => step.id === stepId);
};

// Helper to get step index
export const getStepIndex = (journeyData, stepId) => {
    return journeyData.steps.findIndex(step => step.id === stepId);
};

// Helper to get next step
export const getNextStep = (journeyData, currentStepId) => {
    const currentIndex = getStepIndex(journeyData, currentStepId);
    if (currentIndex < journeyData.steps.length - 1) {
        return journeyData.steps[currentIndex + 1];
    }
    return null;
};

// Helper to get previous step
export const getPreviousStep = (journeyData, currentStepId) => {
    const currentIndex = getStepIndex(journeyData, currentStepId);
    if (currentIndex > 0) {
        return journeyData.steps[currentIndex - 1];
    }
    return null;
};

// Future: Add MASCULINIZATION_JOURNEY and ANDROGYNY_JOURNEY here
export const MASCULINIZATION_JOURNEY = null; // Placeholder
export const ANDROGYNY_JOURNEY = null; // Placeholder

export default FEMINIZATION_JOURNEY;
