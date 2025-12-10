import React, { useState } from 'react';
import { Layers } from 'lucide-react';

const SyllableStacker = ({ onComplete }) => {
    const [mode, setMode] = useState('robot'); // 'robot' or 'elastic'

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Syllable Separation</h2>
                <p className="text-slate-400">
                    To break the habit of "Mumbling/Slurring", we first go to the extreme: **Robot Mode**.
                    Then we add **Elasticity** back in.
                </p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setMode('robot')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${mode === 'robot'
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                >
                    🤖 Robot Mode
                </button>
                <button
                    onClick={() => setMode('elastic')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${mode === 'elastic'
                            ? 'bg-pink-600 text-white shadow-lg scale-105'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                >
                    🧶 Elastic Mode
                </button>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 min-h-[300px] flex flex-col items-center justify-center text-center">
                {mode === 'robot' ? (
                    <div className="animate-in zoom-in duration-300">
                        <h3 className="text-4xl font-mono text-blue-300 mb-4 tracking-widest">
                            I. AM. A. RO. BOT.
                        </h3>
                        <p className="text-slate-300 max-w-md mx-auto mb-8">
                            Read this sentence. **Completely detach** every syllable. Even the tiny words.
                            <br /><br />
                            "The. Sun. Light. Strikes. Rain. Drops. In. The. Air."
                        </p>
                        <div className="text-xs text-blue-500 font-bold uppercase tracking-widest">
                            Goal: Zero Connection. Pure Diction.
                        </div>
                    </div>
                ) : (
                    <div className="animate-in zoom-in duration-300">
                        <h3 className="text-4xl font-serif italic text-pink-300 mb-4">
                            I... Am... A... Human...
                        </h3>
                        <p className="text-slate-300 max-w-md mx-auto mb-8">
                            Now, keep the separation, but **stretch** the vowel of each syllable.
                            Don't blend them! Just make each brick softer.
                            <br /><br />
                            "Theeee Suuuun Liiiight Striiiiikes Raaaain Droooops."
                        </p>
                        <div className="text-xs text-pink-500 font-bold uppercase tracking-widest">
                            Goal: Defined Edges, Soft Centers.
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Feel The Difference
                </button>
            </div>
        </div>
    );
};

export default SyllableStacker;
