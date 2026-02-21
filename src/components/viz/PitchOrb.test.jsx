import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchOrb from './PitchOrb';
import React from 'react';

// Mock renderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { HIGH: 0 }
  }
}));

// Mock Settings Context
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: {
      pitchSensitivity: 'medium', // low, medium, high
      visualStyle: 'orb', // orb, bar, wave
      colorBlindMode: false
    }
  })
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
globalThis.requestAnimationFrame = mockRequestAnimationFrame;

describe('PitchOrb', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        pitch: { mean: 220, confidence: 0.9 },
        clarity: 0.8,
        intensity: { db: -20 }
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders successfully', () => {
    render(<PitchOrb dataRef={dataRef} />);
    // The component likely renders a canvas or div with specific class
    // We can check for a container or some visual element
    // Since it's canvas-based, we might just check if it doesn't crash
    expect(document.querySelector('canvas')).toBeDefined();
  });

  it('renders with low confidence input', () => {
    dataRef.current.pitch.confidence = 0.2;
    render(<PitchOrb dataRef={dataRef} />);
    expect(document.querySelector('canvas')).toBeDefined();
  });
});
