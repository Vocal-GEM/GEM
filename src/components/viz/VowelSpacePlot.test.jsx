import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import VowelSpacePlot from './VowelSpacePlot';

// Mock dependencies
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({ profile: { gender: 'fem' } })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({ colorBlindMode: false })
}));

describe('VowelSpacePlot', () => {
    let dataRef;
    let originalRequestAnimationFrame;
    let originalCancelAnimationFrame;

    beforeEach(() => {
        dataRef = {
            current: {
                f1: 500,
                f2: 1500,
                vowel: 'a',
                clarity: 0.8
            }
        };

        // Mock canvas context
        const getContext = vi.fn(() => ({
            clearRect: vi.fn(),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            fillText: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
        }));
        HTMLCanvasElement.prototype.getContext = getContext;

        // Mock requestAnimationFrame
        originalRequestAnimationFrame = window.requestAnimationFrame;
        originalCancelAnimationFrame = window.cancelAnimationFrame;
        window.requestAnimationFrame = vi.fn((cb) => {
            // Do not run the callback to avoid infinite loop in test environment
            // unless we want to test one frame.
            return 1;
        });
        window.cancelAnimationFrame = vi.fn();
    });

    afterEach(() => {
        cleanup();
        window.requestAnimationFrame = originalRequestAnimationFrame;
        window.cancelAnimationFrame = originalCancelAnimationFrame;
        vi.restoreAllMocks();
    });

    it('renders successfully', () => {
        render(<VowelSpacePlot dataRef={dataRef} />);
        // It renders a canvas and grid labels
        expect(screen.getByText('High F2 (Front)')).toBeDefined();
        expect(screen.getByText('Low F2 (Back)')).toBeDefined();
    });

    it('renders with target vowel', () => {
        render(<VowelSpacePlot dataRef={dataRef} targetVowel="a" isRecording={true} />);
        expect(screen.getByText('Target Resonance')).toBeDefined();
    });

    it('calls requestAnimationFrame on mount', () => {
        render(<VowelSpacePlot dataRef={dataRef} />);
        expect(window.requestAnimationFrame).toHaveBeenCalled();
    });
});
