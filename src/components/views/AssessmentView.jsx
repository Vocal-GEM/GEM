import React from 'react';
import { CheckCircle, AlertCircle, ArrowRight, Sparkles, Activity, Mic } from 'lucide-react';

const AssessmentView = ({ feedback, onClose, onPractice }) => {
    if (!feedback) return null;

    const { summary, strengths, focusArea, details } = feedback;

    return (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Coach's Assessment</h2>
                    <p className="text-slate-400 text-sm">Based on your latest recording</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-6 border border-slate-700/50">
                <p className="text-lg font-medium text-slate-200 leading-relaxed">
                    "{summary}"
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="space-y-4">
                    <h3 className="font-bold text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        What Went Well
                    </h3>
                    {strengths.length > 0 ? (
                        <ul className="space-y-3">
                            {strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-3 bg-green-500/5 rounded-lg p-3 border border-green-500/10">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></div>
                                    <span className="text-slate-300 text-sm">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-sm italic">Keep practicing to build your strengths!</p>
                    )}
                </div>

                {/* Focus Area */}
                <div className="space-y-4">
                    <h3 className="font-bold text-amber-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Primary Focus
                    </h3>
                    <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
                        <div className="font-bold text-amber-200 mb-1">{focusArea.title}</div>
                        <p className="text-slate-300 text-sm mb-4">{focusArea.description}</p>

                        <button
                            onClick={() => onPractice(focusArea.exercise)}
                            className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            Practice {focusArea.exercise}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detailed Metrics Breakdown */}
            <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="font-bold text-slate-400 mb-4 text-sm uppercase tracking-wider">Detailed Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        title="Pitch"
                        status={details.pitch.status}
                        score={details.pitch.score}
                        icon={Activity}
                    />
                    <MetricCard
                        title="Resonance"
                        status={details.resonance.status}
                        score={details.resonance.score}
                        icon={Mic}
                    />
                    <MetricCard
                        title="Stability"
                        status={details.stability.status}
                        score={details.stability.score}
                        icon={Activity}
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                    Close Assessment
                </button>
            </div>
        </div>
    );
};

const MetricCard = ({ title, status, score, icon: Icon }) => {
    const getColor = (s) => {
        if (s >= 8) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (s >= 5) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    const colorClass = getColor(score);

    return (
        <div className={`p-4 rounded-xl border ${colorClass} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/20`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-bold text-sm">{title}</div>
                    <div className="text-xs opacity-80 capitalize">{status}</div>
                </div>
            </div>
            <div className="font-bold text-lg">{score}/10</div>
        </div>
    );
};

export default AssessmentView;
