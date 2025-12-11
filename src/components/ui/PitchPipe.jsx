import { useState, useRef } from 'react';
import { Music, Play } from 'lucide-react';

const PitchPipe = ({ audioEngine }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [freq, setFreq] = useState(220);

    const intervalRef = useRef(null);

    // Play a short burst (click) - Unused
    // const playOnce = () => { ... }

    // Start continuous play (hold)
    const startPlaying = () => {
        if (audioEngine.current) {
            setIsPlaying(true);
            // Play initial tone
            audioEngine.current.playFeedbackTone(freq);
            // Loop it for continuous effect (since ToneEngine plays short bursts usually)
            // But better: modify ToneEngine or just re-trigger
            // For now, let's assume playFeedbackTone has a fixed duration. 
            // We'll trigger it repeatedly or if we can, update the engine.
            // Let's just trigger it every 200ms to sustain it
            intervalRef.current = setInterval(() => {
                audioEngine.current.playFeedbackTone(freq);
            }, 100);
        }
    };

    const stopPlaying = () => {
        setIsPlaying(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return (
        <div className="glass-panel p-3 rounded-xl mb-4 flex items-center justify-between">
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
                />
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
    );
};

export default PitchPipe;
