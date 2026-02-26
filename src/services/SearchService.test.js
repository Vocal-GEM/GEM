import { describe, it, expect, beforeEach } from 'vitest';
import { search, getSearchableItems, refreshSearchIndex, getTypeLabel, groupResultsByType } from './SearchService';

describe('SearchService', () => {
    beforeEach(() => {
        // Refresh index before each test to ensure clean state
        refreshSearchIndex();
    });

    describe('getSearchableItems', () => {
        it('should return all searchable items', () => {
            const items = getSearchableItems();
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('should include navigation items', () => {
            const items = getSearchableItems();
            const navItems = items.filter(item => item.type === 'navigation');
            expect(navItems.length).toBeGreaterThan(0);
            expect(navItems.some(item => item.title === 'Dashboard')).toBe(true);
        });

        it('should include exercises', () => {
            const items = getSearchableItems();
            const exercises = items.filter(item => item.type === 'exercise');
            expect(exercises.length).toBeGreaterThan(0);
        });

        it('should include glossary terms', () => {
            const items = getSearchableItems();
            const glossary = items.filter(item => item.type === 'glossary');
            expect(glossary.length).toBeGreaterThan(0);
        });
    });

    describe('search', () => {
        it('should return empty array for empty query', () => {
            expect(search('')).toEqual([]);
            expect(search('   ')).toEqual([]);
            expect(search(null)).toEqual([]);
        });

        it('should find exercises by title', () => {
            const results = search('lip trill');
            expect(results.some(r => r.title.toLowerCase().includes('lip'))).toBe(true);
        });

        it('should find glossary terms', () => {
            const results = search('breath');
            const glossaryResults = results.filter(r => r.type === 'glossary');
            expect(glossaryResults.length).toBeGreaterThan(0);
        });

        it('should find navigation items', () => {
            const results = search('dashboard');
            expect(results.some(r => r.type === 'navigation' && r.title === 'Dashboard')).toBe(true);
        });

        it('should respect limit option', () => {
            const results = search('voice', { limit: 3 });
            expect(results.length).toBeLessThanOrEqual(3);
        });

        it('should filter by types when specified', () => {
            const results = search('practice', { types: ['navigation'] });
            expect(results.every(r => r.type === 'navigation')).toBe(true);
        });

        it('should rank exact matches higher', () => {
            const results = search('Dashboard');
            expect(results[0].title).toBe('Dashboard');
        });

        it('should handle special characters safely', () => {
            expect(() => search('test (with) [special] {chars}')).not.toThrow();
            expect(() => search('test.*+?^$')).not.toThrow();
        });

        it('should include score in results', () => {
            const results = search('practice');
            expect(results.length).toBeGreaterThan(0);
            expect(results[0]).toHaveProperty('score');
            expect(results[0].score).toBeGreaterThan(0);
        });
    });

    describe('getTypeLabel', () => {
        it('should return correct labels for known types', () => {
            expect(getTypeLabel('navigation')).toBe('Navigation');
            expect(getTypeLabel('exercise')).toBe('Exercise');
            expect(getTypeLabel('glossary')).toBe('Glossary');
            expect(getTypeLabel('knowledge')).toBe('Knowledge Base');
            expect(getTypeLabel('practice-cards')).toBe('Practice Cards');
        });

        it('should return type as-is for unknown types', () => {
            expect(getTypeLabel('unknown')).toBe('unknown');
        });
    });

    describe('groupResultsByType', () => {
        it('should group results by type', () => {
            const results = search('practice');
            const grouped = groupResultsByType(results);

            expect(Array.isArray(grouped)).toBe(true);
            grouped.forEach(group => {
                expect(group).toHaveProperty('label');
                expect(group).toHaveProperty('items');
                expect(Array.isArray(group.items)).toBe(true);
            });
        });

        it('should return empty array for no results', () => {
            const grouped = groupResultsByType([]);
            expect(grouped).toEqual([]);
        });

        it('should maintain consistent type ordering', () => {
            const results = [
                { id: '1', type: 'glossary', title: 'Test' },
                { id: '2', type: 'navigation', title: 'Nav' },
                { id: '3', type: 'exercise', title: 'Ex' }
            ];
            const grouped = groupResultsByType(results);
            const typeOrder = grouped.map(g => g.label);

            // Navigation should come before exercise, which comes before glossary
            const navIndex = typeOrder.indexOf('Navigation');
            const exIndex = typeOrder.indexOf('Exercise');
            const glossIndex = typeOrder.indexOf('Glossary');

            expect(navIndex).toBeLessThan(exIndex);
            expect(exIndex).toBeLessThan(glossIndex);
        });
    });

    describe('refreshSearchIndex', () => {
        it('should rebuild the search index', () => {
            const originalItems = getSearchableItems();
            const refreshedItems = refreshSearchIndex();

            expect(refreshedItems.length).toBe(originalItems.length);
        });
    });
});
