import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderCoordinator } from './RenderCoordinator';

describe('RenderCoordinator', () => {
    beforeEach(() => {
        // Reset singleton state
        renderCoordinator.subscribers = new Map();
        renderCoordinator.stop();
        renderCoordinator.rafId = null;
        renderCoordinator.lastFrameTime = 0;
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should call subscribers in priority order', () => {
        const order = [];
        const lowPriority = () => order.push('low');
        const mediumPriority = () => order.push('medium');
        const highPriority = () => order.push('high');

        renderCoordinator.subscribe('low', lowPriority, renderCoordinator.PRIORITY.LOW);
        renderCoordinator.subscribe('high', highPriority, renderCoordinator.PRIORITY.HIGH);
        renderCoordinator.subscribe('medium', mediumPriority, renderCoordinator.PRIORITY.MEDIUM);

        // Force start
        renderCoordinator.isRunning = true;

        // Mock performance.now to simulate time passing
        // Initial time
        let time = 1000;
        vi.spyOn(performance, 'now').mockImplementation(() => time);

        // Initial setup
        renderCoordinator.lastFrameTime = time;

        // Advance time by one frame interval (approx 16.6ms for 60fps)
        time += 20;

        // Trigger loop manually once
        // We can't easily call loop if it's an arrow function property, but we can access it.
        renderCoordinator.loop();

        expect(order).toEqual(['high', 'medium', 'low']);
    });

    it('should handle unsubscription correctly', () => {
        const callback = vi.fn();
        const unsubscribe = renderCoordinator.subscribe('test', callback);

        expect(renderCoordinator.subscribers.size).toBe(1);

        unsubscribe();

        expect(renderCoordinator.subscribers.size).toBe(0);
    });
});
