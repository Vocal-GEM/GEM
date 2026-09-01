import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RegisterGauge from './RegisterGauge';
import renderCoordinator from '../../services/RenderCoordinator';

vi.mock('../../services/RenderCoordinator', () => {
    return {
        __esModule: true,
        default: {
            subscribe: vi.fn(() => vi.fn()),
            PRIORITY: { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        }
    };
});

describe('RegisterGauge', () => {
    it('subscribes to renderCoordinator on mount', () => {
        const dataRef = { current: { register: { mechanism: 'M1' } } };
        render(<RegisterGauge dataRef={dataRef} />);

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
});
