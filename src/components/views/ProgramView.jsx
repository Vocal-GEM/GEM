
import React, { useState } from 'react';
import { useProgram } from '../../hooks/useProgram';
import { CheckCircle, Circle, Lock, PlayCircle, BookOpen, Clock, ChevronRight } from 'lucide-react';

import { useNavigation } from '../../context/NavigationContext';

const ProgramView = ({ onNavigate }) => {
    const { activeProgram, progress, currentDay, completeTask, isTaskComplete, nextDay } = useProgram();
    const { openModal } = useNavigation();
    const [selectedWeekId, setSelectedWeekId] = useState(activeProgram?.weeks[Math.min(progress.currentWeek, activeProgram.weeks.length - 1)].id);

    if (!activeProgram) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold mb-4">No Active Program</h2>
                <p className="text-slate-400 mb-6">Visit the Coach tab to enroll in a program.</p>
                <button
                    onClick={() => onNavigate('coach')}
                    className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all"
                >
                    Go to Coach
                </button>
            </div>
        );
    }

    const currentWeek = activeProgram.weeks.find(w => w.id === selectedWeekId) || activeProgram.weeks[0];
    const isCurrentWeek = activeProgram.weeks.indexOf(currentWeek) === progress.currentWeek;

    // Sort of hacky, assuming days are in order
    const viewingDay = isCurrentWeek
        ? currentWeek.days[progress.currentDay]
        : currentWeek.days[0];

    // Helper to render task icon
    const getTaskIcon = (type) => {
        switch (type) {
            case 'reading': return <BookOpen size={18} className="text-purple-400" />;
            case 'warmup': return <Clock size={18} className="text-orange-400" />;
            case 'drill': return <PlayCircle size={18} className="text-blue-400" />;
            default: return <Circle size={18} className="text-slate-400" />;
        }
    };

    const handleTaskClick = (task) => {
        // If task has a tool link, navigate to it
        if (task.toolId) {
            // Mapping for specific tool routing
            // 'practice' -> view: 'practice', params: { tool: 'pitch' }
            // 'training' -> view: 'training', params: { module: 'shadowing' }
            // 'assessment' -> view: 'assessment' (this might need modal handling) or handle via onNavigate if it supports modals?

            // Actually, onNavigate is likely just (view, params).
            // For assessment, if it's a modal, we might need a different handler or passed prop?
            // But let's assume valid 'views' first.
        }

        // Default behavior for checkbox tasks
        completeTask(task.id);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold">
                    <span>Program</span>
                    <ChevronRight size={14} />
                    <span className="text-blue-400">{activeProgram.title}</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{currentWeek.title}</h1>
                <p className="text-slate-400">{currentWeek.description}</p>
            </header>

            {/* Week Navigation */}
            <div className="flex overflow-x-auto gap-4 mb-8 pb-2 scrollbar-hide">
                {activeProgram.weeks.map((week, idx) => {
                    const isLocked = idx > progress.currentWeek;
                    const isSelected = week.id === selectedWeekId;

                    return (
                        <button
                            key={week.id}
                            onClick={() => !isLocked && setSelectedWeekId(week.id)}
                            className={`flex-shrink-0 px-6 py-3 rounded-xl border flex items-center gap-3 transition-all ${isSelected
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : isLocked
                                    ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            {isLocked ? <Lock size={16} /> : <span className="font-mono font-bold text-xs opacity-50">W{idx + 1}</span>}
                            <span className="font-bold whitespace-nowrap">{week.title.split(':')[0]}</span>
                        </button>
                    );
                })}
            </div>

            {/* Current Day View */}
            <div className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden">
                {isCurrentWeek ? (
                    <>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                    Day {progress.currentDay + 1}
                                </div>
                                <h2 className="text-2xl font-bold text-white">{viewingDay?.title || "Rest Day"}</h2>
                            </div>
                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center border border-white/10">
                                <div className="text-lg font-bold text-blue-400">
                                    {Math.round((progress.completedTasks.filter(t => viewingDay?.tasks.some(vt => vt.id === t)).length / (viewingDay?.tasks.length || 1)) * 100)}%
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {viewingDay?.tasks.map(task => {
                                const completed = isTaskComplete(task.id);
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${completed
                                            ? 'bg-blue-900/20 border-blue-500/30'
                                            : 'bg-slate-900/50 border-white/5 hover:border-blue-500/50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${completed ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                                            }`}>
                                            {completed ? <CheckCircle size={18} /> : getTaskIcon(task.type)}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className={`font-bold transition-colors ${completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                {task.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                                                {task.type}
                                            </p>
                                        </div>

                                        {!completed && (
                                            <div className="px-4 py-2 bg-white/5 rounded-lg text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                Start
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {viewingDay?.tasks.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    <p>No tasks specifically scheduled for today. Enjoy your break!</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-end">
                            <button
                                onClick={nextDay}
                                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                Complete Day <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <Lock size={48} className="mx-auto mb-4 text-slate-700" />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">Future Content Locked</h3>
                        <p className="text-slate-500">Complete previous weeks to unlock this content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramView;
