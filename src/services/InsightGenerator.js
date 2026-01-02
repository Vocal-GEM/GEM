/**
 * InsightGenerator.js
 * 
 * generates daily bite-sized insights, "did you know?" facts, and
 * motivational content based on user data.
 */

export class InsightGenerator {

    /**
     * generate a daily insight card
     * @param {string} userId 
     * @param {Object} userData - full user profile and history
     * @returns {Object} insight
     */
    generateDailyInsight(userId, userData) {
        // Use simple randomization or round-robin for now, combined with checks
        const types = ['pattern', 'education', 'milestone', 'motivation'];
        const type = types[Math.floor(Math.random() * types.length)]; // simple random for now

        switch (type) {
            case 'pattern':
                return this.findInterestingPatterns(userData);
            case 'education':
                return this.createEducationalInsight(userData.profile?.experienceLevel);
            case 'milestone':
                return this.checkMilestones(userData);
            case 'motivation':
            default:
                return this.generateMotivationalInsight(userData);
        }
    }

    findInterestingPatterns(userData) {
        // Mock pattern finding logic
        // Real logic would correlate time of day vs performance, etc.
        return {
            type: 'pattern',
            title: 'Morning Person?',
            content: 'Your pitch stability is 15% higher in sessions before 10 AM.',
            icon: '🌅'
        };
    }

    createEducationalInsight(level = 'beginner') {
        const facts = [
            "Hydration is key! Your vocal folds need systemic hydration to vibrate efficiently.",
            "Vocal warm-ups shouldn't just be scales—try sirens to stretch the range gently.",
            "Tension in the jaw is a common enemy of resonance. Try massaging your masseter muscles.",
            "Whispering can actually strain your voice more than speaking normally!"
        ];

        return {
            type: 'education',
            title: 'Did You Know?',
            content: facts[Math.floor(Math.random() * facts.length)],
            icon: '🧠'
        };
    }

    checkMilestones(userData) {
        // Mock milestone check
        return {
            type: 'milestone',
            title: 'Almost There!',
            content: 'You are just 2 sessions away from your 50th practice session!',
            icon: '🏁'
        };
    }

    generateMotivationalInsight(userData) {
        const quotes = [
            "Progress is not linear. Be patient with yourself.",
            "Every minute of practice counts towards your new voice.",
            "Your voice is an instrument that you are building while playing.",
            "Consistency beats intensity every time."
        ];

        return {
            type: 'motivation',
            title: 'Thought for the Day',
            content: quotes[Math.floor(Math.random() * quotes.length)],
            icon: '✨'
        };
    }
}
