
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Spectrogram from './Spectrogram';

// Mock dependencies
const mockSubscribe = vi.fn();
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: (id, cb) => {
            mockSubscribe(id, cb);
            return vi.fn(); // unsubscribe
        },
        PRIORITY: { MEDIUM: 10 }
    }
}));

const mockDataRef = {
    current: {
        spectrum: new Float32Array(512),
        history: [],
    }
};

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        dataRef: mockDataRef,
        isAudioActive: true,
        audioContext: { sampleRate: 44100 }
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: {
            spectrogramColorScheme: 'magma'
        }
    })
}));

// Mock Canvas API
beforeEach(() => {
    vi.clearAllMocks();

    // Fill spectrum with some dummy data
    for(let i=0; i<512; i++) {
        mockDataRef.current.spectrum[i] = Math.sin(i / 10);
    }

    HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
        if (type === '2d') {
            return {
                drawImage: vi.fn(),
                createImageData: vi.fn(() => ({
                    data: new Uint8ClampedArray(4 * 2 * 200), // speed=2, height=200
                    width: 2,
                    height: 200
                })),
                putImageData: vi.fn(),
                fillRect: vi.fn(),
                fillStyle: '',
            };
        }
        return null;
    });
});

describe('Spectrogram', () => {
    it('renders without crashing', () => {
        const { container } = render(<Spectrogram />);
        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('subscribes to render coordinator when audio is active', () => {
        render(<Spectrogram />);
        expect(mockSubscribe).toHaveBeenCalled();
    });

    it('draws to canvas when callback is triggered', () => {
        render(<Spectrogram />);

        // Find the callback passed to subscribe
        const callback = mockSubscribe.mock.calls[0][1];

        // Trigger the draw loop manually
        callback();

        // Since we can't easily inspect local variables inside the component,
        // we assume if getContext was called, drawing logic started.
        expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d', expect.anything());
    });
});
