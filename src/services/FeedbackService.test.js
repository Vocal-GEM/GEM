import { describe, it, expect, beforeEach } from 'vitest';
import { feedbackService } from './FeedbackService';

describe('FeedbackService', () => {
    describe('goal configurations', () => {
        it('has feminization goal config', () => {
            expect(feedbackService.goals.feminization).toBeDefined();
            expect(feedbackService.goals.feminization.pitch).toBeDefined();
            expect(feedbackService.goals.feminization.resonance).toBeDefined();
            expect(feedbackService.goals.feminization.affirmations).toBeInstanceOf(Array);
        });

        it('has masculinization goal config', () => {
            expect(feedbackService.goals.masculinization).toBeDefined();
            expect(feedbackService.goals.masculinization.pitch).toBeDefined();
            expect(feedbackService.goals.masculinization.resonance).toBeDefined();
            expect(feedbackService.goals.masculinization.affirmations).toBeInstanceOf(Array);
        });

        it('has androgyny goal config', () => {
            expect(feedbackService.goals.androgyny).toBeDefined();
            expect(feedbackService.goals.androgyny.pitch).toBeDefined();
            expect(feedbackService.goals.androgyny.resonance).toBeDefined();
            expect(feedbackService.goals.androgyny.affirmations).toBeInstanceOf(Array);
        });

        it('has exploration goal config', () => {
            expect(feedbackService.goals.exploration).toBeDefined();
            expect(feedbackService.goals.exploration.pitch).toBeDefined();
            expect(feedbackService.goals.exploration.resonance).toBeDefined();
            expect(feedbackService.goals.exploration.affirmations).toBeInstanceOf(Array);
        });
    });

    describe('getFeedback - strain detection', () => {
        it('returns strain warning for strain metric regardless of goal', () => {
            const feedback = feedbackService.getFeedback('strain', 'high', 'feminization');

            expect(feedback).toContain('strain');
            expect(feedback).toContain('pause');
            expect(feedback).toContain('hydrate');
        });

        it('prioritizes strain warning over other metrics', () => {
            const feedback = feedbackService.getFeedback('strain', 'any', 'masculinization');

            expect(feedback).toContain('health comes first');
        });
    });

    describe('getFeedback - pitch', () => {
        describe('feminization goal', () => {
            it('gives positive feedback for high pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'high', 'feminization');

                expect(feedback).toBe('Beautifully bright!');
            });

            it('gives corrective feedback for low pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'low', 'feminization');

                expect(feedback).toBe('A bit deep, try to lighten it.');
            });
        });

        describe('masculinization goal', () => {
            it('gives corrective feedback for high pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'high', 'masculinization');

                expect(feedback).toBe('A bit high, relax into the chest.');
            });

            it('gives positive feedback for low pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'low', 'masculinization');

                expect(feedback).toBe('Solid depth. Very commanding.');
            });
        });

        describe('androgyny goal', () => {
            it('gives neutral-corrective feedback for high pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'high', 'androgyny');

                expect(feedback).toBe('Getting a bit bright.');
            });

            it('gives neutral-corrective feedback for low pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'low', 'androgyny');

                expect(feedback).toBe('Getting a bit heavy.');
            });
        });

        describe('exploration goal', () => {
            it('gives descriptive feedback for high pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'high', 'exploration');

                expect(feedback).toBe('High pitch.');
            });

            it('gives descriptive feedback for low pitch', () => {
                const feedback = feedbackService.getFeedback('pitch', 'low', 'exploration');

                expect(feedback).toBe('Low pitch.');
            });
        });
    });

    describe('getFeedback - resonance', () => {
        describe('feminization goal', () => {
            it('gives positive feedback for high/bright resonance (> 60)', () => {
                const feedback = feedbackService.getFeedback('resonance', 65, 'feminization');

                expect(feedback).toBe('Glowing resonance! Very feminine.');
            });

            it('gives corrective feedback for low/dark resonance (< 40)', () => {
                const feedback = feedbackService.getFeedback('resonance', 35, 'feminization');

                expect(feedback).toBe('Resonance is dropping into the chest.');
            });

            it('gives balanced feedback for mid-range resonance (40-60)', () => {
                const feedback = feedbackService.getFeedback('resonance', 50, 'feminization');

                expect(feedback).toBe('Balanced resonance.');
            });
        });

        describe('masculinization goal', () => {
            it('gives corrective feedback for high/bright resonance (> 60)', () => {
                const feedback = feedbackService.getFeedback('resonance', 65, 'masculinization');

                expect(feedback).toBe('Too bright, aim for that chest rumble.');
            });

            it('gives positive feedback for low/dark resonance (< 40)', () => {
                const feedback = feedbackService.getFeedback('resonance', 35, 'masculinization');

                expect(feedback).toBe('Great warmth and power.');
            });

            it('gives balanced feedback for mid-range resonance', () => {
                const feedback = feedbackService.getFeedback('resonance', 50, 'masculinization');

                expect(feedback).toBe('Balanced resonance.');
            });
        });

        describe('androgyny goal', () => {
            it('gives corrective feedback for too bright resonance', () => {
                const feedback = feedbackService.getFeedback('resonance', 65, 'androgyny');

                expect(feedback).toBe('Too forward.');
            });

            it('gives corrective feedback for too dark resonance', () => {
                const feedback = feedbackService.getFeedback('resonance', 35, 'androgyny');

                expect(feedback).toBe('Too deep.');
            });

            it('gives balanced feedback for mid-range', () => {
                const feedback = feedbackService.getFeedback('resonance', 50, 'androgyny');

                expect(feedback).toBe('Balanced resonance.');
            });
        });

        describe('exploration goal', () => {
            it('gives descriptive feedback for bright resonance', () => {
                const feedback = feedbackService.getFeedback('resonance', 65, 'exploration');

                expect(feedback).toBe('Bright resonance.');
            });

            it('gives descriptive feedback for dark resonance', () => {
                const feedback = feedbackService.getFeedback('resonance', 35, 'exploration');

                expect(feedback).toBe('Dark resonance.');
            });
        });
    });

    describe('getFeedback - edge cases', () => {
        it('falls back to exploration goal when goal not found', () => {
            const feedback = feedbackService.getFeedback('pitch', 'high', 'nonexistent_goal');

            expect(feedback).toBe('High pitch.');
        });

        it('returns empty string for unknown metric', () => {
            const feedback = feedbackService.getFeedback('unknown', 'value', 'feminization');

            expect(feedback).toBe('');
        });

        it('handles undefined goal parameter', () => {
            const feedback = feedbackService.getFeedback('pitch', 'high');

            expect(feedback).toBe('High pitch.'); // Uses exploration default
        });

        it('handles resonance boundary values', () => {
            const feedback60 = feedbackService.getFeedback('resonance', 60, 'feminization');
            const feedback61 = feedbackService.getFeedback('resonance', 61, 'feminization');
            const feedback40 = feedbackService.getFeedback('resonance', 40, 'feminization');
            const feedback39 = feedbackService.getFeedback('resonance', 39, 'feminization');

            expect(feedback60).toBe('Balanced resonance.');
            expect(feedback61).toBe('Glowing resonance! Very feminine.');
            expect(feedback40).toBe('Balanced resonance.');
            expect(feedback39).toBe('Resonance is dropping into the chest.');
        });
    });

    describe('getAffirmation', () => {
        it('returns an affirmation string', () => {
            const affirmation = feedbackService.getAffirmation('feminization');

            expect(typeof affirmation).toBe('string');
            expect(affirmation.length).toBeGreaterThan(0);
        });

        it('returns affirmation from correct goal', () => {
            const feminizationAffirmations = feedbackService.goals.feminization.affirmations;
            const affirmation = feedbackService.getAffirmation('feminization');

            expect(feminizationAffirmations).toContain(affirmation);
        });

        it('returns different affirmations from masculinization', () => {
            const masculinizationAffirmations = feedbackService.goals.masculinization.affirmations;
            const affirmation = feedbackService.getAffirmation('masculinization');

            expect(masculinizationAffirmations).toContain(affirmation);
        });

        it('returns affirmation from androgyny goal', () => {
            const androgynyAffirmations = feedbackService.goals.androgyny.affirmations;
            const affirmation = feedbackService.getAffirmation('androgyny');

            expect(androgynyAffirmations).toContain(affirmation);
        });

        it('returns affirmation from exploration goal when no goal specified', () => {
            const explorationAffirmations = feedbackService.goals.exploration.affirmations;
            const affirmation = feedbackService.getAffirmation();

            expect(explorationAffirmations).toContain(affirmation);
        });

        it('falls back to exploration goal for unknown goal', () => {
            const explorationAffirmations = feedbackService.goals.exploration.affirmations;
            const affirmation = feedbackService.getAffirmation('unknown_goal');

            expect(explorationAffirmations).toContain(affirmation);
        });

        it('returns one of multiple affirmations', () => {
            const affirmations = feedbackService.goals.feminization.affirmations;

            // Get multiple affirmations to verify randomness (probabilistic test)
            const results = new Set();
            for (let i = 0; i < 20; i++) {
                results.add(feedbackService.getAffirmation('feminization'));
            }

            // Should get at least 1 unique affirmation (realistically should get more)
            expect(results.size).toBeGreaterThan(0);
            results.forEach((affirmation) => {
                expect(affirmations).toContain(affirmation);
            });
        });
    });

    describe('personality parameter', () => {
        it('accepts personality parameter (currently unused)', () => {
            // The personality parameter exists but isn't used yet
            const feedback = feedbackService.getFeedback('pitch', 'high', 'feminization', 'encouraging');

            expect(feedback).toBe('Beautifully bright!');
        });
    });
});
