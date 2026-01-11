import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import VowelSpacePlot from './VowelSpacePlot';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { ProfileProvider } from '../../context/ProfileContext';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { MEDIUM: 2 }
  }
}));

// Mock Contexts
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    colorBlindMode: false
  }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../../context/ProfileContext', () => ({
  useProfile: () => ({
    profile: { gender: 'fem' }
  }),
  ProfileProvider: ({ children }) => <div>{children}</div>
}));

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  canvas: { width: 800, height: 600 },
  fillStyle: '',
  strokeStyle: '',
  globalAlpha: 1,
  font: '',
  textAlign: ''
}));

describe('VowelSpacePlot', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = { current: { f1: 500, f2: 1500, vowel: 'a', clarity: 0.9 } };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(
      <SettingsProvider>
        <ProfileProvider>
          <VowelSpacePlot dataRef={dataRef} />
        </ProfileProvider>
      </SettingsProvider>
    );

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('subscribes with correct priority', () => {
    render(
      <SettingsProvider>
        <ProfileProvider>
          <VowelSpacePlot dataRef={dataRef} />
        </ProfileProvider>
      </SettingsProvider>
    );

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
    const args = renderCoordinator.subscribe.mock.calls[0];
    const priority = args[2];
    expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
  });

  it('cleans up subscription on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(
      <SettingsProvider>
        <ProfileProvider>
          <VowelSpacePlot dataRef={dataRef} />
        </ProfileProvider>
      </SettingsProvider>
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
