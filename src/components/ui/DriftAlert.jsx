/**
 * DriftAlert.jsx
 * Gentle notification when user drifts from targets over time
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import HapticFeedback from '../../services/HapticFeedback';

const DriftAlert = ({
    currentValue,
    targetValue,
    tolerance,
    metricName = 'Pitch',
    duration = 3000, // How long needed to trigger alert
    type = 'pitch', // 'pitch', 'resonance', 'weight'
    forceActive = undefined,
    forceDirection = undefined
}) => {
    const [isDrifting, setIsDrifting] = useState(false);
    const [driftDirection, setDriftDirection] = useState(null); // 'high' or 'low'
    const [driftStartTime, setDriftStartTime] = useState(null);

    // Determine effective state (controlled vs uncontrolled)
    const active = forceActive !== undefined ? forceActive : isDrifting;
    const direction = forceDirection !== undefined ? forceDirection : driftDirection;

    useEffect(() => {
        // Skip internal logic if controlled
        if (forceActive !== undefined) return;

        if (currentValue === null || targetValue === null) {
            setDriftStartTime(null);
            setIsDrifting(false);
            return;
        }

        const diff = currentValue - targetValue;
        const isOutside = Math.abs(diff) > tolerance;

        if (isOutside) {
            if (!driftStartTime) {
                setDriftStartTime(Date.now());
            } else {
                const timeDrifting = Date.now() - driftStartTime;
                if (timeDrifting > duration && !isDrifting) {
                    setIsDrifting(true);
                    setDriftDirection(diff > 0 ? 'high' : 'low');
                    HapticFeedback.play('driftAlert');
                }
            }
        } else {
            setDriftStartTime(null);
            setIsDrifting(false);
        }
    }, [currentValue, targetValue, tolerance, driftStartTime, duration, isDrifting, forceActive]);

    const getAlertContent = () => {
        const dir = direction;
        if (type === 'pitch') {
            return {
                icon: dir === 'high' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />,
                message: dir === 'high' ? `${metricName} drifting high` : `${metricName} drifting low`,
                subtext: dir === 'high' ? "Relax and lower slightly" : "Lift slightly"
            };
        } else if (type === 'resonance') {
            return {
                icon: <Activity className="w-5 h-5" />,
                message: dir === 'high' ? "Getting too bright" : "Getting too dark",
                subtext: "Check your mouth shape"
            };
        }

        return {
            icon: <AlertCircle className="w-5 h-5" />,
            message: `${metricName} off target`,
            subtext: "Adjust to match target"
        };
    };

    const handleClose = () => {
        setIsDrifting(false);
    };

    // Prepare content only if active
    const content = active ? getAlertContent() : null;

    return (
        <AnimatePresence>
            {active && content && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-20 right-4 z-40 max-w-xs"
                >
                    <div className="bg-amber-50 dark:bg-amber-900/40 backdrop-blur-sm border-l-4 border-amber-500 rounded-r-lg p-4 shadow-lg flex items-start space-x-3">
                        <div className="text-amber-500 mt-0.5 animate-pulse">
                            {content.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                                {content.message}
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                {content.subtext}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-100"
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DriftAlert;
