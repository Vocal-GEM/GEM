/**
 * PostSessionSummary.jsx
 * 
 * Modal component that displays after a practice session ends.
 * Shows achievements, insights, metrics, and recommendations.
 */

import { useState, useEffect } from 'react';
import {
    Trophy, Target, CheckCircle,
    ChevronRight, Volume2, X, Sparkles, ArrowRight
} from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import SessionSummaryService from '../../services/SessionSummaryService';

const PostSessionSummary = ({ sessionData, onClose, onStartRecommended }) => {
    const [summary, setSummary] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isGenerating, setIsGenerating] = useState(true);
    const { speak, speaking, supported: ttsSupported } = useTTS();

    useEffect(() => {
        // Generate summary with slight delay for effect
        const timer = setTimeout(() => {
            const generated = SessionSummaryService.generateSessionSummary(sessionData);
            setSummary(generated);
            setIsGenerating(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [sessionData]);

    const speakSummary = () => {
        if (!summary || !ttsSupported) return;

        const text = `
            Great session! You practiced for ${summary.duration} minutes 
            and completed ${summary.exercisesCount} exercises. 
            Your session score is ${summary.score} out of 100.
            ${summary.achievements[0]?.text || ''}
            ${summary.insights[0]?.suggestion || ''}
        `;

        speak(text, { rate: 0.95, gender: 'fem' });
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-slate-400';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent!';
        if (score >= 60) return 'Great Job!';
        if (score >= 40) return 'Good Effort!';
        return 'Keep Going!';
    };

    if (isGenerating) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <div className="text-center">
                    <Sparkles className="mx-auto text-purple-400 animate-pulse mb-4" size={48} />
                    <p className="text-white font-bold">Analyzing your session...</p>
                </div>
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl my-8">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-b border-slate-700">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center">
                        <Trophy className="mx-auto text-amber-400 mb-3" size={40} />
                        <h2 className="text-2xl font-bold text-white">Session Complete!</h2>
                        <p className="text-slate-300 text-sm mt-1">
                            {summary.duration} minutes • {summary.exercisesCount} exercises
                        </p>
                    </div>

                    {/* Score Circle */}
                    <div className="flex justify-center mt-4">
                        <div className={`w-24 h-24 rounded-full border-4 ${getScoreColor(summary.score).replace('text', 'border')} flex flex-col items-center justify-center bg-black/20`}>
                            <span className={`text-3xl font-bold ${getScoreColor(summary.score)}`}>
                                {summary.score}
                            </span>
                            <span className="text-xs text-slate-400">score</span>
                        </div>
                    </div>
                    <p className={`text-center mt-2 font-bold ${getScoreColor(summary.score)}`}>
                        {getScoreLabel(summary.score)}
                    </p>

                    {/* TTS Button */}
                    {ttsSupported && (
                        <button
                            onClick={speakSummary}
                            disabled={speaking}
                            className="absolute bottom-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <Volume2 size={18} className={speaking ? 'text-purple-400 animate-pulse' : 'text-slate-300'} />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    {['overview', 'insights', 'next'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-bold capitalize transition-colors ${activeTab === tab
                                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab === 'next' ? 'Next Steps' : tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 max-h-80 overflow-y-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            {/* Achievements */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 mb-3">Achievements</h3>
                                <div className="space-y-2">
                                    {summary.achievements.map((achievement, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-xl">{achievement.icon}</span>
                                            <span className="text-slate-200">{achievement.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Metrics */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-white">{summary.metrics.avgPitch || '—'}</div>
                                    <div className="text-xs text-slate-400">Avg Pitch (Hz)</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-white">{summary.metrics.timeInTarget}%</div>
                                    <div className="text-xs text-slate-400">Time in Target</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-4">
                            {summary.insights.length > 0 ? (
                                summary.insights.map((insight, i) => (
                                    <div key={i} className="p-4 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target size={16} className="text-purple-400" />
                                            <span className="font-bold text-white">{insight.area}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-2">{insight.observation}</p>
                                        <p className="text-sm text-teal-300">💡 {insight.suggestion}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400">Great session! Keep up the good work.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'next' && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-400 mb-4">
                                Based on your session, we recommend:
                            </p>
                            {summary.recommendations.map((rec, i) => (
                                <button
                                    key={i}
                                    onClick={() => onStartRecommended?.(rec)}
                                    className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-white">{rec.exercise}</div>
                                            <div className="text-xs text-slate-400">{rec.reason} • {rec.duration}</div>
                                        </div>
                                        <ChevronRight className="text-slate-500 group-hover:text-purple-400 transition-colors" size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostSessionSummary;
