/**
 * GoalTrackerPanel.jsx
 * 
 * UI for managing and viewing voice training goals.
 * Shows active goals with progress, allows creating new goals.
 */

import { useState, useEffect } from 'react';
import {
    Target, Plus, CheckCircle, Trash2, RefreshCw,
    ChevronRight, Trophy, Calendar, Clock, Flame
} from 'lucide-react';
import GoalTrackingService from '../../services/GoalTrackingService';

const GoalTrackerPanel = ({ embedded = false, onClose }) => {
    const [activeGoals, setActiveGoals] = useState([]);
    const [completedGoals, setCompletedGoals] = useState([]);
    const [stats, setStats] = useState(null);
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [templates] = useState(GoalTrackingService.getGoalTemplates());
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [targetValue, setTargetValue] = useState('');

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = () => {
        GoalTrackingService.refreshGoalProgress();
        setActiveGoals(GoalTrackingService.getActiveGoals());
        setCompletedGoals(GoalTrackingService.getCompletedGoals());
        setStats(GoalTrackingService.getGoalStats());
    };

    const handleCreateGoal = () => {
        if (!selectedTemplate || !targetValue) return;

        GoalTrackingService.createGoal(selectedTemplate.id, parseInt(targetValue));
        setShowNewGoal(false);
        setSelectedTemplate(null);
        setTargetValue('');
        loadGoals();
    };

    const handleDeleteGoal = (goalId) => {
        if (confirm('Delete this goal?')) {
            GoalTrackingService.deleteGoal(goalId);
            loadGoals();
        }
    };

    const getProgressPercent = (goal) => {
        if (goal.targetValue === 0) return 0;
        return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return 'bg-emerald-500';
        if (percent >= 75) return 'bg-teal-500';
        if (percent >= 50) return 'bg-blue-500';
        if (percent >= 25) return 'bg-amber-500';
        return 'bg-slate-600';
    };

    const Wrapper = embedded ? 'div' : 'div';
    const wrapperClass = embedded
        ? 'h-full flex flex-col'
        : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';

    return (
        <Wrapper className={wrapperClass}>
            <div className={`${embedded ? 'h-full flex flex-col' : 'w-full max-w-md max-h-[85vh] bg-slate-900 rounded-2xl border border-slate-700'} overflow-hidden`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <Target className="text-amber-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white">My Goals</h2>
                            <p className="text-xs text-slate-400">
                                {stats?.activeGoals || 0} active • {stats?.completedGoals || 0} completed
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadGoals}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={() => setShowNewGoal(true)}
                            className="p-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Active Goals */}
                    {activeGoals.length > 0 ? (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Goals</h3>
                            {activeGoals.map(goal => (
                                <div key={goal.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{goal.icon}</span>
                                            <div>
                                                <div className="font-bold text-white text-sm">{goal.title}</div>
                                                <div className="text-xs text-slate-400">{goal.description}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400">Progress</span>
                                            <span className="text-white font-bold">
                                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getProgressColor(getProgressPercent(goal))} transition-all`}
                                                style={{ width: `${getProgressPercent(goal)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        {getProgressPercent(goal)}% complete
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Target className="mx-auto text-slate-600 mb-3" size={40} />
                            <p className="text-slate-400 text-sm">No active goals yet</p>
                            <button
                                onClick={() => setShowNewGoal(true)}
                                className="mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-bold"
                            >
                                Create Your First Goal
                            </button>
                        </div>
                    )}

                    {/* Completed Goals */}
                    {completedGoals.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Trophy size={12} className="text-emerald-400" />
                                Completed
                            </h3>
                            {completedGoals.slice(0, 3).map(goal => (
                                <div key={goal.id} className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                                    <CheckCircle size={16} className="text-emerald-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-emerald-300">{goal.title}</div>
                                        <div className="text-xs text-slate-400">
                                            {goal.targetValue} {goal.unit} achieved
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Goal Modal */}
                {showNewGoal && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10">
                        <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-700 p-4">
                            <h3 className="text-lg font-bold text-white mb-4">Create New Goal</h3>

                            {!selectedTemplate ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {templates.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template)}
                                            className="w-full p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-left flex items-center gap-3 transition-colors"
                                        >
                                            <span className="text-xl">{template.icon}</span>
                                            <div className="flex-1">
                                                <div className="font-bold text-white text-sm">{template.title}</div>
                                                <div className="text-xs text-slate-400">{template.description}</div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-500" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-800/50 rounded-xl flex items-center gap-3">
                                        <span className="text-xl">{selectedTemplate.icon}</span>
                                        <span className="font-bold text-white">{selectedTemplate.title}</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">
                                            Target ({selectedTemplate.unit})
                                        </label>
                                        <input
                                            type="number"
                                            value={targetValue}
                                            onChange={(e) => setTargetValue(e.target.value)}
                                            placeholder={`e.g., ${selectedTemplate.category === 'consistency' ? '5' : '180'}`}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedTemplate(null); setTargetValue(''); }}
                                            className="flex-1 py-3 bg-slate-800 text-white rounded-xl"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCreateGoal}
                                            disabled={!targetValue}
                                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => { setShowNewGoal(false); setSelectedTemplate(null); setTargetValue(''); }}
                                className="w-full mt-3 py-2 text-slate-400 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer (non-embedded) */}
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

export default GoalTrackerPanel;
