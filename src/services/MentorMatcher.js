/**
 * MentorMatcher - Service for finding and connecting with mentors
 */

const API_BASE = '/api/community';

export class MentorMatcher {
    /**
     * Find potential mentors based on user profile
     * @param {Object} userProfile - The user's voice profile and goals
     * @returns {Promise<Array>} List of compatible mentors
     */
    async findMentors(userProfile) {
        try {
            // In a real implementation, we'd pass profile data to the backend to get filtered results
            // For now, we'll fetch connections and filter locally or use a mock endpoint
            // Since we don't have a specific search endpoint yet, we'll simulate the search 
            // or assume the backend might eventually support /api/community/mentors/search

            // For MVP, we return a mock list if backend search isn't ready, 
            // but let's try to hit a connection endpoint or returning simulated data

            // Simulating network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return this.getSimulatedMentors(userProfile);
        } catch (error) {
            console.error('Mentor search failed:', error);
            return [];
        }
    }

    /**
     * Send a connection request
     */
    async requestConnection(mentorId, message) {
        try {
            const response = await fetch(`${API_BASE}/connections/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connection_id: mentorId,
                    connection_type: 'mentor',
                    message
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to send request');
            }

            return await response.json();
        } catch (error) {
            console.error('Connection request failed:', error);
            throw error;
        }
    }

    /**
     * Get my connections
     */
    async getConnections() {
        try {
            const response = await fetch(`${API_BASE}/connections`);
            if (!response.ok) throw new Error('Failed to fetch connections');
            return await response.json();
        } catch (error) {
            console.error('Fetch connections failed:', error);
            return { sent: [], received: [], accepted: [] };
        }
    }

    /**
     * Respond to a connection request
     */
    async respondToRequest(connectionId, accept) {
        try {
            const response = await fetch(`${API_BASE}/connections/${connectionId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accept })
            });

            if (!response.ok) throw new Error('Failed to respond');
            return await response.json();
        } catch (error) {
            console.error('Response failed:', error);
            throw error;
        }
    }

    /* --- Simulation Helpers --- */

    getSimulatedMentors(userProfile) {
        const goal = userProfile?.goals?.voiceType || 'feminine';

        // Mock mentors
        const allMentors = [
            {
                id: 101,
                displayName: 'SarahV',
                expertise: 'feminine',
                startingPitch: 130,
                currentPitch: 220,
                yearsExperience: 3,
                bio: 'Trans voice teacher, focused on resonance optimization.',
                responsiveness: 0.9,
                matchScore: 0.95,
                timezone: -5
            },
            {
                id: 102,
                displayName: 'Mike_Voice',
                expertise: 'masculine',
                startingPitch: 200,
                currentPitch: 110,
                yearsExperience: 2,
                bio: 'Can help with lowering pitch comfortably.',
                responsiveness: 0.8,
                matchScore: 0.85,
                timezone: -8
            },
            {
                id: 103,
                displayName: 'Alex_NB',
                expertise: 'androgynous',
                startingPitch: 180,
                currentPitch: 165,
                yearsExperience: 4,
                bio: 'Specializing in non-binary voice goals and flexibility.',
                responsiveness: 0.7,
                matchScore: 0.88,
                timezone: 0
            }
        ];

        // Simple client-side filtering
        return allMentors.filter(m => m.expertise === goal);
    }

    calculateMatchScore(user, mentor) {
        // This logic mimics the backend implementation plan
        // Useful for client-side sorting if needed
        let score = 0;
        if (user.goals?.voiceType === mentor.expertise) score += 0.3;
        // ... other criteria
        return score;
    }
}

export default new MentorMatcher();
