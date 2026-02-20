import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CoachPanel from './CoachPanel';

// Mock dependencies
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        targetRange: { min: 100, max: 200 },
        activeProfile: 'fem'
    })
}));

// Mock RegisterGauge since we don't want to test it here
vi.mock('../viz/RegisterGauge', () => ({
    default: () => <div data-testid="register-gauge">Mock RegisterGauge</div>
}));

describe('CoachPanel', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                pitch: 0,
                resonance: 0,
                weight: 50,
                tilt: 0,
                register: null
            }
        };
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('renders initial state correctly', () => {
        render(<CoachPanel dataRef={dataRef} onNavigate={vi.fn()} />);
        expect(screen.getByText('0 Hz')).toBeInTheDocument();
        expect(screen.getByText('Balanced')).toBeInTheDocument();
    });

    it('updates pitch display via refs', () => {
        render(<CoachPanel dataRef={dataRef} onNavigate={vi.fn()} />);

        dataRef.current.pitch = 150;

        // Trigger RAF
        act(() => {
            vi.advanceTimersByTime(16);
        });

        expect(screen.getByText('150 Hz')).toBeInTheDocument();
    });

    it('updates weight display via refs', () => {
        render(<CoachPanel dataRef={dataRef} onNavigate={vi.fn()} />);

        dataRef.current.weight = 80;

        act(() => {
            vi.advanceTimersByTime(16);
        });

        expect(screen.getByText('Pressed / Heavy')).toBeInTheDocument();
    });

    it('shows advice when thresholds met', () => {
        render(<CoachPanel dataRef={dataRef} onNavigate={vi.fn()} />);

        // Trigger tension advice
        dataRef.current.weight = 70; // > 65

        // Advance time for loop and throttle (500ms)
        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(screen.getByText('High Tension Detected')).toBeInTheDocument();
    });
});
