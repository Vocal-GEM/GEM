import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram from './Spectrogram';
import React from 'react';

// Mock dependencies
vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn(),
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn((id, cb) => {
            // Immediately invoke callback to test drawing logic
            // Mock a delta time
            try {
                cb(0.016);
            } catch (e) {
                console.error("Error in render callback:", e);
            }
            return vi.fn(); // Unsubscribe mock
        }),
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Mock utils
vi.mock('../../utils/colormaps', () => ({
    generateColormap: () => new Uint32Array(256).fill(0xFF0000FF) // Blue
}));

import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';

describe('Spectrogram Component', () => {
    let mockContext;
    let mockCanvasContext;

    beforeEach(() => {
        // Setup Audio Context Mock
        mockContext = {
            dataRef: {
                current: {
                    spectrum: new Float32Array(512).fill(0.5)
                }
            },
            isAudioActive: true,
            audioContext: { sampleRate: 44100 }
        };
        useAudio.mockReturnValue(mockContext);

        // Setup Settings Mock
        useSettings.mockReturnValue({
            settings: { spectrogramColorScheme: 'heatmap' }
        });

        // Mock Canvas getContext
        mockCanvasContext = {
            drawImage: vi.fn(),
            createImageData: vi.fn(() => ({
                data: new Uint8ClampedArray(2 * 200 * 4), // width * height * 4
                width: 2,
                height: 200
            })),
            putImageData: vi.fn(),
            fillRect: vi.fn(),
            fillStyle: '',
        };

        // JSDOM doesn't implement getContext by default in a way that returns a mock
        // We can spy on HTMLCanvasElement.prototype.getContext
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCanvasContext);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders without crashing', () => {
        render(<Spectrogram />);
        // Use a more generic query since we can't easily rely on text content for a canvas
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeTruthy();
    });

    it('subscribes to renderCoordinator and draws', () => {
        render(<Spectrogram />);

        // Check if drawImage was called (shifting the canvas)
        // Since renderCoordinator.subscribe calls the callback immediately in our mock,
        // we expect drawing to happen on mount.
        expect(mockCanvasContext.drawImage).toHaveBeenCalled();

        // Check if putImageData was called (drawing new strip)
        expect(mockCanvasContext.putImageData).toHaveBeenCalled();
    });
});
