import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram from './Spectrogram';
import { useAudio } from '../../context/AudioContext';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn()
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { spectrogramColorScheme: 'inferno' }
    })
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { MEDIUM: 10 }
    }
}));

// Mock Canvas API
const mockContext = {
    drawImage: vi.fn(),
    createImageData: vi.fn((w, h) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4)
    })),
    putImageData: vi.fn(),
    fillStyle: '',
    fillRect: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('Spectrogram', () => {
    let dataRef;
    let mockSubscribe;

    beforeEach(() => {
        dataRef = {
            current: {
                spectrum: new Float32Array(512).fill(0.5)
            }
        };

        useAudio.mockReturnValue({
            dataRef,
            isAudioActive: true,
            audioContext: { sampleRate: 44100 }
        });

        mockSubscribe = vi.fn((id, cb) => {
            // Store callback to trigger it manually
            mockSubscribe.callback = cb;
            return vi.fn();
        });
        renderCoordinator.subscribe = mockSubscribe;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders successfully', () => {
        const { container } = render(<Spectrogram height={200} />);
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeDefined();
    });

    it('subscribes to renderCoordinator when active', () => {
        render(<Spectrogram height={200} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    it('executes draw loop without error', () => {
        render(<Spectrogram height={200} />);

        // Trigger the draw callback
        expect(mockSubscribe.callback).toBeDefined();

        act(() => {
            mockSubscribe.callback();
        });

        // Verify canvas interactions
        expect(mockContext.drawImage).toHaveBeenCalled();
        expect(mockContext.putImageData).toHaveBeenCalled();
    });
});
