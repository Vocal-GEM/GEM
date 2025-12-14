/**
 * SkillAssessmentPanel.jsx
 * 
 * Displays user's skill assessment with visual radar/progress charts.
 * Shows strengths, weaknesses, and personalized recommendations.
 */

import { useState, useEffect } from 'react';
import {
    RefreshCw, TrendingUp, Target, Zap, Award,
    ChevronRight, Lightbulb, Star
} from 'lucide-react';
import SkillAssessmentService from '../../services/SkillAssessmentService';

const { SKILL_LEVELS } = SkillAssessmentService;

const SkillAssessmentPanel = ({ embedded = false, onClose }) => {
    const [assessment, setAssessment] = useState(null);
    const [isAssessing, setIsAssessing] = useState(false);

    useEffect(() => {
        // Load existing assessment
        const stored = SkillAssessmentService.getStoredAssessment();
        if (stored) {
            setAssessment(stored);
        }
    }, []);

    const runAssessment = async () => {
        setIsAssessing(true);
        // Simulate processing time for UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = SkillAssessmentService.assessSkills();
        setAssessment(result);
        setIsAssessing(false);
    };

    const getLevelColor = (levelName) => {
        const level = SKILL_LEVELS.find(l => l.name === levelName);
        return level?.color || 'slate';
    };

    const getScoreColor = (score) => {
        if (score >= 4) return 'emerald';
        if (score >= 3) return 'green';
        if (score >= 2) return 'amber';
        return 'slate';
    };

    const Wrapper = embedded ? 'div' : 'div';
    const wrapperClass = embedded
        ? ''
        : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';

    return (
        <Wrapper className={wrapperClass}>
            <div className={`${embedded ? '' : 'w-full max-w-lg'} bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/20">
                                <Target className="text-purple-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Skill Assessment</h2>
                                <p className="text-sm text-slate-400">Your voice training progress</p>
                            </div>
                        </div>
                        {!embedded && onClose && (
                            <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!assessment && !isAssessing && (
                        <div className="text-center py-8">
                            <Award size={48} className="mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-400 mb-6">Get a personalized assessment of your voice training skills</p>
                            <button
                                onClick={runAssessment}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-colors"
                            >
                                Run Assessment
                            </button>
                        </div>
                    )}

                    {isAssessing && (
                        <div className="text-center py-12">
                            <RefreshCw size={48} className="mx-auto text-purple-400 animate-spin mb-4" />
                            <p className="text-slate-300">Analyzing your progress...</p>
                        </div>
                    )}

                    {assessment && !isAssessing && (
                        <div className="space-y-6">
                            {/* Overall Level */}
                            <div className={`p-4 rounded-2xl bg-${assessment.level.color}-500/10 border border-${assessment.level.color}-500/20`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-lg font-bold text-${assessment.level.color}-400`}>
                                        {assessment.level.name}
                                    </span>
                                    <span className="text-2xl font-bold text-white">{assessment.overallScore}/5</span>
                                </div>
                                <p className="text-sm text-slate-400">{assessment.level.description}</p>
                            </div>

                            {/* Skill Breakdown */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Skills Breakdown</h3>
                                <div className="space-y-3">
                                    {Object.entries(assessment.dimensions).map(([key, dim]) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-slate-300">{dim.name}</span>
                                                    <span className={`text-sm font-bold text-${getScoreColor(dim.score)}-400`}>
                                                        {dim.score}/{dim.maxScore}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-${getScoreColor(dim.score)}-500 transition-all`}
                                                        style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {assessment.strengths.includes(key) && (
                                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {assessment.recommendations?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                        <Lightbulb size={14} />
                                        Recommendations
                                    </h3>
                                    <div className="space-y-2">
                                        {assessment.recommendations.slice(0, 2).map((rec, idx) => (
                                            <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white">{rec.area}</span>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                            rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-slate-600/50 text-slate-400'
                                                        }`}>
                                                        {rec.priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400">{rec.tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Re-assess button */}
                            <button
                                onClick={runAssessment}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw size={16} />
                                Re-assess Skills
                            </button>

                            {/* Last assessed */}
                            {assessment.assessedAt && (
                                <p className="text-xs text-center text-slate-500">
                                    Last assessed: {new Date(assessment.assessedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Wrapper>
    );
};

export default SkillAssessmentPanel;
