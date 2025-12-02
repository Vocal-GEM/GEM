import React, { useState, useRef, useEffect } from 'react';
import { Music, Play } from 'lucide-react';

const PitchPipe = ({ audioEngine }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [freq, setFreq] = useState(220);

    // Update frequency of playing tone when freq changes
    useEffect(() => {
        if (isPlaying && audioEngine.current) {
            audioEngine.current.updateToneFrequency(freq);
        }
    }, [freq, isPlaying]);

    // Play a short burst (click)
    const playOnce = () => {
        if (audioEngine.current) {
            audioEngine.current.playFeedbackTone(freq);
            setIsPlaying(true);
            setTimeout(() => setIsPlaying(false), 500);
        }
    };

    // Start continuous sustained tone (hold)
    const startPlaying = () => {
        if (audioEngine.current) {
            setIsPlaying(true);
            audioEngine.current.startSustainedTone(freq, 'sine', 0.15);
        }
    };

    const stopPlaying = () => {
        if (audioEngine.current) {
            audioEngine.current.stopSustainedTone();
        }
        setIsPlaying(false);
    };

    const presets = [
        { label: 'C3', freq: 131, desc: 'Low Masc' },
        { label: 'A3', freq: 220, desc: 'Masc Ref' },
        { label: 'C4', freq: 262, desc: 'Middle C' },
        { label: 'A4', freq: 440, desc: 'Concert A' },
        { label: 'C5', freq: 523, desc: 'Fem Ref' },
    ];

    return (
        <div className="glass-panel p-4 rounded-xl mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300"><Music className="w-5 h-5" /></div>
                    <div>
                        <div className="text-xs font-bold text-white">Reference Tone</div>
                        <div className="text-[10px] text-slate-400">Hold to play</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={freq}
                        onChange={(e) => setFreq(parseInt(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none text-center"
                        min="50"
                        max="1000"
                    />
                    <span className="text-[10px] text-slate-400">Hz</span>
                    <button
                        onMouseDown={startPlaying}
                        onMouseUp={stopPlaying}
                        onMouseLeave={stopPlaying}
                        onTouchStart={startPlaying}
                        onTouchEnd={stopPlaying}
                        className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-indigo-500 text-white scale-95' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <Play className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex gap-2 flex-wrap">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => setFreq(preset.freq)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                            freq === preset.freq
                                ? 'bg-indigo-500 text-white font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title={preset.desc}
                    >
                        <div className="font-mono font-bold">{preset.label}</div>
                        <div className="text-[9px] opacity-70">{preset.freq}Hz</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PitchPipe;
