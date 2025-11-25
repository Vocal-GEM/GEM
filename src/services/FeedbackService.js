
class FeedbackService {
    constructor() {
        this.goals = {
            feminization: {
                pitch: { high: "Beautifully bright!", low: "A bit deep, try to lighten it." },
                resonance: { high: "Glowing resonance! Very feminine.", low: "Resonance is dropping into the chest." },
                affirmations: ["You sound radiant.", "That was very graceful.", "Lovely lightness."]
            },
            masculinization: {
                pitch: { high: "A bit high, relax into the chest.", low: "Solid depth. Very commanding." },
                resonance: { high: "Too bright, aim for that chest rumble.", low: "Great warmth and power." },
                affirmations: ["You sound strong.", "Very grounded tone.", "Solid presence."]
            },
            androgyny: {
                pitch: { high: "Getting a bit bright.", low: "Getting a bit heavy." },
                resonance: { high: "Too forward.", low: "Too deep." },
                affirmations: ["Perfectly balanced.", "Great mix.", "Very flexible tone."]
            },
            exploration: {
                pitch: { high: "High pitch.", low: "Low pitch." },
                resonance: { high: "Bright resonance.", low: "Dark resonance." },
                affirmations: ["Good control.", "Nice exploration.", "Interesting tone."]
            }
        };
    }

    getFeedback(metric, value, goal = 'exploration', personality = 'gentle') {
        const goalConfig = this.goals[goal] || this.goals.exploration;

        // Safety/Strain Check (Universal)
        if (metric === 'strain') {
            return "I'm hearing some strain. Let's pause and hydrate. Your health comes first.";
        }

        // Pitch Feedback
        if (metric === 'pitch') {
            // This is a simplification. In a real app, we'd compare against specific Hz targets.
            // Here we assume 'value' is a qualitative 'high' or 'low' relative to target.
            if (value === 'high') return goalConfig.pitch.high;
            if (value === 'low') return goalConfig.pitch.low;
        }

        // Resonance Feedback
        if (metric === 'resonance') {
            // Assuming value > 50 is 'high/bright', < 50 is 'low/dark'
            if (value > 60) return goalConfig.resonance.high;
            if (value < 40) return goalConfig.resonance.low;
            return "Balanced resonance.";
        }

        return "";
    }

    getAffirmation(goal = 'exploration') {
        const config = this.goals[goal] || this.goals.exploration;
        const affirmations = config.affirmations;
        return affirmations[Math.floor(Math.random() * affirmations.length)];
    }
}

export const feedbackService = new FeedbackService();
