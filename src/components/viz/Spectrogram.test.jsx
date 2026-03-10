import { render, screen } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import Spectrogram from './Spectrogram';

// Mock context hooks
const mockUseAudio = vi.fn();
const mockUseSettings = vi.fn();

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => mockUseAudio()
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => mockUseSettings()
}));

// Mock renderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn((id, cb) => {
            // Immediately call the callback to test drawing logic
            try {
                cb();
            } catch (e) {
                console.error(e);
            }
            return vi.fn();
        }),
        PRIORITY: { MEDIUM: 1 }
    }
}));

describe('Spectrogram', () => {
    beforeEach(() => {
        mockUseAudio.mockReturnValue({
            dataRef: { current: { spectrum: new Float32Array(1024).fill(0.5) } },
            isAudioActive: true,
            audioContext: { sampleRate: 44100 }
        });

        mockUseSettings.mockReturnValue({
            settings: { spectrogramColorScheme: 'inferno' }
        });

        // Mock Canvas context
        HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            drawImage: vi.fn(),
            createImageData: vi.fn((w, h) => ({
                data: new Uint8ClampedArray(4 * w * h),
                width: w,
                height: h
            })),
            putImageData: vi.fn(),
            fillRect: vi.fn(),
        }));
    });

    it('renders without crashing', () => {
        render(<Spectrogram height={200} />);
        // It renders a canvas
        // Note: querySelector works because we use jsdom
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeTruthy();
    });
});
