import React, { useState, useEffect, useCallback } from 'react';
import { Mic } from 'lucide-react';
import { mediumTap } from '../../services/HapticService';

const RecordingCountdown = ({ onComplete, countFrom = 3 }) => {
    const [count, setCount] = useState(countFrom);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!isActive) return;

        if (count === 0) {
            onComplete?.();
            return;
        }

        // Haptic feedback on each count
        mediumTap();

        const timer = setTimeout(() => {
            setCount(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, isActive, onComplete]);

    if (count === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in">
                <div className="text-center">
                    <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Mic className="text-white" size={64} />
                    </div>
                    <p className="text-white text-xl font-bold">Recording...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in">
            <div className="text-center">
                <div
                    className="text-[150px] font-bold text-white animate-in zoom-in duration-300"
                    key={count}
                >
                    {count}
                </div>
                <p className="text-slate-400 text-lg">Get ready to speak...</p>
            </div>
        </div>
    );
};

// Hook for using countdown before recording
export const useRecordingCountdown = () => {
    const [showCountdown, setShowCountdown] = useState(false);
    const [onCountdownComplete, setOnCountdownComplete] = useState(null);

    const startCountdown = useCallback((callback) => {
        setOnCountdownComplete(() => callback);
        setShowCountdown(true);
    }, []);

    const handleComplete = useCallback(() => {
        setShowCountdown(false);
        if (onCountdownComplete) {
            onCountdownComplete();
        }
    }, [onCountdownComplete]);

    const CountdownComponent = showCountdown ? (
        <RecordingCountdown onComplete={handleComplete} />
    ) : null;

    return { startCountdown, CountdownComponent };
};

export default RecordingCountdown;
