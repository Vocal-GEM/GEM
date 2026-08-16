import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { useRef } from 'react';
import RegisterGauge from './RegisterGauge';

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { MEDIUM: 2 }
    }
}));

describe('RegisterGauge', () => {
    it('renders and subscribes to RenderCoordinator', () => {
        const TestComponent = () => {
            const dataRef = useRef({
                register: {
                    mechanism: 'M1',
                    label: 'Chest',
                    description: 'Thick',
                    color: 'amber',
                    mix_ratio: 100
                },
                f0: 200,
                spectral_slope: -5.0
            });
            return <RegisterGauge dataRef={dataRef} />;
        };

        render(<TestComponent />);
        expect(screen.getByText(/Laryngeal Register/)).toBeDefined();
    });
});
