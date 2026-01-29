import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram from './Spectrogram';
import React from 'react';

// Mock contexts
const mockDataRef = { current: { spectrum: new Float32Array(512).fill(0.5) } };
const mockAudioContext = { sampleRate: 44100 };

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        dataRef: mockDataRef,
        isAudioActive: true,
        audioContext: mockAudioContext
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { spectrogramColorScheme: 'heatmap' }
    })
}));

// Mock RenderCoordinator
const { mockSubscribe } = vi.hoisted(() => ({
    mockSubscribe: vi.fn(() => vi.fn())
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: mockSubscribe,
        PRIORITY: { MEDIUM: 10 }
    }
}));

// Mock Colormap
vi.mock('../../utils/colormaps', () => ({
    generateColormap: () => new Uint32Array(256).fill(0xFF0000FF)
}));

describe('Spectrogram', () => {
    beforeEach(() => {
        // Mock Canvas getContext
        HTMLCanvasElement.prototype.getContext = vi.fn((type, options) => {
            return {
                drawImage: vi.fn(),
                createImageData: vi.fn((w, h) => ({
                    data: { buffer: new ArrayBuffer(w * h * 4) }, // 4 bytes per pixel
                    width: w,
                    height: h
                })),
                putImageData: vi.fn(),
                fillRect: vi.fn(),
            };
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders and subscribes to RenderCoordinator', () => {
        render(<Spectrogram height={200} />);
        expect(mockSubscribe).toHaveBeenCalled();
    });

    it('executes draw callback without crashing', () => {
        render(<Spectrogram height={200} />);

        // Get the draw callback passed to subscribe
        const drawCallback = mockSubscribe.mock.calls[0][1];

        expect(typeof drawCallback).toBe('function');

        // Execute draw
        act(() => {
            drawCallback();
        });

        // Execute it again to test caching logic
        act(() => {
            drawCallback();
        });
    });
});
