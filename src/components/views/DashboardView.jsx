import React from 'react';
import { Activity, Play, Calendar, Trophy, ArrowRight, Mic, Dumbbell, BookOpen } from 'lucide-react';
import VocalHealthPanel from '../dashboard/VocalHealthPanel';
import SmartCoachWidget from '../dashboard/SmartCoachWidget';

const StatCard = ({ label, value, subtext, icon, color }) => (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                {React.cloneElement(icon, { className: color })}
            </div>
            {subtext && <span className="text-xs font-bold text-teal-500 bg-teal-500/10 px-2 py-1 rounded-full">{subtext}</span>}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
    </div>
);

const ActionCard = ({ title, description, onClick, icon, color }) => (
    <button
        onClick={onClick}
        className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800 transition-all group text-left"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(icon, { className: color })}
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
    </button>
);

const DashboardView = ({ onViewChange, onOpenAdaptiveSession }) => {
    return (
        <div className="w-full min-h-screen bg-black p-6 lg:p-12">
            {/* Smart Coach Widget */}
            <SmartCoachWidget onStartSession={onOpenAdaptiveSession} />

            {/* Vocal Health Panel */}
            <VocalHealthPanel />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    label="Current DSI Score"
                    value="1.2"
                    subtext="+0.3"
                    icon={<Activity size={24} />}
                    color="text-teal-400"
                />
                <StatCard
                    label="Day Streak"
                    value="3"
                    icon={<Calendar size={24} />}
                    color="text-purple-400"
                />
                <StatCard
                    label="Practice Time"
                    value="45m"
                    subtext="Today"
                    icon={<Play size={24} />}
                    color="text-blue-400"
                />
                <StatCard
                    label="Exercises"
                    value="12"
                    icon={<Trophy size={24} />}
                    color="text-amber-400"
                />
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-white mb-6">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard
                    title="Training Gym"
                    description="Practice pitch, resonance, and intonation exercises."
                    icon={<Dumbbell size={24} />}
                    color="text-blue-400"
                    onClick={() => onViewChange('training')}
                />
                <ActionCard
                    title="Voice Assessment"
                    description="Take a full assessment to track your progress."
                    icon={<BookOpen size={24} />}
                    color="text-purple-400"
                    onClick={() => onViewChange('assessment')}
                />
                <ActionCard
                    title="Live Analysis"
                    description="Real-time feedback on your speaking voice."
                    icon={<Mic size={24} />}
                    color="text-teal-400"
                    onClick={() => onViewChange('analysis')}
                />
            </div>
        </div>
    );
};

export default DashboardView;
