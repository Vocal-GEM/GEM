import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { practiceCardsService } from './practiceCardsService';

// Reset IndexedDB between tests
const resetDatabase = async () => {
    // Close the database connection first
    if (practiceCardsService.db) {
        practiceCardsService.db.close();
        practiceCardsService.db = null;
    }

    // Delete the database
    return new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('VocalGEM_PracticeCards');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
    });
};

describe('practiceCardsService', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    afterEach(async () => {
        await resetDatabase();
    });

    // ============================================
    // Custom Card Sets CRUD
    // ============================================
    describe('Custom Card Sets', () => {
        it('should create a custom card set and return an ID', async () => {
            const cardSet = {
                name: 'Test Set',
                description: 'A test card set',
                difficulty: 'beginner',
                cards: [
                    { text: 'Hello world', focus: 'pitch' },
                    { text: 'Testing speech', focus: 'resonance' }
                ]
            };

            const id = await practiceCardsService.saveCustomCardSet(cardSet);

            expect(id).toBeDefined();
            expect(typeof id).toBe('string');
            expect(id.startsWith('custom-')).toBe(true);
        });

        it('should retrieve all custom card sets', async () => {
            // Create two sets
            await practiceCardsService.saveCustomCardSet({
                name: 'Set One',
                description: 'First set',
                difficulty: 'beginner',
                cards: [{ text: 'Card 1', focus: 'general' }]
            });

            await practiceCardsService.saveCustomCardSet({
                name: 'Set Two',
                description: 'Second set',
                difficulty: 'intermediate',
                cards: [{ text: 'Card 2', focus: 'pitch' }]
            });

            const sets = await practiceCardsService.getCustomCardSets();

            expect(sets).toHaveLength(2);
            expect(sets[0].name).toBe('Set One');
            expect(sets[1].name).toBe('Set Two');
        });

        it('should update a custom card set', async () => {
            const id = await practiceCardsService.saveCustomCardSet({
                name: 'Original Name',
                description: 'Original description',
                difficulty: 'beginner',
                cards: [{ text: 'Original card', focus: 'general' }]
            });

            await practiceCardsService.updateCustomCardSet(id, {
                name: 'Updated Name',
                description: 'Updated description'
            });

            const sets = await practiceCardsService.getCustomCardSets();
            const updatedSet = sets.find(s => s.id === id);

            expect(updatedSet.name).toBe('Updated Name');
            expect(updatedSet.description).toBe('Updated description');
            expect(updatedSet.difficulty).toBe('beginner'); // unchanged
        });

        it('should delete a custom card set', async () => {
            const id = await practiceCardsService.saveCustomCardSet({
                name: 'To Be Deleted',
                description: 'This will be deleted',
                difficulty: 'advanced',
                cards: [{ text: 'Goodbye', focus: 'general' }]
            });

            // Verify it exists
            let sets = await practiceCardsService.getCustomCardSets();
            expect(sets).toHaveLength(1);

            // Delete it
            await practiceCardsService.deleteCustomCardSet(id);

            // Verify it's gone
            sets = await practiceCardsService.getCustomCardSets();
            expect(sets).toHaveLength(0);
        });

        it('should generate unique IDs for each card in a set', async () => {
            const id = await practiceCardsService.saveCustomCardSet({
                name: 'Multi-Card Set',
                description: 'Has multiple cards',
                difficulty: 'intermediate',
                cards: [
                    { text: 'Card A', focus: 'pitch' },
                    { text: 'Card B', focus: 'resonance' },
                    { text: 'Card C', focus: 'intonation' }
                ]
            });

            const sets = await practiceCardsService.getCustomCardSets();
            const set = sets.find(s => s.id === id);

            const cardIds = set.cards.map(c => c.id);
            const uniqueIds = new Set(cardIds);

            expect(cardIds).toHaveLength(3);
            expect(uniqueIds.size).toBe(3); // All unique
        });
    });

    // ============================================
    // Card Activity Logging
    // ============================================
    describe('Card Activity', () => {
        it('should log card activity', async () => {
            const activity = {
                cardId: 'test-card-1',
                setId: 'test-set-1',
                durationMs: 5000,
                recordingId: null
            };

            const id = await practiceCardsService.logCardActivity(activity);

            expect(id).toBeDefined();
        });

        it('should retrieve activity for a specific card', async () => {
            const cardId = 'card-activity-test';

            // Log multiple activities for the same card
            await practiceCardsService.logCardActivity({
                cardId,
                setId: 'set-1',
                durationMs: 3000,
                recordingId: null
            });

            await practiceCardsService.logCardActivity({
                cardId,
                setId: 'set-1',
                durationMs: 5000,
                recordingId: 'recording-123'
            });

            const activity = await practiceCardsService.getCardActivity(cardId);

            expect(activity.totalPractices).toBe(2);
            expect(activity.savedRecordings).toBe(1);
            expect(activity.recentActivity).toHaveLength(2);
        });

        it('should return recordings that used a specific card', async () => {
            const cardId = 'card-with-recordings';

            await practiceCardsService.logCardActivity({
                cardId,
                setId: 'set-1',
                durationMs: 4000,
                recordingId: 'rec-1'
            });

            await practiceCardsService.logCardActivity({
                cardId,
                setId: 'set-1',
                durationMs: 6000,
                recordingId: 'rec-2'
            });

            await practiceCardsService.logCardActivity({
                cardId,
                setId: 'set-1',
                durationMs: 2000,
                recordingId: null // No recording
            });

            const recordings = await practiceCardsService.getRecordingsForCard(cardId);

            expect(recordings).toHaveLength(2);
            expect(recordings).toContain('rec-1');
            expect(recordings).toContain('rec-2');
        });

        it('should track activities for different cards separately', async () => {
            await practiceCardsService.logCardActivity({
                cardId: 'card-a',
                setId: 'set-1',
                durationMs: 1000
            });

            await practiceCardsService.logCardActivity({
                cardId: 'card-b',
                setId: 'set-1',
                durationMs: 2000
            });

            await practiceCardsService.logCardActivity({
                cardId: 'card-a',
                setId: 'set-1',
                durationMs: 3000
            });

            const activityA = await practiceCardsService.getCardActivity('card-a');
            const activityB = await practiceCardsService.getCardActivity('card-b');

            expect(activityA.totalPractices).toBe(2);
            expect(activityB.totalPractices).toBe(1);
        });
    });

    // ============================================
    // Practice Summary
    // ============================================
    describe('Practice Summary', () => {
        it('should return empty summary when no activity exists', async () => {
            const summary = await practiceCardsService.getPracticeSummary();

            expect(summary.totalPractices).toBe(0);
            expect(summary.uniqueCardsUsed).toBe(0);
            expect(summary.totalDurationMs).toBe(0);
        });

        it('should calculate correct summary statistics', async () => {
            // Log activities for multiple cards
            await practiceCardsService.logCardActivity({
                cardId: 'summary-card-1',
                setId: 'set-1',
                durationMs: 5000
            });

            await practiceCardsService.logCardActivity({
                cardId: 'summary-card-2',
                setId: 'set-1',
                durationMs: 3000
            });

            await practiceCardsService.logCardActivity({
                cardId: 'summary-card-1',
                setId: 'set-1',
                durationMs: 2000
            });

            const summary = await practiceCardsService.getPracticeSummary();

            expect(summary.totalPractices).toBe(3);
            expect(summary.uniqueCardsUsed).toBe(2);
            expect(summary.totalDurationMs).toBe(10000);
        });

        it('should count saved recordings correctly in summary', async () => {
            await practiceCardsService.logCardActivity({
                cardId: 'rec-summary-1',
                setId: 'set-1',
                durationMs: 4000,
                recordingId: 'rec-a'
            });

            await practiceCardsService.logCardActivity({
                cardId: 'rec-summary-2',
                setId: 'set-1',
                durationMs: 3000,
                recordingId: null
            });

            const summary = await practiceCardsService.getPracticeSummary();

            expect(summary.totalPractices).toBe(2);
            expect(summary.savedRecordings).toBe(1);
        });
    });

    // ============================================
    // Edge Cases
    // ============================================
    describe('Edge Cases', () => {
        it('should handle empty card set gracefully', async () => {
            const id = await practiceCardsService.saveCustomCardSet({
                name: 'Empty Set',
                description: 'No cards',
                difficulty: 'beginner',
                cards: []
            });

            const sets = await practiceCardsService.getCustomCardSets();
            const emptySet = sets.find(s => s.id === id);

            expect(emptySet.cards).toHaveLength(0);
        });

        it('should return empty activity for non-existent card', async () => {
            const activity = await practiceCardsService.getCardActivity('non-existent-card');

            expect(activity.totalPractices).toBe(0);
            expect(activity.savedRecordings).toBe(0);
            expect(activity.recentActivity).toHaveLength(0);
        });

        it('should return empty recordings array for card with no recordings', async () => {
            await practiceCardsService.logCardActivity({
                cardId: 'no-recording-card',
                setId: 'set-1',
                durationMs: 5000,
                recordingId: null
            });

            const recordings = await practiceCardsService.getRecordingsForCard('no-recording-card');

            expect(recordings).toHaveLength(0);
        });
    });
});
