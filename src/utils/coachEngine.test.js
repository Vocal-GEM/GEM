import { describe, it, expect, vi } from 'vitest';
import { CoachEngine } from './coachEngine';
import { KnowledgeService } from '../services/KnowledgeService';

describe('CoachEngine', () => {
    it('should handle real-time pitch feedback', () => {
        const context = {
            metrics: { pitch: 150, resonance: 800 },
            settings: { targetRange: { min: 170, max: 220 } }
        };
        const response = CoachEngine.processUserQuery('how do I sound?', context);
        expect(response.text).toContain('pitch is currently 150Hz');
        expect(response.text).toContain('bit low');
    });

    it('should handle knowledge base queries', () => {
        const response = CoachEngine.processUserQuery('how do I improve breath support?', {});
        expect(response.text).toContain('Breath support comes from the diaphragm');
    });

    it('should fallback gracefully', () => {
        const response = CoachEngine.processUserQuery('what is the meaning of life?', {});
        expect(response.text).toContain("I'm not sure about that");
    });
});
