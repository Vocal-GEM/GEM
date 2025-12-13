import { useState, useEffect } from 'react';
import { Eye, Type, Zap, Volume2, Minus, Plus, RotateCcw } from 'lucide-react';
import {
    getAccessibilitySettings,
    saveAccessibilitySettings,
    DEFAULT_SETTINGS
} from '../../services/AccessibilityService';

const AccessibilityPanel = () => {
    const [settings, setSettings] = useState(getAccessibilitySettings());

    useEffect(() => {
        saveAccessibilitySettings(settings);
    }, [settings]);

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const adjustFontSize = (delta) => {
        setSettings(prev => ({
            ...prev,
            fontSize: Math.max(75, Math.min(150, prev.fontSize + delta))
        }));
    };

    const resetSettings = () => {
        setSettings({ ...DEFAULT_SETTINGS });
    };

    const options = [
        {
            id: 'highContrast',
            label: 'High Contrast',
            description: 'Increase contrast for better visibility',
            icon: <Eye size={20} />
        },
        {
            id: 'largeText',
            label: 'Large Text',
            description: 'Increase base text size',
            icon: <Type size={20} />
        },
        {
            id: 'reducedMotion',
            label: 'Reduce Motion',
            description: 'Minimize animations and transitions',
            icon: <Zap size={20} />
        },
        {
            id: 'screenReaderMode',
            label: 'Screen Reader Mode',
            description: 'Optimize for screen readers',
            icon: <Volume2 size={20} />
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Accessibility</h2>
                <button
                    onClick={resetSettings}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                >
                    <RotateCcw size={14} /> Reset
                </button>
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
                {options.map(option => (
                    <div
                        key={option.id}
                        className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-slate-400">{option.icon}</div>
                            <div>
                                <div className="font-medium text-white">{option.label}</div>
                                <div className="text-sm text-slate-400">{option.description}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleSetting(option.id)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings[option.id] ? 'bg-blue-600' : 'bg-slate-600'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[option.id] ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                ))}
            </div>

            {/* Font Size Slider */}
            <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Type size={20} className="text-slate-400" />
                        <span className="font-medium text-white">Font Size</span>
                    </div>
                    <span className="text-sm text-slate-400">{settings.fontSize}%</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => adjustFontSize(-10)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                        <Minus size={16} />
                    </button>

                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${((settings.fontSize - 75) / 75) * 100}%` }}
                        />
                    </div>

                    <button
                        onClick={() => adjustFontSize(10)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl">
                <div className="text-xs text-slate-500 uppercase mb-2">Preview</div>
                <p
                    className="text-white"
                    style={{ fontSize: `${settings.fontSize}%` }}
                >
                    The quick brown fox jumps over the lazy dog.
                </p>
            </div>
        </div>
    );
};

export default AccessibilityPanel;
