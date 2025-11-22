import React, { useState } from 'react';

const PitchPipe = ({ audioEngine }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [freq, setFreq] = useState(220);

    const play = () => {
        if (audioEngine.current) {
            audioEngine.current.playFeedbackTone(freq);
            setIsPlaying(true);
            setTimeout(() => setIsPlaying(false), 500);
        }
    };

    return (
        <div className="glass-panel p-3 rounded-xl mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300"><i data-lucide="music" className="w-5 h-5"></i></div>
                <div>
                    <div className="text-xs font-bold text-white">Reference Tone</div>
                    <div className="text-[10px] text-slate-400">Hear your target pitch</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={freq}
                    onChange={(e) => setFreq(parseInt(e.target.value))}
                    className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none text-center"
                />
                <button onClick={play} className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-indigo-500 text-white scale-95' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    <i data-lucide="play" className="w-4 h-4"></i>
                </button>
            </div>
        </div>
    );
};

export default PitchPipe;
