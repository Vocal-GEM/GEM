import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import BrightnessMeter from './BrightnessMeter';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Sun: () => React.createElement('div', { 'data-testid': 'sun-icon' }),
    Moon: () => React.createElement('div', { 'data-testid': 'moon-icon' }),
    Info: () => React.createElement('div', { 'data-testid': 'info-icon' }),
    Zap: () => React.createElement('div', { 'data-testid': 'zap-icon' }),
    Smile: () => React.createElement('div', { 'data-testid': 'smile-icon' })
}));

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false
    })
}));

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn((id, cb) => cb), // Auto-call for coverage
        PRIORITY: { MEDIUM: 2 }
    }
}));

describe('BrightnessMeter', () => {
    it('renders correctly', () => {
        const dataRef = { current: { spectralCentroid: 2000 } };
        const { container } = render(<BrightnessMeter dataRef={dataRef} />);
        expect(container).toBeDefined();
    });
});
