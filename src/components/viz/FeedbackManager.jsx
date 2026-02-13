import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import CelebrationAnimations from '../ui/CelebrationAnimations';
import DriftAlert from '../ui/DriftAlert';
import { getAdaptiveFeedbackController } from '../../services/AdaptiveFeedback';
import FlowStateDetector from '../../utils/FlowStateDetector';
import HapticFeedback from '../../services/HapticFeedback';

const FeedbackManager = ({ dataRef, targetRange, active = true }) => {
    const { settings } = useSettings();
    const [celebration, setCelebration] = useState(null);
    const flowDetector = useRef(null);
    const adaptiveController = useRef(null);

    // Performance Optimization: Track drift state here to avoid passing changing pitch every 100ms
    const [driftState, setDriftState] = useState({ isDrifting: false, direction: null });
    const driftStartTimeRef = useRef(null);

    // Lazy initialization
    if (!flowDetector.current) {
        flowDetector.current = new FlowStateDetector();
    }
    if (!adaptiveController.current) {
        adaptiveController.current = getAdaptiveFeedbackController();
    }

    const [inFlow, setInFlow] = useState(false);

    // Calculate tolerance
    const sensitivity = settings.feedback?.sensitivity || 0.5;
    const tolerance = targetRange ? (targetRange.max - targetRange.min) * (1.5 - sensitivity) : 10;
    const targetValue = targetRange ? (targetRange.min + targetRange.max) / 2 : null;

    useEffect(() => {
        if (!active || !dataRef) return;

        const interval = setInterval(() => {
            const data = dataRef.current;
            if (!data) return;
            const currentPitch = data.pitch;

            // 1. Drift Detection Logic
            // Optimization: Logic moved here to prevent re-renders on every pitch update
            if (currentPitch > 0 && targetValue && !inFlow) {
                 const diff = currentPitch - targetValue;
                 const isOutside = Math.abs(diff) > tolerance;

                 if (isOutside) {
                     if (!driftStartTimeRef.current) {
                         driftStartTimeRef.current = Date.now();
                     } else {
                         const duration = adaptiveController.current ? (adaptiveController.current.getThresholds().feedbackDelay || 2000) : 2000;
                         if (Date.now() - driftStartTimeRef.current > duration) {
                             setDriftState(prev => {
                                 if (!prev.isDrifting) {
                                     HapticFeedback.play('driftAlert');
                                     return { isDrifting: true, direction: diff > 0 ? 'high' : 'low' };
                                 }
                                 const newDirection = diff > 0 ? 'high' : 'low';
                                 if (prev.direction !== newDirection) {
                                     return { ...prev, direction: newDirection };
                                 }
                                 return prev;
                             });
                         }
                     }
                 } else {
                     driftStartTimeRef.current = null;
                     setDriftState(prev => {
                         if (prev.isDrifting) return { isDrifting: false, direction: null };
                         return prev;
                     });
                 }
            } else {
                driftStartTimeRef.current = null;
                setDriftState(prev => {
                     if (prev.isDrifting) return { isDrifting: false, direction: null };
                     return prev;
                 });
            }

            // 2. Flow State
            if (flowDetector.current) {
                const metrics = {
                    accuracy: (targetRange && currentPitch >= targetRange.min && currentPitch <= targetRange.max) ? 1 : 0,
                    timestamp: Date.now()
                };
                flowDetector.current.update(metrics);
                const flowStats = flowDetector.current.getStats();
                if (flowStats.isFlowState !== inFlow) {
                    setInFlow(flowStats.isFlowState);
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [active, dataRef, targetRange, inFlow, tolerance, targetValue]);

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

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Celebration Overlay */}
            <CelebrationAnimations
                trigger={celebration}
                onComplete={clearCelebration}
            />

            {/* Drift Alert (Controlled by internal logic) */}
            <DriftAlert
                forceActive={driftState.isDrifting}
                forceDirection={driftState.direction}
                metricName="Pitch"
            />

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
