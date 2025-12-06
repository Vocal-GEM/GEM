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

        // Step 2: Pitch Theory
        {
            id: 'pitch-theory',
            type: 'theory',
            title: 'Understanding Pitch',
            subtitle: 'The foundation of vocal gender perception',
            content: `
# What is Pitch?

**Pitch** is how high or low your voice sounds. It's measured in Hertz (Hz).

### The Gender Spectrum of Pitch

| Range | Typical Association |
|-------|---------------------|
| 85-145 Hz | Masculine range |
| 145-175 Hz | Androgynous range |
| 165-255 Hz | Feminine range |

### The Truth About Pitch

Here's something important: **pitch alone doesn't make a voice feminine**. 

You've probably heard people with higher voices that still sound masculine, or lower voices that sound feminine. That's because pitch is just *one piece* of the puzzle.

However, pitch is the **easiest to measure and practice**, which makes it a great starting point.
            `,
            illustration: 'pitch-spectrum',
            coachTip: "Don't stress about hitting specific numbers. We're building awareness first, control comes with practice."
        },

        // Step 3: Pitch Discovery
        {
            id: 'pitch-discovery',
            type: 'interactive',
            title: 'Finding Your Pitch',
            subtitle: 'See your voice in real-time',
            content: `
# Let's See Your Pitch

The visualizer below shows your pitch as you speak. The **blue line** represents your voice moving in real-time.

**Try this:**
1. Hum a comfortable note – watch where it lands
2. Try humming slightly higher
3. Now try speaking: "Hello, how are you today?"

Notice how your pitch moves up and down as you speak. That movement is natural and good!
            `,
            tool: 'pitch-visualizer',
            exercise: {
                type: 'exploration',
                goals: [
                    'Observe your baseline speaking pitch',
                    'Notice your pitch range (how much it moves)',
                    'Try raising pitch slightly without strain'
                ],
                duration: 120
            },
            successCriteria: {
                type: 'time-spent',
                minimumSeconds: 60
            },
            coachTip: "If raising your pitch feels strained, that's totally normal! We're just exploring. No forcing."
        },

        // Step 4: Resonance Theory
        {
            id: 'resonance-theory',
            type: 'theory',
            title: 'What is Resonance?',
            subtitle: 'The secret ingredient most people miss',
            content: `
# The Magic of Resonance

**Resonance** is the "color" or "size" of your voice. It's what makes a cello sound different from a violin, even playing the same note.

### Think of it This Way:

- **Dark Resonance** (masculine): Like speaking into a large barrel. The sound is deep and full.
- **Bright Resonance** (feminine): Like speaking into a small, shiny space. The sound is lighter and more forward.

### Why Resonance Matters MORE Than Pitch

You could raise your pitch to 200Hz, but if your resonance stays dark, you'll sound like a man doing a "Mickey Mouse" voice.

Conversely, someone with a lower pitch but bright resonance can sound undeniably feminine.

### How Resonance Works

Resonance is controlled by the **space in your throat and mouth**:
- 🥱 Yawning creates a LARGE space = dark/masculine
- 😊 "Small smile" or swallowing feeling = SMALL space = bright/feminine
            `,
            illustration: 'resonance-comparison',
            coachTip: "This is the concept that changes everything. Take your time understanding it."
        },

        // Step 5: Resonance Discovery
        {
            id: 'resonance-discovery',
            type: 'interactive',
            title: 'Feeling Resonance',
            subtitle: 'Watch the orb respond to your voice',
            content: `
# The Resonance Orb

This orb responds to your voice's resonance in real-time:
- **Bottom/Left** = Darker, larger resonance
- **Top/Right** = Brighter, smaller resonance

**Exercises to try:**

1. **The Yawn Test**: Do a big yawn and hum – watch the orb go dark
2. **The Smile Test**: Think of smiling with your throat (not just lips) and say "Heeee" – watch it brighten
3. **The Small Space**: Imagine you just swallowed something and speak from that "small" feeling
            `,
            tool: 'resonance-orb',
            exercise: {
                type: 'guided-exploration',
                goals: [
                    'Move the orb to the dark/bottom area (yawn)',
                    'Move the orb to the bright/top-right area (small throat)',
                    'Sustain a bright resonance for 5 seconds'
                ],
                duration: 180
            },
            successCriteria: {
                type: 'orb-position',
                targetZone: 'bright',
                duration: 5
            },
            coachTip: "Don't worry if it feels weird at first. You're training muscles you've never consciously used before!"
        },

        // Step 6: Vocal Weight Theory
        {
            id: 'weight-theory',
            type: 'theory',
            title: 'Understanding Vocal Weight',
            subtitle: 'The texture that defines your voice',
            content: `
# What is Vocal Weight?

**Vocal weight** is how "heavy" or "light" your voice sounds – the amount of "buzz" or intensity.

### Heavy vs. Light

| Heavy Voice | Light Voice |
|-------------|-------------|
| Loud, buzzy, commanding | Soft, airy, gentle |
| Like a shout | Like a lullaby |
| Strong chest vibration | Forward, heady feeling |

### For Feminization

Masculine speech typically has more **vocal weight** – it's fuller and buzzier.

Feminine speech often has **lighter weight** – softer, with less "push" behind it.

**The goal**: Light but CLEAR. Not breathy or whispered, just... less forceful.
            `,
            illustration: 'weight-comparison',
            coachTip: "Lightening doesn't mean getting quieter! It's about reducing the 'buzz' while keeping clarity."
        },

        // Step 7: Weight Practice
        {
            id: 'weight-practice',
            type: 'interactive',
            title: 'Lightening Your Voice',
            subtitle: 'Practice reducing vocal weight',
            content: `
# The Voice Quality Meter

This meter shows your **vocal weight** in real-time:
- **Red zone (Pressed/Heavy)** = Too much force
- **Green zone (Neutral)** = Balanced
- **Blue zone (Light)** = Goal for feminization

**Exercises:**

1. Count "1, 2, 3, 4, 5" in your normal voice. Notice where the meter lands.
2. Now say "Haaaa" softly, like fogging up a mirror.
3. Try counting again with that same gentle feeling.
            `,
            tool: 'voice-quality',
            exercise: {
                type: 'target-zone',
                goals: [
                    'Observe your default vocal weight',
                    'Find the "fog a mirror" feeling',
                    'Speak while staying in green/blue zone'
                ],
                duration: 120
            },
            successCriteria: {
                type: 'meter-zone',
                targetZone: 'light-neutral',
                duration: 10
            },
            coachTip: "If you go too light, you'll sound breathy. Find the sweet spot – light but not airy."
        },

        // Step 8: Checkpoint
        {
            id: 'combo-checkpoint',
            type: 'checkpoint',
            title: 'Checkpoint: The Big 3',
            subtitle: "Let's combine what you've learned",
            content: `
# You've Learned the Foundations! 🎉

**The 3 Pillars of Voice Feminization:**

1. ✅ **Pitch** – Higher speaking frequency
2. ✅ **Resonance** – Brighter, smaller throat space  
3. ✅ **Vocal Weight** – Lighter, less buzzy

### Mini Challenge

Try this sentence while thinking about ALL THREE:

> "Hello, it's so nice to meet you!"

- Keep your pitch in a comfortable higher range
- Think "small throat" for bright resonance
- Speak gently without forcing
            `,
            exercise: {
                type: 'integration',
                instruction: 'Speak the phrase above 3 times, trying to apply all three concepts.',
                duration: 60
            },
            celebration: true,
            coachTip: "It won't be perfect – and that's okay! You're rewiring years of muscle memory. Every attempt counts."
        },

        // Step 9: Vowels
        {
            id: 'vowel-intro',
            type: 'interactive',
            title: 'Vowel Modification',
            subtitle: 'Brightening your vowel sounds',
            content: `
# Why Vowels Matter

Vowels are the **core of resonance**. They're the sustained sounds in speech where your voice really shines through.

**The Vowel Space Plot** below shows where your vowels land acoustically.

For feminization, we generally want vowels to be **brighter** (shifted toward the top-right of the chart).

**Try this:**
1. Say "Eeee" (as in "see") – should be top-right
2. Say "Ahhh" (as in "father") – typically bottom-left
3. Now try saying "Ahhh" but brighten it slightly – watch it shift!
            `,
            tool: 'vowel-plot',
            exercise: {
                type: 'vowel-exploration',
                goals: [
                    'Identify where your natural vowels land',
                    'Practice brightening the "Ahhh" sound',
                    'Notice how lip position affects F2'
                ],
                duration: 120
            },
            coachTip: "Vowel modification is subtle. Small changes in tongue and lip position make a big difference."
        },

        // Step 10: Intonation
        {
            id: 'intonation',
            type: 'interactive',
            title: 'Adding Melody',
            subtitle: 'The music of feminine speech',
            content: `
# Intonation: The Melody of Speech

**Intonation** is how your pitch rises and falls as you speak. It's the "melody" of your voice.

### Masculine vs. Feminine Intonation

| Masculine Pattern | Feminine Pattern |
|-------------------|------------------|
| Flatter, more monotone | More variation, melodic |
| Drops at end of sentences | Often rises or lilts |
| Less pitch range | Wider pitch range |

**The visualizer** below shows your pitch contour – the "hills and valleys" of your speech.

**Try saying:**
> "I'm going to the store."

Watch your pitch line. Is it flat? Try adding hills: go UP on "going" and DOWN at the end.
            `,
            tool: 'contour-visualizer',
            exercise: {
                type: 'intonation-practice',
                goals: [
                    'Observe your natural speech melody',
                    'Practice adding pitch variation',
                    'Try ending some phrases with a slight rise'
                ],
                duration: 120
            },
            coachTip: "Overdo it at first! You'll feel silly, but exaggeration helps you find the range, then dial it back."
        },

        // Step 11: Integration
        {
            id: 'integration',
            type: 'exercise',
            title: 'Putting It All Together',
            subtitle: 'Full practice with all concepts',
            content: `
# Integration Practice

Now let's practice with **everything combined**:

1. **Higher pitch** (comfortable, not strained)
2. **Bright resonance** (small throat space)
3. **Light weight** (gentle, not breathy)
4. **Melodic intonation** (expressive, varied)

### Practice Phrases

Read each phrase out loud, focusing on all four elements:

1. "Hi! How are you doing today?"
2. "Oh, that's so interesting! Tell me more."
3. "I was thinking we could go to that new café."

Take your time. It's okay to pause between phrases.
            `,
            tool: 'pitch-visualizer',
            exercise: {
                type: 'full-practice',
                phrases: [
                    "Hi! How are you doing today?",
                    "Oh, that's so interesting! Tell me more.",
                    "I was thinking we could go to that new café."
                ],
                duration: 180
            },
            coachTip: "This is where it clicks. You might surprise yourself! Or it might feel hard – both are normal."
        },

        // Step 12: Completion
        {
            id: 'completion',
            type: 'checkpoint',
            title: 'Your Progress',
            subtitle: "Look how far you've come",
            content: `
# Congratulations! 🎉

You've completed the Voice Feminization Journey!

**What you've learned:**
- ✅ How pitch affects voice perception
- ✅ The importance of resonance (bright vs. dark)
- ✅ How to lighten your vocal weight
- ✅ Vowel modification techniques
- ✅ Adding melody through intonation

### What's Next?

This is just the beginning. Voice training is a skill that develops over time with consistent practice.

**Recommendations:**
1. Practice for **10-15 minutes daily** – short, consistent sessions beat long occasional ones
2. Use the **Voice Analysis** tab to track your metrics over time
3. Record yourself reading aloud and listen back
4. Be patient with yourself – this takes months, not days

### Record Your Progress

Let's capture your voice now so you can compare to your baseline recording!
            `,
            exercise: {
                type: 'progress-recording',
                instruction: 'Read the same sentence from the beginning: "Hello, my name is [your name] and this is my voice today."',
                compareToBaseline: true,
                duration: 10
            },
            celebration: true,
            final: true,
            coachTip: "Every journey begins with a single step. You've just taken twelve. Be proud of yourself. 💜"
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
