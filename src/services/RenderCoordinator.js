/**
 * RenderCoordinator - Singleton service for coordinating all visualization RAF loops
 * Reduces CPU usage by consolidating multiple independent animation loops into one
 */

class RenderCoordinator {
    constructor() {
        if (RenderCoordinator.instance) {
            return RenderCoordinator.instance;
        }

        this.subscribers = new Map();
        this.isRunning = false;
        this.rafId = null;
        this.lastFrameTime = 0;
        this.fpsTarget = 60;
        this.frameInterval = 1000 / this.fpsTarget;
        this.performanceMode = 'high'; // 'low' | 'medium' | 'high'

        // Priority levels for subscribers
        this.PRIORITY = {
            CRITICAL: 0,  // Orb, meters - always render
            HIGH: 1,      // Pitch visualizers, live metrics
            MEDIUM: 2,    // Spectrograms
            LOW: 3        // Non-essential visualizations
        };

        RenderCoordinator.instance = this;
    }

    /**
     * Set performance mode and adjust FPS target
     * @param {string} mode - 'low' | 'medium' | 'high'
     */
    setPerformanceMode(mode) {
        this.performanceMode = mode;

        switch (mode) {
            case 'low':
                this.fpsTarget = 30;
                break;
            case 'medium':
                this.fpsTarget = 45;
                break;
            case 'high':
            default:
                this.fpsTarget = 60;
                break;
        }

        this.frameInterval = 1000 / this.fpsTarget;
    }

    /**
     * Subscribe a component to the render loop
     * @param {string} id - Unique identifier for the subscriber
     * @param {Function} callback - Function to call each frame (receives deltaTime)
     * @param {number} priority - Priority level (use PRIORITY constants)
     * @returns {Function} Unsubscribe function
     */
    subscribe(id, callback, priority = this.PRIORITY.MEDIUM) {
        this.subscribers.set(id, {
            callback,
            priority,
            enabled: true
        });

        // Start loop if not running
        if (!this.isRunning) {
            this.start();
        }

        // Return unsubscribe function
        return () => this.unsubscribe(id);
    }

    /**
     * Unsubscribe a component from the render loop
     * @param {string} id - Subscriber identifier
     */
    unsubscribe(id) {
        this.subscribers.delete(id);

        // Stop loop if no subscribers
        if (this.subscribers.size === 0) {
            this.stop();
        }
    }

    /**
     * Enable/disable a specific subscriber without removing it
     * @param {string} id - Subscriber identifier
     * @param {boolean} enabled - Whether to enable or disable
     */
    setEnabled(id, enabled) {
        const subscriber = this.subscribers.get(id);
        if (subscriber) {
            subscriber.enabled = enabled;
        }
    }

    /**
     * Start the render loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.loop();
    }

    /**
     * Stop the render loop
     */
    stop() {
        this.isRunning = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Main render loop
     */
    loop = () => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        // FPS throttling
        if (deltaTime >= this.frameInterval) {
            this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);

            // Calculate actual delta in seconds for smooth animations
            const delta = deltaTime / 1000;

            // Sort subscribers by priority
            const sortedSubscribers = Array.from(this.subscribers.entries())
                .sort((a, b) => a[1].priority - b[1].priority);

            // Call each enabled subscriber
            for (const [id, subscriber] of sortedSubscribers) {
                if (subscriber.enabled) {
                    try {
                        subscriber.callback(delta, currentTime);
                    } catch (error) {
                        console.error(`RenderCoordinator: Error in subscriber ${id}:`, error);
                    }
                }
            }
        }

        this.rafId = requestAnimationFrame(this.loop);
    }

    /**
     * Get current stats for debugging
     */
    getStats() {
        return {
            subscriberCount: this.subscribers.size,
            enabledCount: Array.from(this.subscribers.values()).filter(s => s.enabled).length,
            fpsTarget: this.fpsTarget,
            performanceMode: this.performanceMode,
            isRunning: this.isRunning
        };
    }
}

// Export singleton instance
export const renderCoordinator = new RenderCoordinator();
export default renderCoordinator;
