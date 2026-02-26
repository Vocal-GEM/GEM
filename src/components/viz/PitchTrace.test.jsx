import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchTrace from './PitchTrace';

// Mock Canvas getContext
const mockStroke = vi.fn();
const mockBeginPath = vi.fn();
const mockMoveTo = vi.fn();
const mockLineTo = vi.fn();
const mockClearRect = vi.fn();
const mockFillRect = vi.fn();
const mockSetLineDash = vi.fn();

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: mockClearRect,
    beginPath: mockBeginPath,
    moveTo: mockMoveTo,
    lineTo: mockLineTo,
    stroke: mockStroke,
    fillRect: mockFillRect,
    setLineDash: mockSetLineDash,
    canvas: { width: 800, height: 200 }
}));

describe('PitchTrace Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 800,
            height: 200,
            top: 0,
            left: 0,
            right: 800,
            bottom: 200,
        }));
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with optimized stroke calls (batched by color)', () => {
        // Create 10 data points -> 9 segments
        // Alternating 200 and 210 Hz.
        // Target Range: 190-210 Hz.
        // Both 200 and 210 are within range -> All segments are Green (#4ade80).
        const data = Array.from({ length: 10 }, (_, i) => ({
            time: i,
            frequency: 200 + (i % 2) * 10
        }));

        const targetRange = { min: 190, max: 210 };
        const duration = 10;
        const currentTime = 5;

        render(
            <PitchTrace
                data={data}
                targetRange={targetRange}
                duration={duration}
                currentTime={currentTime}
            />
        );

        // Expected calls:
        // 1. Target Range lines: 2 strokes (top and bottom dashed lines)
        // 2. Segments: All Green -> 1 batch -> 1 stroke call.
        // 3. Cursor: 1 stroke.
        // Total = 2 + 1 + 1 = 4.

        expect(mockStroke).toHaveBeenCalledTimes(4);
    });

    it('batches multiple colors correctly', () => {
        // Create data with mixed colors
        // Target: 200-220
        // 210 -> Green
        // 100 -> Red (far below)
        const data = [
            { time: 0, frequency: 210 }, // Start Green
            { time: 1, frequency: 210 }, // End Green segment
            { time: 2, frequency: 100 }, // Jump to Red
            { time: 3, frequency: 100 }, // End Red segment
        ];
        // Segments:
        // 0->1: 210->210 (Green)
        // 1->2: 210->100 (Avg 155. Target 200-220. 155 < 200*0.9=180 -> Red)
        // 2->3: 100->100 (Red)

        // Colors present: Green, Red.
        // Batches: 1 Green, 1 Red.

        const targetRange = { min: 200, max: 220 };

        render(
            <PitchTrace
                data={data}
                targetRange={targetRange}
                duration={10}
                currentTime={5}
            />
        );

        // Expected calls:
        // 1. Target Range lines: 2 strokes
        // 2. Segments:
        //    - Green batch (1 stroke)
        //    - Red batch (1 stroke)
        // 3. Cursor: 1 stroke
        // Total = 2 + 1 + 1 + 1 = 5

        expect(mockStroke).toHaveBeenCalledTimes(5);
    });
});
