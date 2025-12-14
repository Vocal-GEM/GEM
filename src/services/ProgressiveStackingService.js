/**
 * ProgressiveStackingService.js
 * 
 * Manages the state machine for progressive stacking practice sessions.
 * Tracks layer progress, mastery detection, and exploration coverage.
 */

import { STACKING_LAYERS, LAYER_STATUS, DEFAULT_SESSION_CONFIG } from '../data/StackingLayers';

/**
 * Layer progress state
 */
const createLayerState = (layer) => ({
    layerId: layer.id,
    status: LAYER_STATUS.LOCKED,
    holdStartTime: null,
    holdDuration: 0,
    explorationMin: null,
    explorationMax: null,
    explorationCoverage: 0,
    masteryAchieved: false,
    lostTimestamp: null
});

/**
 * ProgressiveStackingService Class
 */
export class ProgressiveStackingService {
    constructor(config = {}) {
        this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
        this.layers = STACKING_LAYERS;
        this.layerStates = {};
        this.currentLayerIndex = 0;
        this.sessionStartTime = null;
        this.onLayerAdvance = null; // Callback for layer advancement
        this.onMastery = null;      // Callback for mastery achievement
        this.onLost = null;         // Callback for lost status

        this._initializeLayerStates();
    }

    _initializeLayerStates() {
        this.layers.forEach((layer, index) => {
            this.layerStates[layer.id] = createLayerState(layer);
        });
        // Unlock first layer
        if (this.layers.length > 0) {
            this.layerStates[this.layers[0].id].status = LAYER_STATUS.ACTIVE;
        }
    }

    /**
     * Start a new session
     */
    startSession() {
        this.sessionStartTime = Date.now();
        this._initializeLayerStates();
        return this.getSessionState();
    }

    /**
     * Reset the session
     */
    resetSession() {
        this.currentLayerIndex = 0;
        this._initializeLayerStates();
        return this.getSessionState();
    }

    /**
     * Get active layers (all unlocked layers up to current)
     */
    getActiveLayers() {
        return this.layers.slice(0, this.currentLayerIndex + 1);
    }

    /**
     * Get current (newest) layer being practiced
     */
    getCurrentLayer() {
        return this.layers[this.currentLayerIndex];
    }

    /**
     * Get layer state by ID
     */
    getLayerState(layerId) {
        return this.layerStates[layerId];
    }

    /**
     * Get full session state for UI rendering
     */
    getSessionState() {
        return {
            currentLayerIndex: this.currentLayerIndex,
            totalLayers: this.layers.length,
            layers: this.layers.map((layer, index) => ({
                ...layer,
                state: this.layerStates[layer.id],
                isActive: index <= this.currentLayerIndex,
                isCurrent: index === this.currentLayerIndex
            })),
            isComplete: this.currentLayerIndex >= this.layers.length,
            sessionDuration: this.sessionStartTime
                ? Date.now() - this.sessionStartTime
                : 0
        };
    }

    /**
     * Process real-time audio data and update layer states
     * @param {Object} audioData - Current audio metrics from dataRef
     * @param {Object} targets - User's target ranges (from calibration)
     * @returns {Object} Updated session state with feedback
     */
    processAudioData(audioData, targets = {}) {
        const now = Date.now();
        const feedback = [];

        // Process each active layer
        this.getActiveLayers().forEach((layer, index) => {
            const state = this.layerStates[layer.id];
            const isCurrent = index === this.currentLayerIndex;
            const value = this._getMetricValue(audioData, layer.metric);
            const target = this._getLayerTarget(layer, targets);

            if (value === null || value === undefined) {
                // No data for this metric
                this._handleNoData(layer, state, now);
                return;
            }

            const isOnTarget = this._checkOnTarget(value, target, layer);

            if (state.status === LAYER_STATUS.MASTERED) {
                // Already mastered - check if still maintaining
                if (!isOnTarget) {
                    this._handleLostMastery(layer, state, now);
                    feedback.push({ layerId: layer.id, type: 'lost', message: `Lost ${layer.name}!` });
                }
            } else if (isCurrent) {
                // Current layer being practiced
                if (layer.targetType === 'exploration') {
                    this._updateExploration(value, layer, state);
                }

                if (isOnTarget) {
                    this._handleOnTarget(layer, state, now, feedback);
                } else {
                    this._handleOffTarget(layer, state, now);
                }
            }
        });

        return {
            ...this.getSessionState(),
            feedback
        };
    }

    /**
     * Get metric value from audio data
     * Supports pitch, F2, spectral tilt, volume, and vocal weight
     */
    _getMetricValue(audioData, metric) {
        if (!audioData) return null;

        switch (metric) {
            case 'pitch':
                return audioData.pitch;
            case 'f2':
                return audioData.f2 || audioData.formants?.[1];
            case 'f1':
                return audioData.f1 || audioData.formants?.[0];
            case 'tilt':
                return audioData.tilt || audioData.spectralTilt;
            case 'volume':
                return audioData.volume || audioData.rms;
            case 'vocalWeight':
                // Support both vocalWeight (0-100) and h1h2 (dB)
                if (audioData.vocalWeight !== undefined) {
                    return audioData.vocalWeight;
                } else if (audioData.h1h2 !== undefined) {
                    // Convert H1-H2 (typically -5 to +12 dB) to 0-100 scale
                    return Math.max(0, Math.min(100, ((audioData.h1h2 + 5) / 17) * 100));
                }
                return null;
            case 'h1h2':
                // Direct H1-H2 access
                return audioData.h1h2;
            default:
                return audioData[metric];
        }
    }

    /**
     * Get target for a layer, using calibration if available
     */
    _getLayerTarget(layer, targets) {
        if (targets[layer.id]) {
            return targets[layer.id];
        }

        if (layer.targetType === 'range') {
            return layer.defaultTarget;
        } else if (layer.targetType === 'exploration') {
            return { target: layer.lockTarget, range: layer.explorationRange };
        }

        return layer.defaultTarget;
    }

    /**
     * Check if value is on target
     */
    _checkOnTarget(value, target, layer) {
        if (layer.targetType === 'range') {
            const { min, max } = target;
            return value >= (min - layer.tolerance) && value <= (max + layer.tolerance);
        } else if (layer.targetType === 'exploration') {
            // For exploration, check if near lock target
            const lockTarget = target.target || layer.lockTarget;
            return Math.abs(value - lockTarget) <= layer.tolerance;
        }
        return false;
    }

    /**
     * Update exploration coverage
     */
    _updateExploration(value, layer, state) {
        const range = layer.explorationRange;
        const keys = Object.keys(range);
        const minVal = Math.min(range[keys[0]], range[keys[1]]);
        const maxVal = Math.max(range[keys[0]], range[keys[1]]);

        // Update explored range
        if (state.explorationMin === null || value < state.explorationMin) {
            state.explorationMin = value;
        }
        if (state.explorationMax === null || value > state.explorationMax) {
            state.explorationMax = value;
        }

        // Calculate coverage (clamped to range)
        const exploredRange = Math.min(state.explorationMax, maxVal) -
            Math.max(state.explorationMin, minVal);
        const totalRange = maxVal - minVal;
        state.explorationCoverage = Math.max(0, Math.min(1, exploredRange / totalRange));

        // Mark as exploring if actively exploring
        if (state.status !== LAYER_STATUS.HOLDING && state.status !== LAYER_STATUS.MASTERED) {
            state.status = LAYER_STATUS.EXPLORING;
        }
    }

    /**
     * Handle when on target
     */
    _handleOnTarget(layer, state, now, feedback) {
        // Check exploration requirement
        if (layer.targetType === 'exploration' &&
            state.explorationCoverage < this.config.requireExplorationCoverage) {
            state.status = LAYER_STATUS.EXPLORING;
            return;
        }

        if (!state.holdStartTime) {
            state.holdStartTime = now;
            state.status = LAYER_STATUS.HOLDING;
        }

        state.holdDuration = now - state.holdStartTime;
        state.lostTimestamp = null;

        // Check for mastery
        if (state.holdDuration >= layer.masteryHoldTime && !state.masteryAchieved) {
            state.masteryAchieved = true;
            state.status = LAYER_STATUS.MASTERED;
            feedback.push({
                layerId: layer.id,
                type: 'mastered',
                message: `${layer.name} mastered!`
            });

            if (this.onMastery) {
                this.onMastery(layer);
            }

            // Auto-advance to next layer
            if (this.config.autoAdvance) {
                setTimeout(() => this._advanceToNextLayer(), this.config.celebrationDuration);
            }
        }
    }

    /**
     * Handle when off target
     */
    _handleOffTarget(layer, state, now) {
        if (state.status === LAYER_STATUS.HOLDING) {
            // Start grace period
            if (!state.lostTimestamp) {
                state.lostTimestamp = now;
            } else if (now - state.lostTimestamp > this.config.lostGracePeriod) {
                // Lost after grace period
                state.status = LAYER_STATUS.ACTIVE;
                state.holdStartTime = null;
                state.holdDuration = 0;
                state.lostTimestamp = null;
            }
        }
    }

    /**
     * Handle lost mastery on already-mastered layer
     */
    _handleLostMastery(layer, state, now) {
        state.status = LAYER_STATUS.LOST;
        state.holdStartTime = null;
        state.holdDuration = 0;

        if (this.onLost) {
            this.onLost(layer);
        }

        // After a brief period, reset to active (needs to re-master)
        setTimeout(() => {
            if (state.status === LAYER_STATUS.LOST) {
                state.status = LAYER_STATUS.ACTIVE;
                state.masteryAchieved = false;
            }
        }, 1000);
    }

    /**
     * Handle no data state
     */
    _handleNoData(layer, state, now) {
        if (state.status === LAYER_STATUS.HOLDING) {
            state.holdStartTime = null;
            state.holdDuration = 0;
            state.status = layer.targetType === 'exploration'
                ? LAYER_STATUS.EXPLORING
                : LAYER_STATUS.ACTIVE;
        }
    }

    /**
     * Advance to next layer
     */
    _advanceToNextLayer() {
        if (this.currentLayerIndex < this.layers.length - 1) {
            this.currentLayerIndex++;
            const nextLayer = this.layers[this.currentLayerIndex];
            this.layerStates[nextLayer.id].status = LAYER_STATUS.ACTIVE;

            if (this.onLayerAdvance) {
                this.onLayerAdvance(nextLayer, this.currentLayerIndex);
            }
        }
    }

    /**
     * Manually advance layer (for testing/debug)
     */
    forceAdvance() {
        this._advanceToNextLayer();
        return this.getSessionState();
    }

    /**
     * Get mastery progress as percentage
     */
    getMasteryProgress() {
        const masteredCount = Object.values(this.layerStates)
            .filter(s => s.masteryAchieved).length;
        return (masteredCount / this.layers.length) * 100;
    }

    /**
     * Set callbacks
     */
    setCallbacks({ onLayerAdvance, onMastery, onLost }) {
        if (onLayerAdvance) this.onLayerAdvance = onLayerAdvance;
        if (onMastery) this.onMastery = onMastery;
        if (onLost) this.onLost = onLost;
    }
}

// Singleton instance for easy import
let serviceInstance = null;

export const getStackingService = (config) => {
    if (!serviceInstance) {
        serviceInstance = new ProgressiveStackingService(config);
    }
    return serviceInstance;
};

export const resetStackingService = () => {
    serviceInstance = null;
};

export default ProgressiveStackingService;
