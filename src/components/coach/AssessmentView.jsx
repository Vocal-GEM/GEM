import { CheckCircle, AlertCircle, Lightbulb, Target, X } from 'lucide-react';

const AssessmentView = ({ feedback, onClose, onPractice }) => {
    if (!feedback) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">AI Coach Assessment</h3>
                    <p className="text-slate-400">Personalized feedback based on your voice analysis</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                )}
            </div>

            {/* Summary */}
            {feedback.summary && (
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <Target className="w-6 h-6 text-indigo-400 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-indigo-300 mb-2">Overall Assessment</h4>
                            <p className="text-slate-300 leading-relaxed">{feedback.summary}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Strengths */}
            {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="bg-green-500/5 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-bold text-green-300 mb-3">Strengths</h4>
                            <ul className="space-y-2">
                                {feedback.strengths.map((strength, i) => (
                                    <li key={i} className="text-slate-300 flex items-start gap-2">
                                        <span className="text-green-400 mt-1">•</span>
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Areas for Improvement */}
            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-bold text-yellow-300 mb-3">Areas for Improvement</h4>
                            <ul className="space-y-2">
                                {feedback.weaknesses.map((weakness, i) => (
                                    <li key={i} className="text-slate-300 flex items-start gap-2">
                                        <span className="text-yellow-400 mt-1">•</span>
                                        <span>{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommended Exercises */}
            {feedback.exercises && feedback.exercises.length > 0 && (
                <div className="bg-blue-500/5 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-bold text-blue-300 mb-3">Recommended Exercises</h4>
                            <div className="space-y-3">
                                {feedback.exercises.map((exercise, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                                        <span className="text-slate-300">{exercise}</span>
                                        {onPractice && (
                                            <button
                                                onClick={() => onPractice(exercise)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                            >
                                                Practice
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Tips */}
            {feedback.tips && feedback.tips.length > 0 && (
                <div className="bg-purple-500/5 border border-purple-500/30 rounded-xl p-6">
                    <h4 className="font-bold text-purple-300 mb-3">Quick Tips</h4>
                    <ul className="space-y-2">
                        {feedback.tips.map((tip, i) => (
                            <li key={i} className="text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-1">💡</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AssessmentView;
