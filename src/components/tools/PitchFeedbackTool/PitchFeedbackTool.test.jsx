/* eslint-env jest */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PitchFeedbackTool from './PitchFeedbackTool';

const {
    mockToggleAudio,
    mockUseAudioValue,
    mockUseHapticFeedback,
    mockUseReferenceTone
} = vi.hoisted(() => ({
    mockToggleAudio: vi.fn(),
    mockUseAudioValue: {
        dataRef: { current: { pitch: 0, silenceCounter: 0 } },
        isAudioActive: false,
        toggleAudio: vi.fn(),
        audioError: null
    },
    mockUseHapticFeedback: {
        triggerHaptic: vi.fn(),
        isSupported: true
    },
    mockUseReferenceTone: {
        playTone: vi.fn(),
        stopTone: vi.fn()
    }
}));

vi.mock('../../../context/AudioContext', () => ({
    useAudio: () => mockUseAudioValue
}));

vi.mock('../../../hooks/useHapticFeedback', () => ({
    useHapticFeedback: () => mockUseHapticFeedback
}));

vi.mock('../../../hooks/useReferenceTone', () => ({
    useReferenceTone: () => mockUseReferenceTone
}));

describe('PitchFeedbackTool', () => {
    beforeEach(() => {
        mockToggleAudio.mockClear();
        mockUseHapticFeedback.triggerHaptic.mockClear();
        mockUseReferenceTone.playTone.mockClear();
        mockUseReferenceTone.stopTone.mockClear();

        mockUseAudioValue.isAudioActive = false;
        mockUseAudioValue.toggleAudio = mockToggleAudio;
        mockUseAudioValue.audioError = null;
        mockUseAudioValue.dataRef.current = { pitch: 0, silenceCounter: 0 };
    });

    it('renders start listening state and toggles microphone on click', () => {
        render(<PitchFeedbackTool />);

        const button = screen.getByRole('button', { name: /start listening/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(button);
        expect(mockToggleAudio).toHaveBeenCalledTimes(1);
    });

    it('renders stop listening state when audio is active', () => {
        mockUseAudioValue.isAudioActive = true;

        render(<PitchFeedbackTool />);

        const button = screen.getByRole('button', { name: /stop listening/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-pressed', 'true');
    });
});
