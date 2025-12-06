import React from 'react';
import { CheckCircle, Circle, Lock } from 'lucide-react';

/**
 * JourneyProgressBar - Visual progress indicator for the guided journey
 * Shows step dots with current position and completion status
 */
const JourneyProgressBar = ({
    steps,
    currentStepIndex,
    completedSteps = [],
    onStepClick,
    compact = false
}) => {
    const progressPercentage = Math.round((completedSteps.length / steps.length) * 100);

    if (compact) {
        // Compact version for header
        return (
            <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                    {currentStepIndex + 1}/{steps.length}
                </span>
            </div>
        );
    }

    // Full version with step dots
    return (
        <div className="w-full">
            {/* Progress bar */}
            <div className="relative mb-6">
                {/* Background track */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-800" />

                {/* Progress fill */}
                <div
                    className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {/* Step dots */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.id);
                        const isCurrent = index === currentStepIndex;
                        const isAccessible = isCompleted || index <= currentStepIndex;

                        return (
                            <button
                                key={step.id}
                                onClick={() => isAccessible && onStepClick?.(step.id)}
                                disabled={!isAccessible}
                                className={`
                                    relative w-8 h-8 rounded-full flex items-center justify-center
                                    transition-all duration-300 
                                    ${isCurrent
                                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white ring-4 ring-pink-500/20 scale-110'
                                        : isCompleted
                                            ? 'bg-green-500 text-white hover:scale-105'
                                            : isAccessible
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    }
                                `}
                                title={step.title}
                            >
                                {isCompleted ? (
                                    <CheckCircle size={16} />
                                ) : !isAccessible ? (
                                    <Lock size={12} />
                                ) : (
                                    <span className="text-xs font-bold">{index + 1}</span>
                                )}

                                {/* Current step indicator */}
                                {isCurrent && (
                                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step type indicators */}
            <div className="flex justify-center gap-4 text-[10px] text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                    <Circle size={8} className="text-pink-400" fill="currentColor" /> Current
                </span>
                <span className="flex items-center gap-1">
                    <CheckCircle size={10} className="text-green-400" /> Complete
                </span>
                <span className="flex items-center gap-1">
                    <Lock size={8} className="text-slate-600" /> Locked
                </span>
            </div>
        </div>
    );
};

export default JourneyProgressBar;
