
export const SINGING_COURSE = {
    id: 'singing-1',
    title: 'Gender Affirming Singing Voice',
    description: 'Find a singing voice that is in alignment with who you are through systematic vocal training.',
    weeks: [
        {
            id: 'week-1',
            title: 'Week 1: Foundations & Breath',
            description: 'Establishing vocal health, anatomy awareness, and breath support.',
            days: [
                {
                    id: 'w1d1',
                    title: 'Day 1: Introduction & Posture',
                    tasks: [
                        { type: 'info', title: 'Welcome: Mission & Expectations', content: 'It is our mission to help you find a singing voice that is in alignment with who you are. Practice 3-5 days a week.' },
                        { type: 'drill', id: 'singing_squat', title: 'Breath Tip 1: The Singing Squat', description: 'Squat slowly as you sing to engage support.' },
                        { type: 'warmup', id: 'physical_stretch', title: 'Physical Stretching' }
                    ]
                },
                {
                    id: 'w1d2',
                    title: 'Day 2: Breath Management',
                    tasks: [
                        { type: 'drill', id: 'farinelli_breath', title: 'Breath Tip 3: Farinelli Breath', description: 'Inhale 4, Suspend 4, Exhale 4.' },
                        { type: 'drill', id: 'pulsing_support', title: 'Pulsing vs Sustained Support', description: 'Practice "Toilet paper blows" and "Bug blows".' }
                    ]
                },
                {
                    id: 'w1d3',
                    title: 'Day 3: Release & Openness',
                    tasks: [
                        { type: 'drill', id: 'yawn_breath', title: 'Breath Tip 2: The Yawn Breath', description: 'Inhale a yawn to lift the soft palate and lower the larynx.' },
                        { type: 'warmup', id: 'siren_descending', title: 'Descending Siren', description: 'Release on a gentle descending siren.' }
                    ]
                },
                {
                    id: 'w1d4',
                    title: 'Day 4: Vocal Health & Rest',
                    tasks: [
                        { type: 'info', title: 'Hydration & Silence', content: 'Review the Vocal Health section. Communicate concerns proactively.' }
                    ]
                },
                {
                    id: 'w1d5',
                    title: 'Day 5: Singing on the Breath',
                    tasks: [
                        { type: 'drill', id: 'bubble_blows', title: 'Blow Bubbles into Water', description: 'Sing 1-2-3-4-3-2-1 into water.' },
                        { type: 'drill', id: 'vv_sustain', title: 'Vv Sound Ascending', description: 'Ascending and descending on "Vv" to reinforce support.' }
                    ]
                },
                {
                    id: 'w1d6',
                    title: 'Day 6: Head Voice Exploration',
                    tasks: [
                        { type: 'drill', id: 'wee_triad', title: 'Wee 5-3-1', description: 'Use a closed "w" sound (like "oo") to travel between notes.' }
                    ]
                },
                {
                    id: 'w1d7',
                    title: 'Day 7: Weekly Review',
                    tasks: [
                        { type: 'record', title: 'Record a simple phrase', toolId: 'assessment', params: { tab: 'quickCheck' } }
                    ]
                }
            ]
        },
        {
            id: 'week-2',
            title: 'Week 2: Resonance & Shape',
            description: 'Manipulating the vocal tract shape for gender-affirming tone.',
            days: [
                {
                    id: 'w2d1',
                    title: 'Day 8: Jaw & Lip Relaxation',
                    tasks: [
                        { type: 'drill', id: 'masseter_massage', title: 'Jaw Massage', description: 'Gently massage the masseter muscle until the jaw feels "numb".' },
                        { type: 'drill', id: 'lip_trills', title: 'Lip Trills', description: 'Relax the lips. Modify with "raspberry" sounds if needed.' }
                    ]
                },
                {
                    id: 'w2d2',
                    title: 'Day 9: Tongue & Tract',
                    tasks: [
                        { type: 'drill', id: 'tongue_relax', title: 'Tongue on Lip', description: 'Relax tongue onto bottom lip. Inhale and make an "ah" vowel.' },
                        { type: 'drill', id: 'puffy_cheeks', title: 'Puffy Cheeks', description: 'Inflate cheeks and blow gently through a small /w/ opening.' }
                    ]
                },
                {
                    id: 'w2d3',
                    title: 'Day 10: Resonance Exploration',
                    tasks: [
                        { type: 'drill', id: 'boat_motor', title: 'Boat Motor Sound', description: 'Sing a scale on "buh" with puffy cheeks to free the voice.' }
                    ]
                },
                {
                    id: 'w2d4',
                    title: 'Day 11: Rest',
                    tasks: []
                },
                {
                    id: 'w2d5',
                    title: 'Day 12: Tone Color',
                    tasks: [
                        { type: 'drill', id: 'bright_dark', title: 'Bright vs Dark', description: 'Experiment with "The Smile" (bright) and "The Yawn" (dark).' }
                    ]
                },
                {
                    id: 'w2d6',
                    title: 'Day 13: Integrated Scales',
                    tasks: [
                        { type: 'drill', id: 'scale_practice', title: '5-Note Agility', description: 'Sing a 5-note pattern using the "buh" or "Wee" sounds.' }
                    ]
                },
                {
                    id: 'w2d7',
                    title: 'Day 14: Review & Record',
                    tasks: [
                        { type: 'record', title: 'Record a scale', toolId: 'assessment', params: { tab: 'baseline' } }
                    ]
                }
            ]
        },
        {
            id: 'week-3',
            title: 'Week 3: Registers & Range',
            description: 'Navigating chest, head, and mixed voice while maintaining gender alignment.',
            days: [
                {
                    id: 'w3d1',
                    title: 'Day 15: Register Identification',
                    tasks: [
                        { type: 'info', title: 'Understanding Registers', content: 'Describe different registers of the voice.' }
                    ]
                },
                {
                    id: 'w3d2',
                    title: 'Day 16: Mixing',
                    tasks: [
                        { type: 'drill', id: 'mix_slide', title: 'Sliding through the Break', description: 'Practice smooth transitions between registers.' }
                    ]
                }
            ]
        },
        {
            id: 'week-4',
            title: 'Week 4: Application & Musicality',
            description: 'Phrasing, agility, and performance techniques.',
            days: [
                {
                    id: 'w4d1',
                    title: 'Day 22: Phrasing',
                    tasks: [
                        { type: 'drill', id: 'phrase_shape', title: 'Shaping a Phrase', description: 'Produce different shapes of a vocal line.' }
                    ]
                },
                {
                    id: 'w4d2',
                    title: 'Day 23: Vowel Modification',
                    tasks: [
                        { type: 'drill', id: 'vowel_mod', title: 'Modify for High Notes', description: 'Adjust vowels slightly to maintain ease on higher pitches.' }
                    ]
                }
            ]
        }
    ]
};
