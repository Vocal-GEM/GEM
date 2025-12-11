import React, { useState } from 'react';
import { Mic, ArrowRight, ExternalLink, Activity, Info } from 'lucide-react';

const PitchExploration = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [flipNote, setFlipNote] = useState('');
    const [averagePitch, setAveragePitch] = useState('');

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Understanding Your Instrument</h2>
                <div className="flex gap-2 text-sm text-slate-400 items-center">
                    <Activity size={16} />
                    <span>External Tool Required:</span>
                    <a
                        href="https://tunerninja.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-400 hover:underline flex items-center gap-1"
                    >
                        Tuner Ninja <ExternalLink size={12} />
                    </a>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Exercise 1: The Glissando (The Slide)</h3>
                        <ol className="space-y-4 text-slate-300 list-decimal list-inside">
                            <li className="p-2 rounded hover:bg-slate-750">
                                <strong>Warm up first!</strong> Don&apos;t do this cold.
                            </li>
                            <li className="p-2 rounded hover:bg-slate-750">
                                Start on a low comfortable note (around C3).
                            </li>
                            <li className="p-2 rounded hover:bg-slate-750">
                                Slowly slide up (Glissando) like a siren.
                            </li>
                            <li className="p-2 rounded hover:bg-slate-750">
                                <strong>Listen for the &quot;Flip&quot;</strong>: A gear-shift moment where you switch from Chest Voice to Head Voice.
                            </li>
                        </ol>

                        <div className="mt-6 p-4 bg-slate-900 rounded-xl">
                            <label className="block text-sm text-slate-400 mb-2">Where did you feel the flip/break?</label>
                            <div className="flex gap-2">
                                {['Below C4', 'Around C4 (Middle C)', 'Above C4', 'No Flip (Mixed)'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFlipNote(opt)}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${flipNote === opt
                                            ? 'bg-pink-600 text-white'
                                            : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => setStep(2)} className="flex items-center gap-2 text-white bg-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-500">
                            Next: Average Pitch <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Exercise 2: &quot;I Like Pie&quot;</h3>
                        <p className="text-slate-300 mb-4">
                            This determines your average *speaking* pitch.
                        </p>
                        <div className="bg-slate-900 p-6 rounded-xl text-center space-y-4">
                            <div className="text-2xl font-serif text-slate-200 italic">&quot;I like pie. I like pie. I like...&quot;</div>
                            <div className="text-4xl font-black text-white tracking-widest uppercase">PUH</div>
                            <p className="text-slate-400 text-sm">Hold the &quot;Puh&quot; sound and check the tuner.</p>
                        </div>

                        <div className="mt-6 p-4 bg-slate-900 rounded-xl">
                            <label className="block text-sm text-slate-400 mb-2">What note did you land on?</label>
                            <input
                                type="text"
                                placeholder="e.g. A3, G3, B3..."
                                value={averagePitch}
                                onChange={(e) => setAveragePitch(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white">Back</button>
                        <button onClick={() => setStep(3)} className="flex items-center gap-2 text-white bg-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-500">
                            Next: Speaking Range <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Exercise 3: Count to 10</h3>
                        <p className="text-slate-300 mb-4">
                            Count from 1 to 10, starting high and ending low (List Prosody).
                        </p>
                        <div className="h-32 flex items-end justify-between px-8 pb-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl relative">
                            {/* Visual representation of cascading pitch */}
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((h, i) => (
                                <div key={i} className="w-8 bg-indigo-500/50 rounded-t-sm" style={{ height: `${h * 10}%` }}>
                                    <div className="absolute bottom-2 text-xs text-white w-8 text-center">{i + 1}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg flex gap-3 text-sm text-indigo-200">
                            <Info size={18} className="shrink-0" />
                            <div>
                                Check the tuner: What is your high note (1) and your low note (10)?
                                That is your current speaking range.
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Perceived Ranges</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-right font-bold text-pink-400">F3 - F4</div>
                                <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-pink-500 w-[60%] ml-[40%]"></div>
                                </div>
                                <div className="w-24 text-sm text-slate-400">Feminine</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-right font-bold text-blue-400">A2 - A3</div>
                                <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[60%] ml-0"></div>
                                </div>
                                <div className="w-24 text-sm text-slate-400">Masculine</div>
                            </div>
                            <div className="text-center text-xs text-slate-500 italic mt-2">
                                Note the massive overlap (A2-F4). Pitch is not the only gender marker!
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white">Back</button>
                        <button
                            onClick={onComplete}
                            className="flex items-center gap-2 text-slate-900 bg-white px-8 py-3 rounded-xl font-bold hover:bg-slate-200 shadow-lg"
                        >
                            I Know My Instrument <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PitchExploration;
