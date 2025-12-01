import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from './AnalyticsService';

describe('AnalyticsService', () => {
    beforeEach(() => {
        // Reset service state
        analyticsService.initialized = false;
        analyticsService.enabled = false;
        analyticsService.events = [];
        vi.clearAllMocks();
    });

    it('should not log events when disabled', () => {
        analyticsService.init(false);
        analyticsService.logEvent('test_event');
        expect(analyticsService.getEvents()).toHaveLength(0);
    });

    it('should log events when enabled', () => {
        analyticsService.init(true);
        analyticsService.logEvent('test_event', { foo: 'bar' });

        const events = analyticsService.getEvents();
        expect(events).toHaveLength(2); // app_init + test_event
        expect(events[0].name).toBe('test_event');
        expect(events[0].properties).toEqual({ foo: 'bar' });
    });

    it('should respect buffer limit', () => {
        analyticsService.init(true);
        analyticsService.MAX_EVENTS = 5;

        for (let i = 0; i < 10; i++) {
            analyticsService.logEvent(`event_${i}`);
        }

        expect(analyticsService.getEvents()).toHaveLength(5);
        expect(analyticsService.getEvents()[0].name).toBe('event_9');
    });

    it('should calculate funnel stats correctly', () => {
        analyticsService.init(true);

        analyticsService.logEvent('tutorial_start');
        analyticsService.logEvent('step_1');
        analyticsService.logEvent('tutorial_complete');

        analyticsService.logEvent('tutorial_start');
        // Incomplete second run

        const stats = analyticsService.getFunnelStats();

        expect(stats.tutorialStart).toBe(2);
        expect(stats.tutorialComplete).toBe(1);
        expect(stats.conversionRate).toBe(50);
    });

    it('should toggle enabled state', () => {
        analyticsService.init(false);
        analyticsService.logEvent('ignored_event');
        expect(analyticsService.getEvents()).toHaveLength(0);

        analyticsService.setEnabled(true);
        analyticsService.logEvent('captured_event');

        const events = analyticsService.getEvents();
        expect(events).toHaveLength(2); // analytics_enabled + captured_event
        expect(events[0].name).toBe('captured_event');
    });
});
