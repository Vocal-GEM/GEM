import React from 'react';
import { render } from '@testing-library/react';
import RegisterGauge from './RegisterGauge';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { MEDIUM: 2 }
    }
}));

describe('RegisterGauge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('subscribes to renderCoordinator', () => {
        const dataRef = { current: { f0: 100, register: { mechanism: 'M1' } } };
        render(<RegisterGauge dataRef={dataRef} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
});
