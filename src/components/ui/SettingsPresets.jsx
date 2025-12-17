import { useState } from 'react';
import { Zap, GraduationCap, Award, Check, Info } from 'lucide-react';

const PRESETS = {
    beginner: {
        label: 'Beginner',
        description: 'Simplified interface with guided assistance',
        icon: GraduationCap,
        color: 'green',
        settings: {
            colorBlindMode: false,
            // Visual feedback
            showPitchGuide: true,
            showResonanceGuide: true,
            showCoachFeedback: true,
            // Biofeedback
            hapticFeedback: true,
            toneFeedback: false,
            visualFeedback: true,
            // UI preferences
            showTutorials: true,
            autoPlayExercises: true,
            // Dashboard
            dashboardComplexity: 'simple'
        }
    },
    intermediate: {
        label: 'Intermediate',
        description: 'Balanced features for developing users',
        icon: Zap,
        color: 'blue',
        settings: {
            colorBlindMode: false,
            // Visual feedback
            showPitchGuide: true,
            showResonanceGuide: true,
            showCoachFeedback: true,
            // Biofeedback
            hapticFeedback: true,
            toneFeedback: true,
            visualFeedback: true,
            // UI preferences
            showTutorials: false,
            autoPlayExercises: false,
            // Dashboard
            dashboardComplexity: 'balanced'
        }
    },
    advanced: {
        label: 'Advanced',
        description: 'Full control and detailed analytics',
        icon: Award,
        color: 'purple',
        settings: {
            colorBlindMode: false,
            // Visual feedback
            showPitchGuide: false,
            showResonanceGuide: false,
            showCoachFeedback: false,
            // Biofeedback
            hapticFeedback: false,
            toneFeedback: false,
            visualFeedback: true,
            // UI preferences
            showTutorials: false,
            autoPlayExercises: false,
            // Dashboard
            dashboardComplexity: 'advanced'
        }
    }
};

const SettingsPresets = ({ currentSettings, onApplyPreset }) => {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSelectPreset = (presetKey) => {
        setSelectedPreset(presetKey);
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        if (selectedPreset) {
            onApplyPreset(PRESETS[selectedPreset].settings);
            setShowConfirm(false);
            setSelectedPreset(null);
        }
    };

    const getColorClasses = (color) => {
        const colors = {
            green: {
                bg: 'bg-green-500/10',
                border: 'border-green-500/30',
                text: 'text-green-400',
                hover: 'hover:border-green-500/50',
                button: 'bg-green-500'
            },
            blue: {
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/30',
                text: 'text-blue-400',
                hover: 'hover:border-blue-500/50',
                button: 'bg-blue-500'
            },
            purple: {
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/30',
                text: 'text-purple-400',
                hover: 'hover:border-purple-500/50',
                button: 'bg-purple-500'
            }
        };
        return colors[color];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-blue-300 mb-1">Quick Configuration</h4>
                    <p className="text-xs text-blue-200/80">
                        Choose a preset to quickly configure the app based on your experience level. You can always customize individual settings later.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(PRESETS).map(([key, preset]) => {
                    const colors = getColorClasses(preset.color);
                    const Icon = preset.icon;

                    return (
                        <button
                            key={key}
                            onClick={() => handleSelectPreset(key)}
                            className={`p-6 rounded-2xl border-2 transition-all text-left ${colors.bg} ${colors.border} ${colors.hover} hover:scale-105`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-3 rounded-xl ${colors.bg}`}>
                                    <Icon size={24} className={colors.text} />
                                </div>
                                <h3 className={`text-lg font-bold ${colors.text}`}>{preset.label}</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">{preset.description}</p>
                            <div className="text-xs text-slate-500 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Check size={12} className={colors.text} />
                                    <span>{preset.settings.showTutorials ? 'Guided tutorials' : 'Self-directed'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={12} className={colors.text} />
                                    <span>{preset.settings.hapticFeedback ? 'Haptic feedback' : 'Visual only'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={12} className={colors.text} />
                                    <span>{preset.settings.showCoachFeedback ? 'Coach guidance' : 'Independent practice'}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            {showConfirm && selectedPreset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Apply {PRESETS[selectedPreset].label} Preset?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            This will update multiple settings to match the {PRESETS[selectedPreset].label.toLowerCase()} configuration. Your current settings will be overwritten.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-3 rounded-xl font-bold text-white ${getColorClasses(PRESETS[selectedPreset].color).button} hover:opacity-90 transition-opacity`}
                            >
                                Apply Preset
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    setSelectedPreset(null);
                                }}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPresets;
