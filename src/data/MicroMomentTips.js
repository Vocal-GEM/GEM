/**
 * MicroMomentTips.js
 * 
 * Quick, contextual tips for voice training that can be shown
 * throughout the user's day and during session transitions.
 */

// Categories of tips
export const TIP_CATEGORIES = {
    WARMUP: 'warmup',
    RESONANCE: 'resonance',
    PITCH: 'pitch',
    HEALTH: 'health',
    MINDSET: 'mindset',
    PRACTICE: 'practice',
    DAILY: 'daily',
    RECOVERY: 'recovery'
};

export const MICRO_TIPS = [
    // WARMUP TIPS
    {
        id: 'tip-1',
        text: '🌅 Morning voice feeling rough? That\'s normal! Do gentle lip trills before speaking.',
        category: TIP_CATEGORIES.WARMUP,
        context: ['morning', 'session_start']
    },
    {
        id: 'tip-2',
        text: '🫁 Try a 10-second hum right now. Notice how your voice feels before and after.',
        category: TIP_CATEGORIES.WARMUP,
        context: ['session_start', 'anytime']
    },
    {
        id: 'tip-3',
        text: '💧 Yawn-sigh combo: Yawn, then sigh out gently. Great quick reset!',
        category: TIP_CATEGORIES.WARMUP,
        context: ['session_start', 'tired']
    },

    // RESONANCE TIPS
    {
        id: 'tip-4',
        text: '✨ Think of smiling with your throat, not just your face. It naturally brightens resonance.',
        category: TIP_CATEGORIES.RESONANCE,
        context: ['practice', 'anytime']
    },
    {
        id: 'tip-5',
        text: '👃 Touch your nose while humming - can you feel the buzz? That\'s forward resonance!',
        category: TIP_CATEGORIES.RESONANCE,
        context: ['practice']
    },
    {
        id: 'tip-6',
        text: '🎯 Imagine your sound pointing forward, not down into your chest.',
        category: TIP_CATEGORIES.RESONANCE,
        context: ['practice', 'struggling']
    },
    {
        id: 'tip-7',
        text: '🔔 "Mmm-hmm!" like you\'re agreeing - that\'s your forward resonance sweet spot.',
        category: TIP_CATEGORIES.RESONANCE,
        context: ['practice', 'anytime']
    },

    // PITCH TIPS
    {
        id: 'tip-8',
        text: '📈 Pitch follows thought. Think "light and up" before you speak.',
        category: TIP_CATEGORIES.PITCH,
        context: ['practice', 'anytime']
    },
    {
        id: 'tip-9',
        text: '🎢 Monotone is fine sometimes! Pitch variation matters more than constant height.',
        category: TIP_CATEGORIES.PITCH,
        context: ['practice', 'frustrated']
    },
    {
        id: 'tip-10',
        text: '⬆️ End questions with a slight upward lilt. It\'s natural and musical.',
        category: TIP_CATEGORIES.PITCH,
        context: ['practice']
    },

    // HEALTH TIPS
    {
        id: 'tip-11',
        text: '💧 Sip water regularly. Hydrated vocal cords = happy vocal cords.',
        category: TIP_CATEGORIES.HEALTH,
        context: ['session_mid', 'anytime']
    },
    {
        id: 'tip-12',
        text: '😮‍💨 If your voice feels tired, stop. Rest is part of training.',
        category: TIP_CATEGORIES.HEALTH,
        context: ['session_mid', 'tired']
    },
    {
        id: 'tip-13',
        text: '🫖 Caffeine and alcohol dehydrate. Balance with extra water!',
        category: TIP_CATEGORIES.HEALTH,
        context: ['morning', 'evening']
    },
    {
        id: 'tip-14',
        text: '🤫 Whispering actually strains your voice more than soft speaking.',
        category: TIP_CATEGORIES.HEALTH,
        context: ['anytime']
    },
    {
        id: 'tip-15',
        text: '🍵 Steam inhalation before practice can loosen up tight vocal cords.',
        category: TIP_CATEGORIES.HEALTH,
        context: ['morning', 'session_start']
    },

    // MINDSET TIPS
    {
        id: 'tip-16',
        text: '🌱 Progress isn\'t always audible. Trust the process.',
        category: TIP_CATEGORIES.MINDSET,
        context: ['frustrated', 'discouraged']
    },
    {
        id: 'tip-17',
        text: '💜 Your voice is valid today, exactly as it is.',
        category: TIP_CATEGORIES.MINDSET,
        context: ['low_mood', 'session_start']
    },
    {
        id: 'tip-18',
        text: '🎯 5 minutes of focused practice beats 30 minutes of distracted practice.',
        category: TIP_CATEGORIES.MINDSET,
        context: ['session_start', 'anytime']
    },
    {
        id: 'tip-19',
        text: '🔄 Bad voice day? It happens. Tomorrow is a fresh start.',
        category: TIP_CATEGORIES.MINDSET,
        context: ['frustrated', 'session_end']
    },
    {
        id: 'tip-20',
        text: '✨ You showed up today. That already counts.',
        category: TIP_CATEGORIES.MINDSET,
        context: ['session_start', 'low_mood']
    },

    // PRACTICE TIPS
    {
        id: 'tip-21',
        text: '📖 Reading aloud for 5 mins daily = real-world practice.',
        category: TIP_CATEGORIES.PRACTICE,
        context: ['anytime', 'session_end']
    },
    {
        id: 'tip-22',
        text: '🎙️ Record yourself! You\'ll hear progress you can\'t perceive in real-time.',
        category: TIP_CATEGORIES.PRACTICE,
        context: ['anytime', 'discouraged']
    },
    {
        id: 'tip-23',
        text: '🗣️ Talk to your pet, plants, or self. They won\'t judge your practice!',
        category: TIP_CATEGORIES.PRACTICE,
        context: ['anytime']
    },
    {
        id: 'tip-24',
        text: '📱 Order food by phone = voice training in disguise.',
        category: TIP_CATEGORIES.PRACTICE,
        context: ['daily', 'anytime']
    },

    // DAILY INTEGRATION
    {
        id: 'tip-25',
        text: '🚿 Shower time = humming time. The acoustics are great!',
        category: TIP_CATEGORIES.DAILY,
        context: ['morning', 'anytime']
    },
    {
        id: 'tip-26',
        text: '🚗 Commute? Practice sirens in the car - no one can hear you.',
        category: TIP_CATEGORIES.DAILY,
        context: ['anytime']
    },
    {
        id: 'tip-27',
        text: '🎧 Sing along to music with headphones on. Great pitch training!',
        category: TIP_CATEGORIES.DAILY,
        context: ['anytime']
    },

    // RECOVERY
    {
        id: 'tip-28',
        text: '😌 After heavy voice use: Complete vocal rest for 10-15 minutes.',
        category: TIP_CATEGORIES.RECOVERY,
        context: ['session_end', 'tired']
    },
    {
        id: 'tip-29',
        text: '🧊 Feeling vocal strain? Stop immediately. Pain = damage warning.',
        category: TIP_CATEGORIES.RECOVERY,
        context: ['session_mid', 'anytime']
    },
    {
        id: 'tip-30',
        text: '🌙 Your voice repairs during sleep. Get those 7-8 hours!',
        category: TIP_CATEGORIES.RECOVERY,
        context: ['evening', 'session_end']
    },

    // NEUROPLASTICITY
    {
        id: 'tip-31',
        text: '🧠 Your brain is literally rewiring with each practice. Keep going!',
        category: TIP_CATEGORIES.MINDSET,
        context: ['frustrated', 'anytime']
    },
    {
        id: 'tip-32',
        text: '🔁 Repetition builds neural pathways. Today\'s effort = tomorrow\'s autopilot.',
        category: TIP_CATEGORIES.MINDSET,
        context: ['practice', 'discouraged']
    }
];

/**
 * Get a random tip
 */
export const getRandomTip = () => {
    return MICRO_TIPS[Math.floor(Math.random() * MICRO_TIPS.length)];
};

/**
 * Get tips for a specific context
 */
export const getTipsForContext = (context) => {
    return MICRO_TIPS.filter(tip => tip.context.includes(context));
};

/**
 * Get tips by category
 */
export const getTipsByCategory = (category) => {
    return MICRO_TIPS.filter(tip => tip.category === category);
};

/**
 * Get contextual tip based on session state
 */
export const getContextualTip = (sessionState) => {
    const { isStart, isMid, isEnd, mood, timeOfDay } = sessionState;

    let contexts = ['anytime'];

    if (isStart) contexts.push('session_start');
    if (isMid) contexts.push('session_mid');
    if (isEnd) contexts.push('session_end');

    if (mood === 'low' || mood === 'struggling') {
        contexts.push('low_mood', 'discouraged');
    }
    if (mood === 'frustrated') {
        contexts.push('frustrated');
    }

    if (timeOfDay === 'morning') contexts.push('morning');
    if (timeOfDay === 'evening') contexts.push('evening');

    const relevantTips = MICRO_TIPS.filter(tip =>
        tip.context.some(c => contexts.includes(c))
    );

    return relevantTips[Math.floor(Math.random() * relevantTips.length)] || getRandomTip();
};

/**
 * Get the tip of the day (consistent for 24 hours)
 */
export const getTipOfTheDay = () => {
    const today = new Date().toDateString();
    const storedTip = localStorage.getItem('gem_tip_of_day');

    if (storedTip) {
        const { date, tipId } = JSON.parse(storedTip);
        if (date === today) {
            return MICRO_TIPS.find(t => t.id === tipId) || getRandomTip();
        }
    }

    // New day, new tip
    const newTip = getRandomTip();
    localStorage.setItem('gem_tip_of_day', JSON.stringify({
        date: today,
        tipId: newTip.id
    }));

    return newTip;
};

export default {
    MICRO_TIPS,
    TIP_CATEGORIES,
    getRandomTip,
    getTipsForContext,
    getTipsByCategory,
    getContextualTip,
    getTipOfTheDay
};
