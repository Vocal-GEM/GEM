
import { Play, RotateCcw, Clock, Sparkles } from 'lucide-react';

/**
 * JourneyEntryCard - Entry point card for the guided journey on the dashboard
 */
const JourneyEntryCard = ({
    onStart,
    onResume,
    hasInProgress = false,
    progressPercentage = 0,
    currentStepTitle = '',
    isComplete = false
}) => {
    if (isComplete) {
        // Completed journey card
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 p-6">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full text-xs font-bold text-green-400 mb-2">
                                <Sparkles size={12} />
                                COMPLETED
                            </span>
                            <h3 className="text-xl font-bold !text-white">Voice Feminization Journey</h3>
                            <p className="text-sm !text-slate-200 mt-1">You&apos;ve completed all 12 steps!</p>
                        </div>
                        <div className="text-4xl">🎉</div>
                    </div>

                    <button
                        onClick={onStart}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl !text-slate-200 text-sm font-medium transition-colors"
                    >
                        <RotateCcw size={16} />
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    if (hasInProgress) {
        // In-progress journey card
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-500/30 p-6">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-pink-500/20 rounded-full text-xs font-bold text-pink-400 mb-2">
                                <Clock size={12} />
                                IN PROGRESS
                            </span>
                            <h3 className="text-xl font-bold !text-white">Voice Feminization Journey</h3>
                            <p className="text-sm !text-slate-200 mt-1">
                                Continue: <span className="!text-pink-300">{currentStepTitle}</span>
                            </p>
                        </div>
                        <div className="text-4xl">🌸</div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs !text-slate-200 mb-1">
                            <span>Progress</span>
                            <span className="font-bold text-pink-400">{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={onResume}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-xl !text-white font-bold shadow-lg shadow-pink-500/20 transition-all transform active:scale-95"
                    >
                        <Play size={18} fill="currentColor" />
                        Continue Journey
                    </button>
                </div>
            </div>
        );
    }

    // New journey card
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 to-purple-700 p-6 shadow-2xl">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold !text-white mb-3 border border-white/20">
                            ✨ GUIDED EXPERIENCE
                        </span>
                        <h3 className="text-2xl font-bold !text-white mb-2">Voice Feminization Journey</h3>
                        <p className="!text-pink-100 max-w-md text-sm leading-relaxed">
                            New to voice training? Start here! This guided journey will teach you
                            step-by-step, one concept at a time – no overwhelm.
                        </p>
                    </div>
                    <div className="text-5xl">🌸</div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <button
                        onClick={onStart}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-colors shadow-lg"
                    >
                        <Play size={18} fill="currentColor" />
                        Begin Journey
                    </button>
                    <span className="text-pink-200 text-xs">
                        ~45 minutes • 12 steps
                    </span>
                </div>
            </div>
        </div>
    );
};

export default JourneyEntryCard;
