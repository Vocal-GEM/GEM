
const STORAGE_KEY = 'gem_coach_memory';

class CoachMemory {
    constructor() {
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : { sessions: [], milestones: [] };
        } catch (e) {
            console.error("Failed to load coach memory", e);
            return { sessions: [], milestones: [] };
        }
    }

    saveHistory() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
        } catch (e) {
            console.error("Failed to save coach memory", e);
        }
    }

    /**
     * Saves a completed session.
     * @param {Object} session - { duration: number, exercises: string[], avgPitch: number, stability: number }
     */
    saveSession(session) {
        const entry = {
            timestamp: Date.now(),
            ...session
        };
        this.history.sessions.push(entry);
        this.saveHistory();
        return this.checkMilestones();
    }

    /**
     * Checks for and returns any new milestones achieved.
     */
    checkMilestones() {
        const newMilestones = [];
        const sessions = this.history.sessions;
        const count = sessions.length;

        // Count Milestone
        if (count === 1) newMilestones.push("First Session Complete!");
        if (count === 5) newMilestones.push("5 Sessions Strong!");
        if (count === 10) newMilestones.push("Double Digits: 10 Sessions!");
        if (count === 50) newMilestones.push("Half Century: 50 Sessions!");

        // Streak Milestone (Simple daily check)
        if (count > 1) {
            const last = new Date(sessions[count - 1].timestamp);
            const prev = new Date(sessions[count - 2].timestamp);
            const diffDays = Math.floor((last - prev) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                // This is a simplified streak check. A real one would need more robust date handling.
                // For now, we just check if sessions are close together.
            }
        }

        // Duration Milestone
        const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        if (totalMinutes > 60 && !this.hasMilestone("1_hour")) {
            newMilestones.push("1 Hour of Practice Total!");
            this.addMilestone("1_hour");
        }

        return newMilestones;
    }

    hasMilestone(id) {
        return this.history.milestones.includes(id);
    }

    addMilestone(id) {
        this.history.milestones.push(id);
        this.saveHistory();
    }

    /**
     * Analyzes recent history to suggest a focus area.
     */
    getSuggestion() {
        const sessions = this.history.sessions;
        if (sessions.length === 0) return { focus: 'warmup', reason: "Let's start with the basics." };

        const lastSession = sessions[sessions.length - 1];

        // Check for stability issues (mock logic for now, assuming stability is 0-100)
        if (lastSession.stability && lastSession.stability < 50) {
            return { focus: 'stability', reason: "I noticed your stability was a bit low last time. Let's work on holding steady notes." };
        }

        // Check for variety
        const recentExercises = sessions.slice(-3).flatMap(s => s.exercises || []);
        if (!recentExercises.includes('resonance')) {
            return { focus: 'resonance', reason: "We haven't done resonance work in a while." };
        }

        return { focus: 'any', reason: "You're doing great. Let's mix it up today." };
    }

    getLastSessionSummary() {
        const sessions = this.history.sessions;
        if (sessions.length === 0) return null;

        const last = sessions[sessions.length - 1];
        const daysAgo = Math.floor((Date.now() - last.timestamp) / (1000 * 60 * 60 * 24));

        let timeText = "earlier today";
        if (daysAgo === 1) timeText = "yesterday";
        if (daysAgo > 1) timeText = `${daysAgo} days ago`;

        return `Welcome back! You last practiced ${timeText} for ${last.duration} minutes.`;
    }
}

export const coachMemory = new CoachMemory();
