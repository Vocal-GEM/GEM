import React, { useState, useEffect } from 'react';
import { Play, Square, Volume2, Settings } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

const TargetVoicePlayer = ({ text, gender = 'fem', label = "Target Voice" }) => {
    const { speak, cancel, speaking, supported, getBestVoice, voices } = useTTS();
    const [rate, setRate] = useState(1.0);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Set initial voice based on gender
    useEffect(() => {
        if (voices.length > 0 && !selectedVoice) {
            const best = getBestVoice(gender);
            setSelectedVoice(best);
        }
    }, [voices, gender, getBestVoice, selectedVoice]);

    const handlePlay = () => {
        if (speaking) {
            cancel();
        } else {
            speak(text, {
                voice: selectedVoice,
                rate: rate
            });
        }
    };

    if (!supported) return null;

    return (
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-4">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold">
                    <Volume2 className="w-4 h-4 text-pink-400" />
                    {label}
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Settings className="w-3 h-3" />
                </button>
            </div>

            <div className="flex gap-3 items-center">
                <button
                    onClick={handlePlay}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${speaking
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/20'
                        }`}
                >
                    {speaking ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <div className="flex-1">
                    <div className="text-white font-medium text-sm line-clamp-2 italic">
                        "{text}"
                    </div>
                </div>
            </div>

            {showSettings && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase font-bold">Voice</label>
                        <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                                const voice = voices.find(v => v.name === e.target.value);
                                setSelectedVoice(voice);
                            }}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                        >
                            {voices.map(v => (
                                <option key={v.name} value={v.name}>
                                    {v.name} ({v.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <label className="text-slate-500 uppercase font-bold">Speed</label>
                            <span className="text-slate-400">{rate}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TargetVoicePlayer;
