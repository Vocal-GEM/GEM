import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QualityVisualizer from './QualityVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { MEDIUM: 2 }
  }
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Waves: () => <div data-testid="icon-waves" />,
  Wind: () => <div data-testid="icon-wind" />,
  Activity: () => <div data-testid="icon-activity" />
}));

describe('QualityVisualizer', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
        current: {
            jitter: 0.005,
            shimmer: 0.2,
            weight: 60
        }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders successfully', () => {
    const { getByText } = render(<QualityVisualizer dataRef={dataRef} />);
    expect(getByText('Voice Quality')).toBeDefined();
    expect(getByText('Jitter')).toBeDefined();
    expect(getByText('Shimmer')).toBeDefined();
    expect(getByText('Breathiness')).toBeDefined();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(<QualityVisualizer dataRef={dataRef} />);

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });
});
