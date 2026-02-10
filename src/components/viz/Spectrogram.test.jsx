import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Spectrogram from './Spectrogram';

// Mock contexts
vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        dataRef: { current: { spectrum: new Uint8Array(1024).fill(128) } },
        isAudioActive: true,
        audioContext: { sampleRate: 44100 }
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { spectrogramColorScheme: 'inferno' }
    })
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { MEDIUM: 1 }
    }
}));

describe('Spectrogram', () => {
    it('renders without crashing', () => {
        render(<Spectrogram />);
        // Basic check to ensure it rendered. The canvas should be present.
        // It might not have role="img" by default so we might need to query by tag or something else.
        // But since it's a canvas, it's hard to query by role unless added.
        // However, the component wrapper has specific classes.
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeTruthy();
    });
});
