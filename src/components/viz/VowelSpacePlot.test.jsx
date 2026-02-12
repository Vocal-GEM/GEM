import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VowelSpacePlot from './VowelSpacePlot';
import React from 'react';

// Mock contexts
vi.mock('../../context/ProfileContext', () => ({
  useProfile: () => ({
    profile: { gender: 'fem' }
  })
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    colorBlindMode: false
  })
}));

describe('VowelSpacePlot', () => {
  let dataRef;
  let rafSpy;
  let cafSpy;

  beforeEach(() => {
    dataRef = {
      current: {
        f1: 400,
        f2: 1500,
        vowel: 'a',
        clarity: 0.8
      }
    };

    // Mock requestAnimationFrame and cancelAnimationFrame
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // Return an ID
      return 1;
    });
    cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    // Mock HTMLCanvasElement.prototype.getContext
    const mockContext = {
      clearRect: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    };

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders successfully', () => {
    const { container } = render(<VowelSpacePlot dataRef={dataRef} />);
    expect(container.querySelector('canvas')).toBeDefined();
  });

  it('starts animation loop on mount', () => {
    render(<VowelSpacePlot dataRef={dataRef} />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('cleans up animation loop on unmount', () => {
    const { unmount } = render(<VowelSpacePlot dataRef={dataRef} />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('renders target feedback when recording and target set', () => {
    const { getByText } = render(
      <VowelSpacePlot
        dataRef={dataRef}
        targetVowel="a"
        isRecording={true}
      />
    );
    expect(getByText('Target Resonance')).toBeDefined();
  });
});
