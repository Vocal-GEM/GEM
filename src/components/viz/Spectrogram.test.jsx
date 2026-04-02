import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram from './Spectrogram';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        unsubscribe: vi.fn(),
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Mock AudioContext
vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn(() => ({
        dataRef: {
            current: {
                spectrum: new Float32Array(1024).fill(0.5)
            }
        },
        isAudioActive: true,
        audioContext: { sampleRate: 44100 }
    }))
}));

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { spectrogramColorScheme: 'magma' }
    })
}));

// Mock Canvas getContext
const mockContext = {
    createImageData: vi.fn((w, h) => ({
        data: { buffer: new ArrayBuffer(w * h * 4) },
        width: w,
        height: h
    })),
    drawImage: vi.fn(),
    putImageData: vi.fn(),
    fillRect: vi.fn(),
    canvas: { width: 800, height: 200 }
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('Spectrogram', () => {
    beforeEach(() => {
        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 800,
            height: 200,
            top: 0,
            left: 0,
            right: 800,
            bottom: 200,
        }));
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders successfully and subscribes to coordinator', () => {
        render(<Spectrogram height={200} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    it('draw function should be called', () => {
        render(<Spectrogram height={200} />);

        // Get the draw callback passed to subscribe
        const [, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback
        callback();

        // Verify canvas operations
        expect(mockContext.drawImage).toHaveBeenCalled();
        expect(mockContext.putImageData).toHaveBeenCalled();
    });
});
