import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const ForwardFocusDrill = ({ onClose }) => {
    const { dataRef } = useAudio();
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: 'Find Your Forward Focus',
            instruction: 'Say "Mmm-hmm" like you\'re agreeing with someone. Feel the vibration in your lips and nose.',
            tip: 'This is forward resonance - the key to a brighter, more feminine voice.'
        },
        {
            title: 'Sustain the Hum',
            instruction: 'Hold the "Mmm" sound for 5 seconds. Keep the buzz in your face, not your chest.',
            tip: 'If you feel vibration in your chest, raise your pitch slightly.'
        },
        {
            title: 'Add Vowels',
            instruction: 'Say "Mmm-EEE" smoothly. Keep the same forward placement on the "EEE".',
            tip: 'The vowel should feel like it\'s coming from your face, not your throat.'
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mt-20 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Forward Focus Drill</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="text-7xl text-center mb-4">👄</div>
                        <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                        <p className="text-slate-300 leading-relaxed mb-4">{currentStep.instruction}</p>

                        <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                            <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">💡 Tip</div>
                            <div className="text-sm text-slate-200">{currentStep.tip}</div>
                        </div>
                    </div>

                    {/* Resonance Feedback */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 mb-6">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Live Resonance</div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${Math.min(100, (dataRef.current.resonance || 0) * 100)}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 text-right">
                            {dataRef.current.resonance > 0.7 ? '✨ Bright!' : dataRef.current.resonance > 0.4 ? '👍 Good' : '⬆️ Higher'}
                        </div>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-purple-500 w-8' : i < step ? 'bg-emerald-500' : 'bg-slate-700'
                                    }`}
                            ></div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex-1 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-bold"
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()}
                            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-500/20 transition-all transform active:scale-95"
                        >
                            {step === steps.length - 1 ? 'Complete' : 'Next →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForwardFocusDrill;
