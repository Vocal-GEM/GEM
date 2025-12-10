import { describe, it, expect } from 'vitest';
import { SINGING_COURSE } from './SingingCourse';

describe('SingingCourse Data', () => {
    it('should have the correct id and title', () => {
        expect(SINGING_COURSE.id).toBe('singing-1');
        expect(SINGING_COURSE.title).toBe('Gender Affirming Singing Voice');
    });

    it('should have 4 weeks of content', () => {
        expect(SINGING_COURSE.weeks).toHaveLength(4);
    });

    it('Week 1 should have days with tasks', () => {
        const week1 = SINGING_COURSE.weeks[0];
        expect(week1.id).toBe('week-1');
        expect(week1.days.length).toBeGreaterThan(0);

        const day1 = week1.days[0];
        expect(day1.tasks.length).toBeGreaterThan(0);
    });

    it('should include the Singing Squat exercise', () => {
        const week1 = SINGING_COURSE.weeks[0];
        const day1 = week1.days[0];
        const squat = day1.tasks.find(t => t.id === 'singing_squat');
        expect(squat).toBeDefined();
        expect(squat.title).toContain('Singing Squat');
    });

    it('should include the Yawn Breath exercise', () => {
        const week1 = SINGING_COURSE.weeks[0];
        const day3 = week1.days[2];
        const yawn = day3.tasks.find(t => t.id === 'yawn_breath');
        expect(yawn).toBeDefined();
        expect(yawn.title).toContain('Yawn Breath');
    });

    it('Week 2 should focus on Resonance', () => {
        const week2 = SINGING_COURSE.weeks[1];
        expect(week2.title).toContain('Resonance');
    });
});
