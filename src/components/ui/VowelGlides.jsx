import React, { useState, useEffect, useRef } from 'react';
import { Play, Mic, RefreshCw, Layers, ArrowRight } from 'lucide-react';

const VowelGlides = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [isRecording, setIsRecording] = useState(false);

    const steps = [
        {
            vowel: "EE to AA",
            desc: "Start on 'EE'. Slowly morph to 'AA' (as in Cat). Keep the 'EE' ring!",
            visual: "EE → (keep ringing) → AA"
        },
        {
            vowel: "EE to AH",
            desc: "Start on 'EE'. Morph to 'AH'. Don't let the tongue drop completely!",
            visual: "EE → (keep contacts) → AH"
        },
        {
            vowel: "EE to OH",
            desc: "The hardest one. Lips round for 'OH', but tongue stays High/Bright.",
            visual: "EE → (round lips only) → OH"
        }
    ];

    const toggleRecord = () => {
        setIsRecording(!isRecording);
        // In a real app, this would trigger actual recording logic
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Exercise: Vowel Glides</h2>
                <p className="text-slate-400">
                    Practice moving from the "Anchor" vowel (EE) to other vowels without losing the brightness.
                </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center relative overflow-hidden">
                {/* Visual Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500"></div>

                <div className="text-sm text-indigo-400 font-bold uppercase tracking-widest mb-4">
                    Set {step + 1} of {steps.length}
                </div>

                <h3 className="text-3xl font-black text-white mb-4">{steps[step].vowel}</h3>
                <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto">
                    {steps[step].desc}
                </p>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 mb-8 font-mono text-xl text-pink-300">
                    {steps[step].visual}
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={toggleRecord}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-red-600'
                            }`}
                    >
                        <Mic size={24} className="text-white" />
                    </button>

                    <button
                        onClick={() => {
                            if (step < steps.length - 1) setStep(step + 1);
                            else onComplete();
                        }}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg"
                    >
                        {step < steps.length - 1 ? 'Next Vowel' : 'Finish'}
                    </button>
                </div>

                <p className="text-xs text-slate-500 mt-4">
                    {isRecording ? 'Recording... Listen for the "Ring"!' : 'Tap mic to record self-check'}
                </p>
            </div>

            <div className="p-4 bg-indigo-900/20 text-indigo-200 rounded-xl text-sm border border-indigo-500/20 flex gap-2">
                <RefreshCw size={20} className="shrink-0" />
                <span>
                    <strong>Strategy:</strong> If you lose the brightness, stop. Go back to "EE". Re-anchor. Try again.
                </span>
            </div>
        </div>
    );
};

export default VowelGlides;
