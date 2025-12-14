/**
 * ConversationPracticeService
 * 
 * Manages conversation sessions for voice practice.
 * Handles dialogue flow, user input matching, and session persistence.
 */

import { CONVERSATION_SCENARIOS, getScenarioById } from '../data/conversationScenarios';

/**
 * Match user input against a set of possible responses
 * Uses keyword matching with fuzzy tolerance
 */
const matchUserInput = (input, responses) => {
    const normalizedInput = input.toLowerCase().trim();
    const words = normalizedInput.split(/\s+/);

    let bestMatch = null;
    let bestScore = 0;

    for (const response of responses) {
        let score = 0;
        for (const keyword of response.keywords) {
            const normalizedKeyword = keyword.toLowerCase();

            // Exact word match
            if (words.includes(normalizedKeyword)) {
                score += 2;
            }
            // Partial match (keyword is contained in input)
            else if (normalizedInput.includes(normalizedKeyword)) {
                score += 1;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = response;
        }
    }

    return { match: bestMatch, score: bestScore };
};

/**
 * ConversationSession class
 * Manages a single conversation practice session
 */
class ConversationSession {
    constructor(scenario) {
        this.scenario = scenario;
        this.currentBranch = 'start';
        this.history = [];
        this.startTime = Date.now();
        this.isEnded = false;
        this.turnCount = 0;

        // Add the AI's opening line to history
        this.history.push({
            id: Date.now(),
            speaker: 'ai',
            text: scenario.openingLine,
            timestamp: Date.now()
        });
    }

    /**
     * Process user input and return the AI's response
     */
    processUserInput(userText) {
        if (this.isEnded) {
            return {
                aiResponse: null,
                isConversationEnded: true,
                matchQuality: 'ended'
            };
        }

        this.turnCount++;

        // Add user message to history
        this.history.push({
            id: Date.now(),
            speaker: 'user',
            text: userText,
            timestamp: Date.now()
        });

        // Get current branch
        const branch = this.scenario.branches[this.currentBranch];

        if (!branch) {
            return {
                aiResponse: "I'm sorry, I got a bit confused. Let's start over!",
                isConversationEnded: false,
                matchQuality: 'error'
            };
        }

        // Check if this is an end branch
        if (branch.isEnd) {
            this.isEnded = true;
            const closingLine = branch.closingLine || "Thanks for the conversation!";

            this.history.push({
                id: Date.now() + 1,
                speaker: 'ai',
                text: closingLine,
                timestamp: Date.now()
            });

            return {
                aiResponse: closingLine,
                isConversationEnded: true,
                matchQuality: 'end'
            };
        }

        // Try to match user input
        const { match, score } = matchUserInput(userText, branch.responses);

        let aiResponse;
        let matchQuality;

        if (match && score > 0) {
            // Good match - use matched response
            aiResponse = match.reply;
            this.currentBranch = match.next;
            matchQuality = score >= 2 ? 'good' : 'partial';
        } else if (branch.fallback) {
            // Use fallback response
            aiResponse = branch.fallback.reply;
            if (branch.fallback.next) {
                this.currentBranch = branch.fallback.next;
            }
            matchQuality = 'fallback';
        } else {
            // No fallback, use generic response
            aiResponse = "I see! Tell me more about that.";
            matchQuality = 'generic';
        }

        // Add AI response to history
        this.history.push({
            id: Date.now() + 1,
            speaker: 'ai',
            text: aiResponse,
            timestamp: Date.now()
        });

        // Check if the new branch is an end
        const nextBranch = this.scenario.branches[this.currentBranch];
        if (nextBranch?.isEnd) {
            this.isEnded = true;
            const closingLine = nextBranch.closingLine || "Thanks for the conversation!";

            this.history.push({
                id: Date.now() + 2,
                speaker: 'ai',
                text: closingLine,
                timestamp: Date.now()
            });

            return {
                aiResponse: aiResponse + " " + closingLine,
                isConversationEnded: true,
                matchQuality
            };
        }

        return {
            aiResponse,
            isConversationEnded: false,
            matchQuality
        };
    }

    /**
     * Get session summary
     */
    getSummary() {
        const endTime = Date.now();
        const durationMs = endTime - this.startTime;
        const durationMinutes = Math.round(durationMs / 60000);
        const userMessages = this.history.filter(m => m.speaker === 'user');
        const aiMessages = this.history.filter(m => m.speaker === 'ai');

        return {
            scenarioId: this.scenario.id,
            scenarioTitle: this.scenario.title,
            character: this.scenario.character.name,
            durationMinutes: durationMinutes || 1,
            durationMs,
            userMessageCount: userMessages.length,
            aiMessageCount: aiMessages.length,
            totalTurns: this.turnCount,
            practiceGoals: this.scenario.practiceGoals,
            completedAt: endTime,
            history: this.history
        };
    }

    /**
     * Get current conversation history
     */
    getHistory() {
        return this.history;
    }

    /**
     * Check if conversation has ended
     */
    hasEnded() {
        return this.isEnded;
    }

    /**
     * Get the character info
     */
    getCharacter() {
        return this.scenario.character;
    }

    /**
     * Force end the conversation
     */
    end() {
        this.isEnded = true;
        return this.getSummary();
    }
}

/**
 * ConversationPracticeService
 * Main service for managing conversation practice
 */
const ConversationPracticeService = {
    currentSession: null,
    sessionHistory: [],

    /**
     * Get all available scenarios
     */
    getScenarios() {
        return CONVERSATION_SCENARIOS;
    },

    /**
     * Get scenarios grouped by category
     */
    getScenariosByCategory() {
        const grouped = {};
        for (const scenario of CONVERSATION_SCENARIOS) {
            if (!grouped[scenario.category]) {
                grouped[scenario.category] = [];
            }
            grouped[scenario.category].push(scenario);
        }
        return grouped;
    },

    /**
     * Start a new conversation session
     */
    startConversation(scenarioId) {
        const scenario = getScenarioById(scenarioId);
        if (!scenario) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }

        this.currentSession = new ConversationSession(scenario);

        return {
            scenario,
            openingLine: scenario.openingLine,
            character: scenario.character
        };
    },

    /**
     * Process user input in current conversation
     */
    processInput(userText) {
        if (!this.currentSession) {
            throw new Error('No active conversation session');
        }

        return this.currentSession.processUserInput(userText);
    },

    /**
     * Get current conversation history
     */
    getHistory() {
        if (!this.currentSession) {
            return [];
        }
        return this.currentSession.getHistory();
    },

    /**
     * Get current character
     */
    getCharacter() {
        if (!this.currentSession) {
            return null;
        }
        return this.currentSession.getCharacter();
    },

    /**
     * End current conversation and get summary
     */
    endConversation() {
        if (!this.currentSession) {
            return null;
        }

        const summary = this.currentSession.end();
        this.sessionHistory.push(summary);

        // Persist to localStorage
        try {
            const stored = JSON.parse(localStorage.getItem('conversation_practice_history') || '[]');
            stored.push({
                ...summary,
                history: undefined // Don't store full history to save space
            });
            // Keep only last 50 sessions
            while (stored.length > 50) {
                stored.shift();
            }
            localStorage.setItem('conversation_practice_history', JSON.stringify(stored));
        } catch (e) {
            console.error('Failed to persist conversation history:', e);
        }

        this.currentSession = null;
        return summary;
    },

    /**
     * Check if there's an active session
     */
    hasActiveSession() {
        return this.currentSession !== null && !this.currentSession.hasEnded();
    },

    /**
     * Get practice statistics
     */
    getStatistics() {
        try {
            const stored = JSON.parse(localStorage.getItem('conversation_practice_history') || '[]');

            const totalSessions = stored.length;
            const totalMinutes = stored.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
            const totalTurns = stored.reduce((acc, s) => acc + (s.totalTurns || 0), 0);

            // Count by scenario
            const scenarioCounts = {};
            for (const session of stored) {
                scenarioCounts[session.scenarioId] = (scenarioCounts[session.scenarioId] || 0) + 1;
            }

            // Find most practiced
            let mostPracticed = null;
            let mostCount = 0;
            for (const [id, count] of Object.entries(scenarioCounts)) {
                if (count > mostCount) {
                    mostCount = count;
                    mostPracticed = id;
                }
            }

            return {
                totalSessions,
                totalMinutes,
                totalTurns,
                scenarioCounts,
                mostPracticed,
                recentSessions: stored.slice(-5).reverse()
            };
        } catch (e) {
            console.error('Failed to get statistics:', e);
            return {
                totalSessions: 0,
                totalMinutes: 0,
                totalTurns: 0,
                scenarioCounts: {},
                mostPracticed: null,
                recentSessions: []
            };
        }
    },

    /**
     * Get current branch ID for suggested responses
     */
    getCurrentBranch() {
        if (!this.currentSession) {
            return null;
        }
        return this.currentSession.currentBranch;
    },

    /**
     * Get suggested responses for current branch
     */
    getSuggestedResponses() {
        if (!this.currentSession) {
            return null;
        }
        const scenario = this.currentSession.scenario;
        const branch = this.currentSession.currentBranch;

        if (scenario.suggestedResponses && scenario.suggestedResponses[branch]) {
            return scenario.suggestedResponses[branch];
        }
        return null;
    }
};

export default ConversationPracticeService;
export { ConversationSession };

