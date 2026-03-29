import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Spectrogram from './Spectrogram';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => {
    const subscribeMock = vi.fn();
    return {
        renderCoordinator: {
            subscribe: subscribeMock,
            PRIORITY: { MEDIUM: 2 },
            unsubscribe: vi.fn(),
        },
        default: {
            subscribe: subscribeMock,
            PRIORITY: { MEDIUM: 2 },
            unsubscribe: vi.fn(),
        }
    };
});

vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn()
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: vi.fn()
}));

// Mock Canvas context
const mockDrawImage = vi.fn();
const mockCreateImageData = vi.fn();
const mockPutImageData = vi.fn();

const mockContext = {
    drawImage: mockDrawImage,
    createImageData: mockCreateImageData,
    putImageData: mockPutImageData,
    fillStyle: '',
    fillRect: vi.fn(),
    font: '',
    textAlign: '',
    fillText: vi.fn(),
};

// Properly mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('Spectrogram', () => {
    let subscribeCallback;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup AudioContext mock return value
        useAudio.mockReturnValue({
            dataRef: {
                current: {
                    spectrum: new Float32Array(1024).fill(0.5)
                }
            },
            isAudioActive: true,
            audioContext: {
                sampleRate: 44100
            }
        });

        // Setup SettingsContext mock return value
        useSettings.mockReturnValue({
            settings: {
                spectrogramColorScheme: 'magma'
            }
        });

        // Setup RenderCoordinator mock
        renderCoordinator.subscribe.mockImplementation((id, callback) => {
            subscribeCallback = callback;
            return vi.fn();
        });

        // Setup Canvas mock
        mockCreateImageData.mockReturnValue({
            data: new Uint8ClampedArray(4 * 2 * 200), // speed=2, height=200
            width: 2,
            height: 200
        });

        // Ensure mockContext methods are reset
        mockDrawImage.mockClear();
        mockPutImageData.mockClear();
    });

    it('renders without crashing', () => {
        render(<Spectrogram height={200} />);
        // Check for frequency label '1k' which is rendered in the overlay
        expect(screen.getByText('1k')).toBeDefined();
    });

    it('subscribes to renderCoordinator', () => {
        render(<Spectrogram height={200} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    it('executes draw loop correctly', () => {
        render(<Spectrogram height={200} />);

        expect(subscribeCallback).toBeDefined();

        // Execute draw
        subscribeCallback();

        // Verify canvas interactions
        expect(mockDrawImage).toHaveBeenCalled();
        expect(mockCreateImageData).toHaveBeenCalled();
        expect(mockPutImageData).toHaveBeenCalled();
    });
});
