import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RegisterGauge from './RegisterGauge';
import React from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Mock lucide icons
vi.mock('lucide-react', () => {
    const React = require('react');
    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });

    return {
        Layers: createIcon('Layers'),
        Activity: createIcon('Activity'),
        AlertTriangle: createIcon('AlertTriangle'),
        Wind: createIcon('Wind'),
        Info: createIcon('Info')
    };
});

describe('RegisterGauge', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { register: null, f0: 0, spectral_slope: 0 } };
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders successfully', () => {
        render(<RegisterGauge dataRef={dataRef} />);
        expect(screen.getByText('Laryngeal Register')).toBeDefined();
    });

    it('subscribes to RenderCoordinator', () => {
        render(<RegisterGauge dataRef={dataRef} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [, , priority] = renderCoordinator.subscribe.mock.calls[0];
        expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
    });

    it('cleans up subscription on unmount', () => {
        const unsubscribe = vi.fn();
        renderCoordinator.subscribe.mockReturnValue(unsubscribe);

        const { unmount } = render(<RegisterGauge dataRef={dataRef} />);

        unmount();
        expect(unsubscribe).toHaveBeenCalled();
    });
});
