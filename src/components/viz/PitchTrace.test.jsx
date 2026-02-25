import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import PitchTrace from './PitchTrace';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    RotateCcw: () => <div data-testid="rotate-ccw" />
}));

// Mock Canvas context
const mockStroke = vi.fn();
const mockBeginPath = vi.fn();
const mockMoveTo = vi.fn();
const mockLineTo = vi.fn();
const mockClearRect = vi.fn();
const mockFillRect = vi.fn();
const mockSetLineDash = vi.fn();

const mockContext = {
    canvas: { width: 800, height: 200 },
    stroke: mockStroke,
    beginPath: mockBeginPath,
    moveTo: mockMoveTo,
    lineTo: mockLineTo,
    clearRect: mockClearRect,
    fillRect: mockFillRect,
    setLineDash: mockSetLineDash,
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    strokeStyle: '#000',
    fillStyle: '#000'
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('PitchTrace Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with optimized draw calls', () => {
        // Create 100 points (99 segments)
        // Ensure some variety in frequency to trigger different colors if logic allows
        // 200 +/- 50. Target 150-250. All are in range (Green).
        // Let's add some outliers.
        const data = Array.from({ length: 100 }, (_, i) => ({
            time: i * 0.1,
            frequency: i % 10 === 0 ? 50 : (200 + Math.sin(i) * 50)
        }));
        // Outliers at 50Hz (below target 150) -> Red/Yellow?

        render(
            <PitchTrace
                data={data}
                duration={10}
                targetRange={{ min: 150, max: 250 }}
            />
        );

        // Verification:
        // 1. Target lines: 2 strokes
        // 2. Batched segments: At most 3 strokes (Red, Green, Yellow)
        // Total should be <= 5.

        const strokeCount = mockStroke.mock.calls.length;
        console.log(`Optimized stroke calls: ${strokeCount}`);
        expect(strokeCount).toBeLessThanOrEqual(6); // Allowing margin for cursor/box if enabled

        // Verify we still drew the segments
        // We have 99 segments. Each segment has 1 moveTo and 1 lineTo.
        // Plus target lines (2 moveTo, 2 lineTo).
        // Total moveTo should be around 101.
        expect(mockMoveTo.mock.calls.length).toBeGreaterThan(90);
        expect(mockLineTo.mock.calls.length).toBeGreaterThan(90);
    });
});
