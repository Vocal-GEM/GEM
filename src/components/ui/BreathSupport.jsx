import { useState } from 'react';
import { Wind, Activity, Zap, Info } from 'lucide-react';

const BreathSupport = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Breath Support</h2>
                <p className="text-slate-400">
                    Your voice is an engine. Air is the fuel. Without consistent fuel, the engine stalls (cracks/strain).
                </p>
            </div>

            {/* Anatomy Visual */}
            <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 p-6 rounded-2xl flex flex-col items-center text-center">
                <Wind className="text-blue-400 mb-4 h-12 w-12 animate-pulse" />
                <h3 className="text-xl font-bold text-white mb-4">The Mechanism</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="p-4 bg-slate-800 rounded-xl">
                        <div className="font-bold text-blue-300">Inhale (Passive)</div>
                        <div className="text-sm text-slate-400">
                            Diaphragm drops <strong>DOWN</strong>.<br />
                            Ribs expand <strong>OUT</strong>.
                        </div>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-xl">
                        <div className="font-bold text-green-300">Exhale (Active)</div>
                        <div className="text-sm text-slate-400">
                            Diaphragm relaxes UP.<br />
                            <strong>Support</strong> means controlling this release smoothly.
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Exercise */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Exercise: The Hiss</h3>

                {step === 0 && (
                    <div className="space-y-4 animate-in fade-in">
                        <p className="text-slate-300">
                            1. Put your hands on your waist (side ribs).<br />
                            2. Take a deep breath. Feel your ribs push your hands <strong>OUT</strong>.<br />
                            3. Hiss (&quot;Ssssss&quot;) loudly and steadily.
                        </p>
                        <button onClick={() => setStep(1)} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white">Start Hiss</button>
                    </div>
                )}

                {step === 1 && (
                    <div className="text-center animate-in zoom-in">
                        <div className="text-4xl font-black text-blue-400 mb-2">SSSSSS...</div>
                        <p className="text-white mb-4">Keep your ribs EXPANDED. Do not let them collapse instantly.</p>
                        <button onClick={() => setStep(2)} className="w-full py-3 bg-slate-700 rounded-xl font-bold text-white">Done</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center animate-in fade-in">
                        <div className="flex justify-center mb-2 text-green-400"><Zap size={32} /></div>
                        <p className="text-slate-300 mb-4">
                            That resistance you felt? That is support.<br />
                            We use that SAME feeling when speaking to keep the voice steady.
                        </p>
                        <button onClick={onComplete} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg">Got it</button>
                    </div>
                )}
            </div>

            <div className="flex gap-2 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl text-sm text-indigo-200">
                <Info className="shrink-0" size={20} />
                <span>
                    <strong>Concept:</strong> &quot;Flow Phonation&quot; means finding the balance where air flows freely without the throat squeezing to stop it.
                </span>
            </div>
        </div>
    );
};

export default BreathSupport;
