import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import React from 'react';

// Mock contexts and services
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        profile: {},
        saveSession: vi.fn()
    })
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { LOW: 1 }
    }
}));

describe('VoiceQualityAnalysis', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                volume: 0.1,
                pitch: 200,
                tilt: -10,
                f2: 1500,
                f3Noise: -60,
                harmonicRatio: 1.0
            }
        };
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders successfully', () => {
        render(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={false}
                toggleAudio={vi.fn()}
                isAudioActive={true}
            />
        );
        expect(screen.getByText(/Quad-Core Analyzer/i)).toBeDefined();
        expect(screen.getByText(/Texture/i)).toBeDefined();
    });
});
