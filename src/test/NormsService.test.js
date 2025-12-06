import { describe, it, expect } from 'vitest';
import { NormsService, GENDER_IDENTITIES } from '../services/NormsService';

describe('NormsService', () => {
    it('should return correct norms for masculine', () => {
        const norms = NormsService.getNorms(GENDER_IDENTITIES.MASCULINE);
        expect(norms).toBeDefined();
        expect(norms.pitch.min).toBe(85);
        expect(norms.pitch.max).toBe(180);
    });

    it('should return correct norms for feminine', () => {
        const norms = NormsService.getNorms(GENDER_IDENTITIES.FEMININE);
        expect(norms).toBeDefined();
        expect(norms.pitch.min).toBe(165);
        expect(norms.pitch.max).toBe(255);
    });

    it('should return null for invalid gender', () => {
        expect(NormsService.getNorms('alien')).toBeNull();
    });

    it('should correctly identify in-range values', () => {
        // Feminine range: 165-255
        expect(NormsService.isInRange(200, GENDER_IDENTITIES.FEMININE)).toBe(true);
        expect(NormsService.isInRange(100, GENDER_IDENTITIES.FEMININE)).toBe(false);
        expect(NormsService.isInRange(300, GENDER_IDENTITIES.FEMININE)).toBe(false);
    });

    it('should return correct range status', () => {
        // Masculine range: 85-180
        expect(NormsService.getRangeStatus(50, GENDER_IDENTITIES.MASCULINE)).toBe('low');
        expect(NormsService.getRangeStatus(100, GENDER_IDENTITIES.MASCULINE)).toBe('target');
        expect(NormsService.getRangeStatus(200, GENDER_IDENTITIES.MASCULINE)).toBe('high');
    });
});
