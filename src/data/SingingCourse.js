/**
 * SingingCourse.js
 * 
 * A 4-week singing voice curriculum designed to help users develop
 * their singing voice in alignment with gender-affirming voice goals.
 */

export const SINGING_COURSE = [
    {
        id: 'singing-week-1',
        title: 'Week 1: Pitch Matching & Sustained Notes',
        description: 'Build the foundation of singing with accurate pitch and breath control.',
        lessons: [
            {
                id: 'sing-1-1',
                title: 'Finding Your Singing Range',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '10 min',
                description: 'Discover your comfortable singing range from lowest to highest note.',
                content: `
# Finding Your Singing Range

Before we start singing, let's discover where your voice naturally sits.

**Exercise**:
1. Start on a comfortable note and sing "Ah"
2. Slowly glide DOWN as low as you can comfortably go
3. Return to your starting note
4. Slowly glide UP as high as you can comfortably go

**Tips**:
- Don't strain! Stop before it hurts
- Note your lowest comfortable note and your highest
- Your "sweet spot" is usually in the middle third of your range
                `
            },
            {
                id: 'sing-1-2',
                title: 'Pitch Matching Basics',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '15 min',
                description: 'Learn to match target pitches accurately.',
                content: `
# Pitch Matching

Accurate pitch is the foundation of singing. We'll practice matching specific notes.

**Exercise**:
1. Listen to the target tone
2. In your head, imagine singing that note
3. Now sing "Ah" on that note
4. Watch the visualizer - are you above or below?

**If you're flat (below)**: 
Think of lifting the pitch, like going up stairs

**If you're sharp (above)**:
Relax and let the pitch settle down

**Key**: Listen before you sing. Hear the note in your head first.
                `
            },
            {
                id: 'sing-1-3',
                title: 'Sustained Note Practice',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '10 min',
                description: 'Hold a single note steady for extended periods.',
                content: `
# Holding Steady

A beautiful singing voice can sustain notes without wobbling or running out of air.

**Exercise**:
1. Take a deep breath (expand your belly, not just your chest)
2. Pick a comfortable note
3. Sing "Ooo" and try to hold it for 10 seconds
4. Watch the visualizer - keep the line as straight as possible

**Tips**:
- Start with shorter holds (5 seconds) and work up
- If your voice wobbles, try less volume
- Breath support comes from your core, not your throat
                `
            },
            {
                id: 'sing-1-4',
                title: 'Sirens for Singing',
                type: 'exercise',
                duration: '5 min',
                description: 'Connect your full range with smooth glides.',
                content: `
# Singing Sirens

Sirens help you explore your range and smooth out register transitions.

**Exercise**:
1. Start at the bottom of your range
2. Slide up to the top on "Wee" or "Ooo"
3. Slide back down
4. Try to make the transition smooth - no "gear shifts"

**For gender-affirming goals**:
- Feminization: Focus on the upper part of your siren, keep it light
- Masculinization: Focus on the lower part, keep it full
                `
            }
        ]
    },
    {
        id: 'singing-week-2',
        title: 'Week 2: Scales & Breath Support',
        description: 'Develop control with scales and proper breathing for singing.',
        lessons: [
            {
                id: 'sing-2-1',
                title: '5-Note Scale (Do-Re-Mi-Fa-So)',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '15 min',
                description: 'Master the basic 5-note scale ascending and descending.',
                content: `
# The 5-Note Scale

Scales are the building blocks of all melodies. Let's start simple.

**Exercise**:
1. Start on a comfortable note (your "Do")
2. Sing: Do - Re - Mi - Fa - So
3. Then descend: So - Fa - Mi - Re - Do
4. Move your starting note up a half-step and repeat

**Tips**:
- Keep each note clear and distinct
- Don't rush - give each note equal time
- Breathe at the bottom before ascending again
                `
            },
            {
                id: 'sing-2-2',
                title: 'Breath Support for Singing',
                type: 'interactive',
                toolId: 'breath-pacer',
                duration: '10 min',
                description: 'Learn diaphragmatic breathing for sustained singing.',
                content: `
# The Singer's Breath

Proper breath support is what separates struggling singers from effortless ones.

**The Setup**:
1. Stand or sit with good posture
2. Place one hand on your belly, one on your chest
3. Breathe in - your BELLY should move out, chest stays still
4. Breathe out slowly on "Sss" - control the release

**For Singing**:
- Take a low, expansive breath before each phrase
- Don't "lock" your breath - let it flow
- Think of your core muscles supporting the sound
                `
            },
            {
                id: 'sing-2-3',
                title: 'Octave Jumps',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '10 min',
                description: 'Practice jumping between octaves accurately.',
                content: `
# Octave Jumps

An octave is the same note, just higher or lower. Jumping accurately is a key skill.

**Exercise**:
1. Sing a low "Do"
2. Jump up to the higher "Do" (one octave up)
3. Jump back down
4. Repeat on "Ah", "Ooo", and "Ee"

**Tips**:
- Think of the high note BEFORE you jump
- Keep your body relaxed
- The jump should feel like a slight "lift" not a strain
                `
            },
            {
                id: 'sing-2-4',
                title: 'Phrase Breathing',
                type: 'exercise',
                duration: '10 min',
                description: 'Practice breathing at musical phrase breaks.',
                content: `
# Breathing in Context

Real singing requires breathing at the right moments - between phrases.

**Exercise**:
Practice singing this phrase in ONE breath:
"Happy birthday to you, happy birthday to you"

**Tips**:
- Plan your breath BEFORE the phrase
- Don't wait until you're out of air
- If you run out, the phrase was too long for your current capacity
- Build lung capacity gradually with regular practice
                `
            }
        ]
    },
    {
        id: 'singing-week-3',
        title: 'Week 3: Dynamics & Expression',
        description: 'Add emotion and variety to your singing voice.',
        lessons: [
            {
                id: 'sing-3-1',
                title: 'Soft to Loud (Crescendo)',
                type: 'interactive',
                toolId: 'weight-meter',
                duration: '10 min',
                description: 'Practice gradually increasing volume while maintaining pitch.',
                content: `
# The Crescendo

A crescendo is gradually getting louder. It adds drama and emotion.

**Exercise**:
1. Start on a comfortable sustained note, very soft
2. Gradually increase volume over 10 seconds
3. Keep the pitch steady (watch the visualizer!)
4. Don't let the pitch rise as you get louder

**Common Mistake**:
Going sharp (higher) as you get louder. Keep your core engaged and think "down" as you crescendo.
                `
            },
            {
                id: 'sing-3-2',
                title: 'Loud to Soft (Decrescendo)',
                type: 'interactive',
                toolId: 'weight-meter',
                duration: '10 min',
                description: 'Practice gradually decreasing volume while maintaining pitch.',
                content: `
# The Decrescendo

A decrescendo is gradually getting softer. It creates intimacy and tenderness.

**Exercise**:
1. Start on a comfortable sustained note, moderately loud
2. Gradually decrease volume over 10 seconds
3. Keep the pitch steady (it tends to drop)
4. End in a gentle fade, not an abrupt stop

**For Expressiveness**:
- Songs often fade out on emotional moments
- A controlled decrescendo shows mastery
                `
            },
            {
                id: 'sing-3-3',
                title: 'Vibrato Introduction',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '15 min',
                description: 'Understand and begin developing natural vibrato.',
                content: `
# Understanding Vibrato

Vibrato is the natural oscillation in pitch that makes sustained notes warm and alive.

**Exercise (The Pulse Method)**:
1. Hold a steady note on "Ah"
2. Gently pulse your abdomen (like a gentle laugh)
3. Let the pitch waver slightly up and down
4. Gradually reduce the voluntary pulsing and let it become natural

**Note**:
- Natural vibrato develops over time
- Don't force it - a forced vibrato sounds shaky
- Some styles prefer straight tone (no vibrato) and that's valid too
                `
            },
            {
                id: 'sing-3-4',
                title: 'Emotional Coloring',
                type: 'exercise',
                duration: '10 min',
                description: 'Practice singing the same phrase with different emotions.',
                content: `
# Emotion in Your Voice

The same words can mean different things depending on HOW you sing them.

**Exercise**:
Sing "Hello, how are you?" with these emotions:
1. **Happy/Excited**: Bright resonance, upward inflections
2. **Sad/Tender**: Lower resonance, softer dynamics
3. **Playful/Teasing**: Varied pitch, stretched words
4. **Professional/Neutral**: Controlled, moderate

**Tips**:
- Think of a memory that evokes each emotion
- Let your BODY feel the emotion first
- The voice follows the intention
                `
            }
        ]
    },
    {
        id: 'singing-week-4',
        title: 'Week 4: Song Application',
        description: 'Apply your skills to real songs and build repertoire.',
        lessons: [
            {
                id: 'sing-4-1',
                title: 'Choosing Your First Song',
                type: 'theory',
                duration: '5 min',
                description: 'How to pick songs that suit your voice and goals.',
                content: `
# Picking the Right Song

Not all songs are right for where you are now. Let's choose wisely.

**Good Starter Song Criteria**:
- Limited range (stays within one octave)
- Moderate tempo (not too fast)
- Lyrics you connect with emotionally
- A song you LOVE (motivation matters!)

**For Gender-Affirming Goals**:
- **Feminization**: Songs originally by alto or mezzo-soprano artists
- **Masculinization**: Songs originally by baritone artists
- Adjust as needed - there are no rules, only guidelines
                `
            },
            {
                id: 'sing-4-2',
                title: 'Breaking Down a Song',
                type: 'exercise',
                duration: '15 min',
                description: 'Learn to analyze and practice songs in sections.',
                content: `
# Song Breakdown Method

Don't try to learn a whole song at once. Break it down.

**Method**:
1. **Listen**: Hear the song 3-5 times, just listening
2. **Speak the lyrics**: Get the rhythm without pitch
3. **Hum the melody**: Get the pitch without words
4. **Verse by verse**: Combine small sections at a time
5. **Connect sections**: Link verses together

**Practice Tips**:
- Work on the hardest part first (usually the chorus)
- Use recordings to check your pitch
- Record yourself and listen back
                `
            },
            {
                id: 'sing-4-3',
                title: 'Singing with Backing Track',
                type: 'interactive',
                toolId: 'pitch-visualizer',
                duration: '15 min',
                description: 'Practice singing along with instrumental tracks.',
                content: `
# Singing with Music

Singing alone is one thing. Singing with accompaniment is another skill entirely.

**Exercise**:
1. Find a karaoke or instrumental version of your chosen song
2. Sing along, focusing on:
   - Staying on pitch
   - Entering at the right time
   - Matching the phrasing

**Tips**:
- Start with slower songs
- Use headphones so you can hear both the track AND your voice
- Don't let the music "carry" you - you need to actively sing on pitch
                `
            },
            {
                id: 'sing-4-4',
                title: 'Performance Ready',
                type: 'exercise',
                duration: '10 min',
                description: 'Tips for presenting your singing voice confidently.',
                content: `
# Singing for Others

Whether it's karaoke, a recording, or just for friends - presentation matters.

**Performance Tips**:
1. **Warm up**: Never sing cold, do your scales and sirens first
2. **Breathe**: Deep breaths calm nerves and support your voice
3. **Commit**: Sing with conviction, even if you make mistakes
4. **Connect**: Think about the meaning of the words
5. **Recover gracefully**: If you miss a note, keep going

**Remember**:
Your voice is unique. That's not a flaw - it's your superpower.
                `
            }
        ]
    }
];

/**
 * Get singing course data
 */
export const getSingingCourse = () => SINGING_COURSE;

/**
 * Get a specific week by ID
 */
export const getSingingWeek = (weekId) => {
    return SINGING_COURSE.find(week => week.id === weekId);
};

export default SINGING_COURSE;
