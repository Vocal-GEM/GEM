import { XCircle, ArrowRight, RotateCcw, Sparkles, Star } from 'lucide-react';

/**
 * QuizResults - End of quiz session results display
 */
const QuizResults = ({
    results,
    onContinue,
    onReviewMissed,
    onBackToLearn,
    moduleInfo
}) => {
    const { correct, total, missed, moduleAdvanced, newModuleName } = results;
    const percentage = Math.round((correct / total) * 100);

    const isPerfect = correct === total;
    const isGreat = percentage >= 80;
    const isGood = percentage >= 60;

    const getGrade = () => {
        if (isPerfect) return { label: 'Perfect!', color: 'text-yellow-400', emoji: '🏆' };
        if (isGreat) return { label: 'Great Job!', color: 'text-emerald-400', emoji: '⭐' };
        if (isGood) return { label: 'Good Work!', color: 'text-blue-400', emoji: '👍' };
        return { label: 'Keep Practicing!', color: 'text-purple-400', emoji: '💪' };
    };

    const grade = getGrade();

    return (
        <div className="max-w-lg mx-auto">
            {/* Results Card */}
            <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-700 text-center relative overflow-hidden">
                {/* Background decoration */}
                {isPerfect && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-8 text-yellow-400/20 text-4xl animate-pulse">✦</div>
                        <div className="absolute top-12 right-12 text-yellow-400/10 text-2xl animate-pulse delay-75">✦</div>
                        <div className="absolute bottom-8 left-12 text-yellow-400/15 text-3xl animate-pulse delay-150">✦</div>
                    </div>
                )}

                {/* Grade Display */}
                <div className="mb-6">
                    <div className="text-6xl mb-3">{grade.emoji}</div>
                    <h2 className={`text-3xl font-bold ${grade.color}`}>
                        {grade.label}
                    </h2>
                </div>

                {/* Score Display */}
                <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white">{correct}</div>
                            <div className="text-sm text-slate-400">Correct</div>
                        </div>
                        <div className="text-4xl text-slate-600">/</div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-slate-400">{total}</div>
                            <div className="text-sm text-slate-400">Total</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${isPerfect ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                isGreat ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                                    isGood ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                                        'bg-gradient-to-r from-purple-400 to-pink-500'
                                }`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="mt-2 text-sm text-slate-500">{percentage}% accuracy</div>
                </div>

                {/* Module Progress */}
                {moduleInfo && (
                    <div className="bg-slate-800/30 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <Star className="w-4 h-4 text-purple-400" />
                            <span>Module {moduleInfo.currentModuleIndex} of {moduleInfo.totalModules}</span>
                        </div>
                        <div className="text-white font-medium mb-2">{moduleInfo.currentModuleName}</div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                style={{ width: `${moduleInfo.currentModuleProgress?.percentComplete || 0}%` }}
                            />
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                            {moduleInfo.currentModuleProgress?.mastered || 0} / {moduleInfo.currentModuleProgress?.total || 10} questions mastered
                        </div>
                    </div>
                )}

                {/* Module Advancement Celebration */}
                {moduleAdvanced && (
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold">Module Unlocked!</span>
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <p className="text-white font-medium">{newModuleName}</p>
                        <p className="text-sm text-slate-400 mt-1">
                            You&apos;ve mastered all questions in the previous module!
                        </p>
                    </div>
                )}

                {/* Missed Questions Summary */}
                {missed && missed.length > 0 && (
                    <div className="bg-slate-800/30 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-center gap-2 text-sm text-amber-400 mb-3">
                            <XCircle className="w-4 h-4" />
                            <span className="font-medium">Review These ({missed.length})</span>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {missed.slice(0, 3).map((q, i) => (
                                <div key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                    <span className="text-amber-500">•</span>
                                    <span className="line-clamp-2">{q.question}</span>
                                </div>
                            ))}
                            {missed.length > 3 && (
                                <div className="text-xs text-slate-500">
                                    +{missed.length - 3} more...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onContinue}
                        className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        Continue Learning
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {missed && missed.length > 0 && (
                        <button
                            onClick={onReviewMissed}
                            className="w-full py-3 px-6 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Review Missed Questions
                        </button>
                    )}

                    <button
                        onClick={onBackToLearn}
                        className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                        Back to Learn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResults;
