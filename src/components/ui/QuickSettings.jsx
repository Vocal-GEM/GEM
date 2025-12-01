import React from 'react';
import { X, Moon, Sun, Zap, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const QuickSettings = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-80 h-full bg-slate-900 border-l border-white/10 shadow-2xl p-6 animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-white">Quick Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto">
                    {/* Theme */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appearance</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => updateSettings({ ...settings, theme: 'dark' })}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${settings.theme === 'dark' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            >
                                <Moon size={18} /> Dark
                            </button>
                            <button
                                onClick={() => updateSettings({ ...settings, theme: 'light' })}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${settings.theme === 'light' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            >
                                <Sun size={18} /> Light
                            </button>
                        </div>
                    </div>

                    {/* Performance */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</label>
                        <div className="flex flex-col gap-2">
                            {['low', 'medium', 'high'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => updateSettings({ ...settings, performanceMode: mode })}
                                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${settings.performanceMode === mode ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                >
                                    <span className="capitalize font-medium">{mode} Power</span>
                                    {settings.performanceMode === mode && <Zap size={16} />}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500 px-1">
                            Adjusts visual effects and analysis frequency to save battery.
                        </p>
                    </div>

                    {/* Privacy */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Privacy</label>
                        <button
                            onClick={() => updateSettings({ ...settings, analyticsEnabled: !settings.analyticsEnabled })}
                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${settings.analyticsEnabled ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                        >
                            <span className="font-medium">Share Usage Data</span>
                            {settings.analyticsEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('openSettings')); }}
                        className="w-full py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Advanced Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickSettings;
