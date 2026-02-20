import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchTrace from './PitchTrace';

describe('PitchTrace Layout Thrashing', () => {
    let getBoundingClientRectSpy;

    beforeEach(() => {
        getBoundingClientRectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
            width: 800,
            height: 200,
            top: 0,
            left: 0,
            right: 800,
            bottom: 200,
        });

        // Mock Canvas getContext
        HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            setLineDash: vi.fn(),
            canvas: { width: 800, height: 200 }
        }));
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('calls getBoundingClientRect only ONCE during a drag operation (optimization)', () => {
        const { container } = render(
            <PitchTrace
                data={[{time: 0, frequency: 100}, {time: 1, frequency: 110}]}
                duration={10}
            />
        );

        const wrapper = container.firstChild;

        // Clear initial calls if any
        getBoundingClientRectSpy.mockClear();

        // Start Drag
        fireEvent.mouseDown(wrapper, { clientX: 10, clientY: 10 });

        // Move 5 times
        fireEvent.mouseMove(wrapper, { clientX: 20, clientY: 20 });
        fireEvent.mouseMove(wrapper, { clientX: 30, clientY: 30 });
        fireEvent.mouseMove(wrapper, { clientX: 40, clientY: 40 });
        fireEvent.mouseMove(wrapper, { clientX: 50, clientY: 50 });
        fireEvent.mouseMove(wrapper, { clientX: 60, clientY: 60 });

        // End Drag
        fireEvent.mouseUp(wrapper);

        // Expectation:
        // 1 call on mouseDown (explicit call to cache it)
        // 0 calls on mouseMove (uses cached)
        // Total = 1

        expect(getBoundingClientRectSpy).toHaveBeenCalledTimes(1);
    });
});
