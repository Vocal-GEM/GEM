import React from 'react';
import { Mic, LineChart, Target, BookOpen, Zap, Award } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { lightTap } from '../../services/HapticService';

const QuickActionsWidget = () => {
    const { navigate } = useNavigation();

    const actions = [
        {
            id: 'practice',
            label: 'Practice',
            icon: <Mic size={24} />,
            color: 'from-teal-500 to-emerald-500',
            target: 'practice'
        },
        {
            id: 'analysis',
            label: 'Analyze',
            icon: <LineChart size={24} />,
            color: 'from-blue-500 to-cyan-500',
            target: 'analysis'
        },
        {
            id: 'training',
            label: 'Training',
            icon: <Target size={24} />,
            color: 'from-purple-500 to-pink-500',
            target: 'training'
        },
        {
            id: 'coach',
            label: 'Coach',
            icon: <Zap size={24} />,
            color: 'from-amber-500 to-orange-500',
            target: 'coach'
        }
    ];

    const handleAction = (target) => {
        lightTap();
        navigate(target);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-400 mb-3">Quick Actions</h3>

            <div className="grid grid-cols-4 gap-3">
                {actions.map(action => (
                    <button
                        key={action.id}
                        onClick={() => handleAction(action.target)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all hover:scale-105"
                    >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center text-white`}>
                            {action.icon}
                        </div>
                        <span className="text-xs text-slate-400">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActionsWidget;
