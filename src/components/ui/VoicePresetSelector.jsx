import React, { useState, useEffect } from 'react';
import { Target, Check, ChevronRight, Info } from 'lucide-react';
import { VOICE_PRESETS, getUserPreset, setUserPreset } from '../../services/VoicePresetsService';

const VoicePresetSelector = ({ onSelect }) => {
    const [selected, setSelected] = useState(null);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const current = getUserPreset();
        if (current) {
            setSelected(current.id);
        }
    }, []);

    const handleSelect = (presetId) => {
        setSelected(presetId);
        const preset = setUserPreset(presetId);
        onSelect?.(preset);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <Target className="text-purple-400" size={24} />
                <h2 className="text-xl font-bold text-white">Voice Target</h2>
            </div>

            <p className="text-slate-400 text-sm mb-6">
                Select a voice profile to get personalized feedback and targets during practice.
            </p>

            <div className="space-y-3">
                {VOICE_PRESETS.map((preset) => (
                    <div key={preset.id}>
                        <button
                            onClick={() => handleSelect(preset.id)}
                            className={`w-full p-4 rounded-xl text-left transition-all ${selected === preset.id
                                    ? 'bg-purple-500/20 border-2 border-purple-500'
                                    : 'bg-slate-800 border-2 border-transparent hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {selected === preset.id && (
                                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                            <Check className="text-white" size={14} />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-white">{preset.name}</h3>
                                        <p className="text-sm text-slate-400">{preset.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpanded(expanded === preset.id ? null : preset.id);
                                    }}
                                    className="p-2 text-slate-400 hover:text-white"
                                >
                                    <Info size={18} />
                                </button>
                            </div>

                            {/* Pitch range indicator */}
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                <span>Pitch: {preset.characteristics.pitchRange.min}-{preset.characteristics.pitchRange.max} Hz</span>
                                <span>•</span>
                                <span>Resonance: {preset.characteristics.resonance}</span>
                            </div>
                        </button>

                        {/* Expanded tips */}
                        {expanded === preset.id && (
                            <div className="mt-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700 animate-in slide-in-from-top-2">
                                <h4 className="text-sm font-bold text-white mb-2">Tips</h4>
                                <ul className="space-y-1">
                                    {preset.tips.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                                            <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-purple-400" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selected && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-emerald-400 text-sm">
                        ✓ Your target voice has been set. Practice features will now use these targets.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VoicePresetSelector;
