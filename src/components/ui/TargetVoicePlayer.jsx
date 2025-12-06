import React, { useState } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';
import { textToSpeechService } from '../../services/TextToSpeechService';

const TargetVoicePlayer = ({ text, label = "Target Voice" }) => {
    const [speaking, setSpeaking] = useState(false);
    const [rate, setRate] = useState(1.0);

    const handlePlay = async () => {
        if (speaking) {
            textToSpeechService.stop();
            setSpeaking(false);
        } else {
            setSpeaking(true);
            try {
                await textToSpeechService.speak(text, {
                    rate: rate,
                    onEnd: () => setSpeaking(false),
                    onStart: () => setSpeaking(true)
                });
            } catch (error) {
                console.error("TTS Error:", error);
                setSpeaking(false);
            }
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-white/10 p-4">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold">
                    <Volume2 className="w-4 h-4 text-pink-400" />
                    {label}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Speed</span>
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>
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
                        &quot;{text}&quot;
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TargetVoicePlayer;
