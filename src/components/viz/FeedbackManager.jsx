import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import CelebrationAnimations from '../ui/CelebrationAnimations';
import DriftAlert from '../ui/DriftAlert';
import { getAdaptiveFeedbackController } from '../../services/AdaptiveFeedback';
import FlowStateDetector from '../../utils/FlowStateDetector';
import { useFeedback } from '../../hooks/useFeedback'; // We might piggyback or ignore
import HapticFeedback from '../../services/HapticFeedback';

const FeedbackManager = ({ dataRef, targetRange, active = true }) => {
    const { settings } = useSettings();
    const [alert, setAlert] = useState(null);
    const [celebration, setCelebration] = useState(null);
    const flowDetector = useRef(new FlowStateDetector());
    const adaptiveController = useRef(getAdaptiveFeedbackController());

    // State for visual updates
    const [currentPitch, setCurrentPitch] = useState(0);
    const [inFlow, setInFlow] = useState(false);

    useEffect(() => {
        if (!active || !dataRef) return;

        const interval = setInterval(() => {
            const data = dataRef.current;
            if (!data) return;

            // 1. Update basic state for DriftAlert
            if (data.pitch > 0) {
                setCurrentPitch(data.pitch);
            }

            // 2. Flow State
            const metrics = {
                accuracy: (targetRange && data.pitch >= targetRange.min && data.pitch <= targetRange.max) ? 1 : 0,
                timestamp: Date.now()
            };
            flowDetector.current.update(metrics);
            const flowStats = flowDetector.current.getStats();
            if (flowStats.isFlowState !== inFlow) {
                setInFlow(flowStats.isFlowState);
                if (flowStats.isFlowState) {
                    // Maybe small celebration for entering flow?
                    // setCelebration('streak'); 
                    // But don't interrupt flow with big animations
                }
            }

            // 3. Adaptive Feedback & Celebrations
            // Ideally we'd have a more robust event system, but polling dataRef is okay for visual feedback triggers
            // We check for "Target Hit" logic roughly
            // Real logic might be better in the AudioEngine callback, but this is a UI layer component

            // Check for massive success (holding note for 5s?) - Implementation Dependent

        }, 100);

        return () => clearInterval(interval);
    }, [active, dataRef, targetRange, inFlow]);

    // Listen for custom events dispatched by services (if any)
    useEffect(() => {
        const handleAchievement = (e) => {
            setCelebration(e.detail?.type || 'milestone');
        };
        window.addEventListener('achievement_unlocked', handleAchievement);
        return () => window.removeEventListener('achievement_unlocked', handleAchievement);
    }, []);

    // Helper to clear celebration
    const clearCelebration = () => setCelebration(null);

    if (!active) return null;

    const sensitivity = settings.feedback?.sensitivity || 0.5;
    const tolerance = targetRange ? (targetRange.max - targetRange.min) * (1.5 - sensitivity) : 10; // Dynamic tolerance

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Celebration Overlay */}
            <CelebrationAnimations
                trigger={celebration}
                onComplete={clearCelebration}
            />

            {/* Drift Alert (Only if not in Flow State to reduce nagging?) */}
            {/* Or Adaptive Feedback decides if we allow nagging */}
            {!inFlow && targetRange && (
                <DriftAlert
                    currentValue={currentPitch}
                    targetValue={targetRange ? (targetRange.min + targetRange.max) / 2 : null}
                    tolerance={tolerance}
                    metricName="Pitch"
                    duration={adaptiveController.current.getThresholds().feedbackDelay || 2000}
                />
            )}

            {/* Flow State Indicator (Subtle) */}
            {inFlow && (
                <div className="absolute top-4 right-4 animate-pulse">
                    <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/30 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        FLOW STATE
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackManager;
