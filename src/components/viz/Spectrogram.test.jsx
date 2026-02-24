import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Spectrogram from './Spectrogram';
import React from 'react';

// Mock dependencies
vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        dataRef: { current: { spectrum: new Float32Array(1024).fill(0.5) } },
        isAudioActive: true,
        audioContext: { sampleRate: 44100 }
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { spectrogramColorScheme: 'magma' }
    })
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Mock Canvas
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

beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
});

describe('Spectrogram', () => {
    it('renders without crashing', () => {
        render(<Spectrogram />);
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });
});
