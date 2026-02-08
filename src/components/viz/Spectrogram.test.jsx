import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram from './Spectrogram';

// Mock Dependencies
vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn()
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: vi.fn()
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn((id, callback) => {
            // Store callback to manually trigger it
            globalThis.mockDrawCallback = callback;
            return vi.fn(); // unsubscribe mock
        }),
        PRIORITY: { MEDIUM: 1 }
    }
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Camera: () => <div data-testid="camera-icon" />,
    X: () => <div data-testid="x-icon" />
}));

import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';

describe('Spectrogram', () => {
    let dataRefMock;

    beforeEach(() => {
        // Mock Canvas
        // HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        //     drawImage: vi.fn(),
        //     createImageData: vi.fn(() => ({
        //         data: new Uint8ClampedArray(400 * 4), // enough for 100px height * 1px width * 4 channels
        //         width: 1,
        //         height: 100
        //     })),
        //     putImageData: vi.fn(),
        //     fillRect: vi.fn(),
        //     fillStyle: '',
        // }));

        dataRefMock = {
            current: {
                spectrum: new Float32Array(512).fill(0.5)
            }
        };

        useAudio.mockReturnValue({
            dataRef: dataRefMock,
            isAudioActive: true,
            audioContext: { sampleRate: 44100 }
        });

        useSettings.mockReturnValue({
            settings: {
                spectrogramColorScheme: 'heatmap'
            }
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete globalThis.mockDrawCallback;
    });

    it('renders without crashing', () => {
        render(<Spectrogram height={100} />);
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeDefined();
    });

    it('subscribes to renderCoordinator when audio is active', () => {
        render(<Spectrogram height={100} />);
        expect(globalThis.mockDrawCallback).toBeDefined();
    });

    it('executes draw function safely', () => {
        // Mock getContext on the canvas element created by React
        const mockContext = {
            drawImage: vi.fn(),
            createImageData: vi.fn((w, h) => ({
                data: { buffer: new ArrayBuffer(w * h * 4) },
                width: w,
                height: h
            })),
            putImageData: vi.fn(),
            fillRect: vi.fn(),
        };

        // Spy on HTMLCanvasElement to return our mock context
        const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

        render(<Spectrogram height={100} />);

        // Execute the draw callback
        if (globalThis.mockDrawCallback) {
            globalThis.mockDrawCallback();
        }

        expect(mockContext.drawImage).toHaveBeenCalled();
        expect(mockContext.putImageData).toHaveBeenCalled();

        getContextSpy.mockRestore();
    });
});
