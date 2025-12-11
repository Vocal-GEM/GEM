import React, { useState, useRef } from 'react';
import { Volume2, Music, Headphones, Smartphone, Zap } from 'lucide-react';

const TARGET_NOTES = [
    { name: 'C3', freq: 130.81 },
    { name: 'C#3', freq: 138.59 },
    { name: 'D3', freq: 146.83 },
    { name: 'D#3', freq: 155.56 },
    { name: 'E3', freq: 164.81 },
    { name: 'F3', freq: 174.61 },
    { name: 'F#3', freq: 185.00 },
    { name: 'G3', freq: 196.00 },
    { name: 'G#3', freq: 207.65 },
    { name: 'A3', freq: 220.00 },
];

const PitchMemorizer = ({ onComplete }) => {
    const [selectedNote, setSelectedNote] = useState(TARGET_NOTES[2]); // Default D3
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtx = useRef(null);

    const playTone = () => {
        if (isPlaying) return;

        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const osc = audioCtx.current.createOscillator();
        const gainNode = audioCtx.current.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(selectedNote.freq, audioCtx.current.currentTime);

        gainNode.gain.setValueAtTime(0.2, audioCtx.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 3);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.current.destination);

        osc.start();
        setIsPlaying(true);
        osc.stop(audioCtx.current.currentTime + 3);

        setTimeout(() => setIsPlaying(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Memorize Your Starting Pitch</h2>
                <p className="text-slate-400">
                    A feminine voice relies on <strong>how low you don&apos;t go</strong>.
                    Memorize your bottom &quot;safety&quot; note so you can land on it consistently.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tone Generator */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-400" /> Tone Generator
                    </h3>

                    <div>
                        <label className="text-sm text-slate-400 block mb-2">Select Target Note</label>
                        <div className="grid grid-cols-5 gap-2">
                            {TARGET_NOTES.map(note => (
                                <button
                                    key={note.name}
                                    onClick={() => setSelectedNote(note)}
                                    className={`py-2 rounded-lg text-sm font-bold ${selectedNote.name === note.name
                                        ? 'bg-pink-600 text-white'
                                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {note.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center py-4">
                        <button
                            onClick={playTone}
                            disabled={isPlaying}
                            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all ${isPlaying
                                ? 'border-pink-500 bg-pink-900/20 shadow-[0_0_40px_rgba(236,72,153,0.3)] scale-95'
                                : 'border-slate-600 bg-slate-800 hover:border-pink-500 hover:scale-105'
                                }`}
                        >
                            <Volume2 size={32} className={isPlaying ? 'text-pink-400 animate-pulse' : 'text-slate-400'} />
                            <span className="text-xs font-bold text-slate-300">{isPlaying ? 'Playing...' : 'Play Tone'}</span>
                        </button>
                    </div>
                </div>

                {/* Memorization Tips */}
                <div className="space-y-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                        <Music className="text-purple-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-white">Starting Pitch Song</h4>
                            <p className="text-sm text-slate-400">
                                Write a silly song that starts on this note. &quot;This is my starting pitch...&quot;
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                        <Headphones className="text-blue-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-white">Playlist Match</h4>
                            <p className="text-sm text-slate-400">
                                Create a playlist of songs that start in your target key. Listen every morning.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                        <Smartphone className="text-green-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-white">Drone / Tuning Fork</h4>
                            <p className="text-sm text-slate-400">
                                Search YouTube for &quot;{selectedNote.name} Drone&quot; and play it in the background while you work.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Have My Target Note
                </button>
            </div>
        </div>
    );
};

export default PitchMemorizer;
