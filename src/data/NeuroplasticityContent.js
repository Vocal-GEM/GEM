/**
 * NeuroplasticityContent.js
 * 
 * Educational content about how voice training rewires the brain,
 * designed to help users understand why consistent practice matters.
 */

export const NEUROPLASTICITY_CONCEPTS = [
    {
        id: 'neuro-1',
        title: 'Your Brain is Plastic',
        emoji: '🧠',
        content: `
**Neuroplasticity** is your brain's ability to reorganize itself by forming new neural connections.

When you practice voice training:
- Neurons that "fire together, wire together"
- New motor patterns become automatic over time
- Your brain literally changes structure

**What this means for you**: Every practice session, no matter how small, is physically changing your brain. The awkward feeling of a new voice pattern is just your brain building new highways.
        `,
        keyTakeaway: 'Your brain changes with every practice session.'
    },
    {
        id: 'neuro-2',
        title: 'The 10,000 Hour Myth (Debunked)',
        emoji: '⏰',
        content: `
You don't need 10,000 hours. Quality matters more than quantity.

**Deliberate Practice** (the kind that actually works):
- Focused attention (no multitasking)
- Immediate feedback (using visualizers)
- Working just outside your comfort zone
- Specific goals for each session

**Research shows**: 15 minutes of deliberate practice often beats hours of unfocused practice. Voice training is no different.
        `,
        keyTakeaway: 'Quality practice beats quantity every time.'
    },
    {
        id: 'neuro-3',
        title: 'Why It Feels Hard (And That\'s Good)',
        emoji: '💪',
        content: `
That frustrating feeling when your voice "won't cooperate"? That's called **productive struggle**.

**The science**:
- Learning requires effort
- Error signals drive neural adaptation
- Comfort zones don't create change

**The reframe**: When it feels hard, you're not failing - you're in the zone where growth happens. Easy practice = maintenance. Hard practice = growth.
        `,
        keyTakeaway: 'Struggle is a sign of learning, not failure.'
    },
    {
        id: 'neuro-4',
        title: 'Sleep: Your Secret Weapon',
        emoji: '😴',
        content: `
Your brain consolidates motor skills during sleep. This is called **memory consolidation**.

**During deep sleep**:
- Practice sessions are "replayed" in your brain
- Neural connections are strengthened
- Motor patterns become more automatic

**Practical tip**: Don't cram practice. Better to do 15 mins, sleep, then 15 mins the next day than 30 mins all at once. Your sleeping brain does the heavy lifting.
        `,
        keyTakeaway: 'Sleep between sessions makes practice stick.'
    },
    {
        id: 'neuro-5',
        title: 'The Habit Loop',
        emoji: '🔄',
        content: `
Voice training becomes effortless when it becomes a **habit**.

**The Habit Loop**:
1. **Cue**: Something that triggers the behavior (e.g., morning coffee)
2. **Routine**: The practice itself
3. **Reward**: The good feeling after practice

**Build your loop**:
- Stack voice practice with existing habits
- Keep it small and consistent (5 mins beats 0 mins)
- Celebrate after each session
        `,
        keyTakeaway: 'Attach practice to existing habits.'
    },
    {
        id: 'neuro-6',
        title: 'Plateau Are Normal',
        emoji: '📊',
        content: `
Progress isn't linear. **Plateaus** are a normal part of skill acquisition.

**Why plateaus happen**:
- Your brain is integrating new skills
- Consolidation takes time
- "Hidden" progress is happening below the surface

**What to do**:
- Keep showing up
- Vary your practice slightly
- Trust the process (it's literally biology)
- Track progress over weeks, not days
        `,
        keyTakeaway: 'Plateaus are integration phases, not failure.'
    },
    {
        id: 'neuro-7',
        title: 'The Power of Visualization',
        emoji: '🎯',
        content: `
**Mental practice** activates the same brain regions as physical practice.

**Studies show**:
- Musicians who visualized improved almost as much as those who practiced
- Athletes use visualization as standard training
- Your brain can't fully tell the difference

**For voice training**:
- Before speaking, imagine the voice you want
- Visualize the resonance, the pitch, the feeling
- Then speak into that imagined space
        `,
        keyTakeaway: 'Imagine your target voice before you speak.'
    },
    {
        id: 'neuro-8',
        title: 'Consistency Over Intensity',
        emoji: '📅',
        content: `
Your brain responds better to **spaced repetition** than marathon sessions.

**The math**:
- 10 mins/day for 7 days = neural highway
- 70 mins once a week = neural dirt road

**Why spacing works**:
- Each session triggers reconsolidation
- Memory is strengthened with each retrieval
- Prevents overload and burnout

**Your action**: Show up briefly, but show up often.
        `,
        keyTakeaway: 'Daily tiny sessions beat weekly marathons.'
    }
];

// Quick facts for UI display
export const NEURO_QUICK_FACTS = [
    'Your brain can change at any age',
    'Practice activates the motor cortex',
    'Sleep consolidates voice training gains',
    'Neurons that fire together, wire together',
    'Small daily practice > big weekly sessions',
    'Struggle means your brain is adapting',
    'Visualization primes motor patterns',
    'Plateaus are consolidation phases'
];

/**
 * Get all neuroplasticity concepts
 */
export const getAllConcepts = () => NEUROPLASTICITY_CONCEPTS;

/**
 * Get a concept by ID
 */
export const getConcept = (id) => {
    return NEUROPLASTICITY_CONCEPTS.find(c => c.id === id);
};

/**
 * Get a random quick fact
 */
export const getRandomFact = () => {
    return NEURO_QUICK_FACTS[Math.floor(Math.random() * NEURO_QUICK_FACTS.length)];
};

export default {
    NEUROPLASTICITY_CONCEPTS,
    NEURO_QUICK_FACTS,
    getAllConcepts,
    getConcept,
    getRandomFact
};
