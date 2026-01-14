
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResonanceMetrics from './ResonanceMetrics';

// Mock dependencies
vi.mock('lucide-react', () => ({
    Info: () => <div data-testid="info-icon" />
}));

describe('ResonanceMetrics', () => {
    let dataRef;

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup data ref
        dataRef = {
            current: {
                f1: 500,
                f2: 1500,
                resonance: 1000,
                resonanceScore: 75
            }
        };

        // Mock requestAnimationFrame
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
             return 123;
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders initial metrics', () => {
        render(<ResonanceMetrics dataRef={dataRef} />);

        expect(screen.getByText('R1 (F1)')).toBeInTheDocument();
        expect(screen.getByText('R2 (F2)')).toBeInTheDocument();
        expect(screen.getByText('Brightness')).toBeInTheDocument();
        expect(screen.getByText('RBI Score')).toBeInTheDocument();
    });

    it('uses requestAnimationFrame loop', () => {
        render(<ResonanceMetrics dataRef={dataRef} />);
        expect(window.requestAnimationFrame).toHaveBeenCalled();
    });
});
