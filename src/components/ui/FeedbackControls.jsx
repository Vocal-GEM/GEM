import { useState, useRef, useEffect } from 'react';
import { Settings, Vibrate, Volume2, ArrowUp, ArrowDown, ArrowUpDown, X } from 'lucide-react';

const FeedbackControls = ({ settings, setSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`p-2 rounded-lg transition-colors ${settings.haptic || settings.tone
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                title="Feedback Settings"
            >
                <Settings size={16} />
            </button>
        );
    }

    return (
        <div ref={menuRef} className="absolute top-12 right-0 z-50 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl w-64 animate-in fade-in zoom-in-95 origin-top-right">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Feedback Config</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={14} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Haptic Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Vibrate size={14} className={settings.haptic ? "text-green-400" : "text-slate-500"} />
                        <span className="text-sm text-slate-300">Vibration</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.haptic}
                            onChange={(e) => setSettings(s => ({ ...s, haptic: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>

                {/* Tone Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Volume2 size={14} className={settings.tone ? "text-blue-400" : "text-slate-500"} />
                        <span className="text-sm text-slate-300">Guide Tone</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.tone}
                            onChange={(e) => setSettings(s => ({ ...s, tone: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>

                {/* Trigger Condition */}
                <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Trigger When</span>
                    <div className="grid grid-cols-3 gap-1">
                        <button
                            onClick={() => setSettings(s => ({ ...s, condition: 'high' }))}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${settings.condition === 'high' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                        >
                            <ArrowUp size={12} />
                            <span className="text-[10px]">High</span>
                        </button>
                        <button
                            onClick={() => setSettings(s => ({ ...s, condition: 'low' }))}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${settings.condition === 'low' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                        >
                            <ArrowDown size={12} />
                            <span className="text-[10px]">Low</span>
                        </button>
                        <button
                            onClick={() => setSettings(s => ({ ...s, condition: 'both' }))}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${settings.condition === 'both' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                        >
                            <ArrowUpDown size={12} />
                            <span className="text-[10px]">Both</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackControls;
