import { useState } from 'react';
import { Plus, Mic, Book, Bot, Zap, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const QuickActions = ({ onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, updateSettings } = useSettings();

    const actions = [
        { id: 'practice', label: 'Practice', icon: Mic, color: 'bg-blue-500' },
        { id: 'journal', label: 'Journal', icon: Book, color: 'bg-emerald-500' },
        { id: 'coach', label: 'Ask Coach', icon: Bot, color: 'bg-purple-500' },
        { id: 'warmup', label: 'Warm Up', icon: Zap, color: 'bg-orange-500' },
        {
            id: 'listen',
            label: settings.listenMode ? 'Stop Listening' : 'Listen Mode',
            icon: settings.listenMode ? VolumeX : Volume2,
            color: settings.listenMode ? 'bg-red-500' : 'bg-indigo-500',
            isToggle: true
        },
    ];

    const handleAction = (action) => {
        if (action.isToggle) {
            if (action.id === 'listen') {
                updateSettings({ ...settings, listenMode: !settings.listenMode });
            }
        } else {
            onAction && onAction(action.id);
        }
        setIsOpen(false);
    };

    return (
        <div
            className="fixed bottom-28 right-6 z-[100]"
            role="region"
            aria-label="Quick Actions Menu"
        >
            {/* Menu Items */}
            <div
                id="quick-actions-menu"
                className={`flex flex-col gap-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                aria-hidden={!isOpen}
            >
                {actions.map((action, index) => (
                    <button
                        key={action.id}
                        onClick={() => handleAction(action)}
                        tabIndex={isOpen ? 0 : -1}
                        aria-hidden={!isOpen}
                        className="flex items-center justify-end gap-3 group focus-visible:outline-none"
                        style={{ transitionDelay: `${index * 50}ms` }}
                        aria-label={action.label}
                    >
                        <span
                            className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                            aria-hidden="true"
                        >
                            {action.label}
                        </span>
                        <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-white ${action.color}`}>
                            <action.icon size={20} />
                        </div>
                    </button>
                ))}
            </div>

            {/* Main FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:ring-4 focus-visible:ring-teal-500/50 focus-visible:outline-none ${isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30'}`}
                aria-label={isOpen ? "Close Quick Actions" : "Open Quick Actions"}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls="quick-actions-menu"
            >
                <Plus size={28} />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1]"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default QuickActions;
