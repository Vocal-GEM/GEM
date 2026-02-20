import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LiveMetricsBar from './LiveMetricsBar';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock the RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(),
        PRIORITY: {
            CRITICAL: 0
        }
    }
}));

describe('LiveMetricsBar', () => {
    let dataRef;
    let loopCallback;

    beforeEach(() => {
        dataRef = {
            current: {
                pitch: 0,
                f1: 0,
                f2: 0,
                weight: 0
            }
        };

        loopCallback = undefined;

        // Capture the loop callback
        renderCoordinator.subscribe.mockImplementation((id, cb) => {
            loopCallback = cb;
            return vi.fn(); // Return unsubscribe mock
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders initial state correctly', () => {
        render(<LiveMetricsBar dataRef={dataRef} />);

        expect(screen.getByText('--')).toBeInTheDocument();
        // We expect '0' for F1, F2, and Weight
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBeGreaterThanOrEqual(3);
    });

    it('subscribes to RenderCoordinator on mount', () => {
        render(<LiveMetricsBar dataRef={dataRef} />);
        // With static import, this happens synchronously in useEffect
        expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
            'live-metrics-bar',
            expect.any(Function),
            expect.anything()
        );
    });

    it('updates DOM when dataRef changes and loop runs', async () => {
        render(<LiveMetricsBar dataRef={dataRef} />);

        // Wait for subscription (it's sync now, but good practice to verify)
        expect(renderCoordinator.subscribe).toHaveBeenCalled();

        expect(loopCallback).toBeDefined();

        // Update data
        dataRef.current = {
            pitch: 440.5,
            f1: 800.2,
            f2: 1200.8,
            weight: 65.4
        };

        // Trigger loop
        act(() => {
            loopCallback();
        });

        // Verify rounded values in DOM
        await waitFor(() => {
             expect(screen.getByText('441')).toBeInTheDocument();
        });

        expect(screen.getByText('800')).toBeInTheDocument();
        expect(screen.getByText('1201')).toBeInTheDocument();
        expect(screen.getByText('65')).toBeInTheDocument();
    });

    it('handles silence (pitch 0) correctly', async () => {
        render(<LiveMetricsBar dataRef={dataRef} />);

        expect(renderCoordinator.subscribe).toHaveBeenCalled();

        // First set some value
        dataRef.current.pitch = 220;
        act(() => { loopCallback(); });
        await waitFor(() => expect(screen.getByText('220')).toBeInTheDocument());

        // Then silence
        dataRef.current.pitch = 0;

        act(() => {
            loopCallback();
        });

        await waitFor(() => {
            expect(screen.getByText('--')).toBeInTheDocument();
        });
    });
});
