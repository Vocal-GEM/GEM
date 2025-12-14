/**
 * AdaptiveCurriculumPanel.jsx
 * 
 * UI for viewing and interacting with personalized training curriculum.
 * Shows 4-week plan, today's session, and progress tracking.
 */

import { useState, useEffect } from 'react';
import {
    Calendar, Clock, CheckCircle, Circle, ChevronRight,
    RefreshCw, Zap
} from 'lucide-react';
import AdaptiveCurriculumService from '../../services/AdaptiveCurriculumService';

const AdaptiveCurriculumPanel = ({ onStartSession, embedded = false, onClose }) => {
    const [curriculum, setCurriculum] = useState(null);
    const [todaySession, setTodaySession] = useState(null);
    const [progress, setProgress] = useState(null);
    const [expandedWeek, setExpandedWeek] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadCurriculum();
    }, []);

    const loadCurriculum = () => {
        const curr = AdaptiveCurriculumService.getCurrentCurriculum();
        setCurriculum(curr);
        setTodaySession(AdaptiveCurriculumService.getTodaySession());
        setProgress(AdaptiveCurriculumService.getCurriculumProgress());
        setExpandedWeek(curr?.currentWeek || 0);
    };

    const regenerateCurriculum = async () => {
        setIsGenerating(true);
        AdaptiveCurriculumService.clearCurriculum();
        await new Promise(r => setTimeout(r, 1000));
        AdaptiveCurriculumService.generateAdaptiveCurriculum();
        loadCurriculum();
        setIsGenerating(false);
    };

    const Wrapper = embedded ? 'div' : 'div';
    const wrapperClass = embedded
        ? 'bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden h-full'
        : 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';

    if (!curriculum) {
        return (
            <Wrapper className={wrapperClass}>
                <div className="p-6 text-center">
                    <RefreshCw className="mx-auto text-slate-500 animate-spin mb-4" size={32} />
                    <p className="text-slate-400">Loading curriculum...</p>
                </div>
            </Wrapper>
        );
    }

    return (
        <Wrapper className={wrapperClass}>
            <div className={`${embedded ? 'h-full flex flex-col' : 'w-full max-w-2xl max-h-[85vh] bg-slate-900 rounded-2xl border border-slate-700'} overflow-hidden`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <Calendar className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white">Your Training Plan</h2>
                            <p className="text-xs text-slate-400">
                                {curriculum.level} Level • 4-Week Program
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={regenerateCurriculum}
                        disabled={isGenerating}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Generate new curriculum"
                    >
                        <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Progress Bar */}
                {progress && (
                    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">Overall Progress</span>
                            <span className="text-sm font-bold text-purple-400">{progress.percentComplete}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                style={{ width: `${progress.percentComplete}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>{progress.daysComplete}/{progress.totalDays} days</span>
                            <span>{progress.exercisesComplete}/{progress.totalExercises} exercises</span>
                        </div>
                    </div>
                )}

                {/* Today's Session Highlight */}
                {todaySession && !todaySession.isRestDay && (
                    <div className="p-4 bg-gradient-to-r from-teal-500/10 to-purple-500/10 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Zap className="text-teal-400" size={16} />
                                <span className="font-bold text-white">Today&apos;s Session</span>
                            </div>
                            <span className="text-xs text-slate-400">
                                <Clock size={12} className="inline mr-1" />
                                {todaySession.targetMinutes} min
                            </span>
                        </div>
                        <p className="text-sm text-teal-300 mb-3">{todaySession.focus}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {todaySession.exercises?.slice(0, 3).map(ex => (
                                <span key={ex.id} className="px-2 py-1 bg-slate-800/50 rounded-lg text-xs text-slate-300">
                                    {ex.title}
                                </span>
                            ))}
                            {todaySession.exercises?.length > 3 && (
                                <span className="px-2 py-1 text-xs text-slate-500">
                                    +{todaySession.exercises.length - 3} more
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => onStartSession?.(todaySession)}
                            className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-400 hover:to-purple-400 text-white font-bold rounded-xl transition-colors"
                        >
                            Start Today&apos;s Session
                        </button>
                    </div>
                )}

                {/* Weekly Plans */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {curriculum.weeks.map((week, weekIdx) => (
                        <div
                            key={weekIdx}
                            className={`rounded-xl border transition-all ${weekIdx === curriculum.currentWeek
                                ? 'border-purple-500/50 bg-purple-500/5'
                                : 'border-slate-700 bg-slate-800/30'
                                }`}
                        >
                            {/* Week Header */}
                            <button
                                onClick={() => setExpandedWeek(expandedWeek === weekIdx ? -1 : weekIdx)}
                                className="w-full p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${week.completedDays >= 6
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : weekIdx === curriculum.currentWeek
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {week.completedDays >= 6 ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <span className="text-sm font-bold">{weekIdx + 1}</span>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">
                                            Week {weekIdx + 1}: {week.theme.title}
                                        </div>
                                        <div className="text-xs text-slate-400">{week.theme.description}</div>
                                    </div>
                                </div>
                                <ChevronRight
                                    size={18}
                                    className={`text-slate-400 transition-transform ${expandedWeek === weekIdx ? 'rotate-90' : ''}`}
                                />
                            </button>

                            {/* Expanded Days */}
                            {expandedWeek === weekIdx && (
                                <div className="px-4 pb-4 space-y-2">
                                    {week.days.map((day, dayIdx) => (
                                        <div
                                            key={dayIdx}
                                            className={`flex items-center gap-3 p-3 rounded-lg ${day.isRestDay
                                                ? 'bg-slate-800/30'
                                                : day.completed
                                                    ? 'bg-emerald-500/10'
                                                    : 'bg-slate-800/50'
                                                }`}
                                        >
                                            {day.completed ? (
                                                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                                            ) : day.isRestDay ? (
                                                <Circle size={16} className="text-slate-600 shrink-0" />
                                            ) : (
                                                <Circle size={16} className="text-slate-500 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-medium ${day.completed ? 'text-emerald-300' : 'text-slate-300'
                                                        }`}>
                                                        {day.day}
                                                    </span>
                                                    {!day.isRestDay && (
                                                        <span className="text-xs text-slate-500">
                                                            {day.targetMinutes} min
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">
                                                    {day.isRestDay ? 'Rest Day' : day.focus}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {!embedded && (
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </Wrapper>
    );
};

export default AdaptiveCurriculumPanel;
