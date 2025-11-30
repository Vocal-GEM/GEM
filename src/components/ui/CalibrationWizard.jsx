import React, { useState, useEffect, useRef } from 'react';

const CalibrationWizard = ({ onComplete, onSkip, audioEngine, dataRef }) => {
    const [step, setStep] = useState(0); // 0: Intro, 1: Silence (Noise), 2: Dark, 3: Bright
    const [isListening, setIsListening] = useState(false);
    const [values, setValues] = useState({ dark: 0, bright: 0, noiseFloor: -100, rms: 0 });
    const [progress, setProgress] = useState(0);
    const samples = useRef([]);

    useEffect(() => {
        if (step > 0) {
            samples.current = [];
            setProgress(0);
        }
    }, [step]);

    useEffect(() => {
        if (!isListening) return;

        const interval = setInterval(() => {
            if (dataRef && dataRef.current) {
                const { resonance, volume } = dataRef.current;

                // Collect samples based on step
                if (step === 1) { // Silence / Noise Floor
                    // For noise floor, we want volume in dB (approx)
                    // volume is 0-1 RMS usually. 20*log10(rms)
                    const db = volume > 0.00001 ? 20 * Math.log10(volume) : -100;
                    samples.current.push(db);
                } else if (step === 2 || step === 3) { // Resonance
                    if (volume > 0.01 && resonance > 0) { // Only collect if speaking
                        samples.current.push(resonance);
                    }
                }

                setProgress(p => Math.min(100, p + (step === 1 ? 2 : 4))); // Faster for silence
            } else {
                // Fallback simulation if no dataRef (dev mode)
                setProgress(p => Math.min(100, p + 2));
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isListening, dataRef, step]);

    // Auto-advance for silence step
    useEffect(() => {
        if (step === 1 && isListening && progress >= 100) {
            finishStep();
        }
    }, [step, isListening, progress]);

    const startRecording = async () => {
        if (audioEngine.current && !audioEngine.current.isActive) {
            await audioEngine.current.start();
        }
        setIsListening(true);
    };

    const finishStep = () => {
        setIsListening(false);

        // Process samples
        if (samples.current.length > 0) {
            const sum = samples.current.reduce((a, b) => a + b, 0);
            const avg = sum / samples.current.length;

            if (step === 1) {
                setValues(v => ({ ...v, noiseFloor: avg }));
                setStep(2);
            } else if (step === 2) {
                setValues(v => ({ ...v, dark: avg }));
                setStep(3);
            } else if (step === 3) {
                const finalValues = { ...values, bright: avg };
                setValues(finalValues);
                onComplete(finalValues); // Pass full object including noiseFloor
            }
        } else {
            // Fallback if no samples (e.g. mic issue)
            if (step === 1) setStep(2);
            else if (step === 2) setStep(3);
            else onComplete(values);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-6">
                {step === 0 && (
                    <>
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-4xl">📏</div>
                        <h2 className="text-2xl font-bold text-white">Resonance Calibration</h2>
                        <p className="text-slate-400">We'll measure your environment and voice range to give you accurate feedback.</p>
                        <button onClick={() => { setStep(1); startRecording(); }} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">Start Calibration</button>
                        <button onClick={onSkip} className="w-full py-3 bg-transparent text-slate-400 font-medium rounded-xl hover:text-white hover:bg-white/5 transition-colors">Skip for now</button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">🤫</div>
                        <h2 className="text-2xl font-bold text-white">Measuring Noise...</h2>
                        <p className="text-slate-400">Please stay silent for a moment so we can check background noise.</p>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${progress}%` }} />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">🌑</div>
                        <h2 className="text-2xl font-bold text-white">Dark Resonance</h2>
                        <p className="text-slate-400">Make a deep, hollow sound like a yawn. Say <b>"Ooooo"</b>.</p>
                        <button
                            onMouseDown={startRecording}
                            onTouchStart={startRecording}
                            onMouseUp={finishStep}
                            onTouchEnd={finishStep}
                            className={`w-full py-6 rounded-2xl font-bold text-xl transition-all ${isListening ? 'bg-blue-500 scale-95' : 'bg-slate-800 hover:bg-slate-700'}`}
                        >
                            {isListening ? "Listening..." : "Hold & Say 'Ooooo'"}
                        </button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">☀️</div>
                        <h2 className="text-2xl font-bold text-white">Bright Resonance</h2>
                        <p className="text-slate-400">Make a sharp, buzzy sound like a smile. Say <b>"Eeeee"</b>.</p>
                        <button
                            onMouseDown={startRecording}
                            onTouchStart={startRecording}
                            onMouseUp={finishStep}
                            onTouchEnd={finishStep}
                            className={`w-full py-6 rounded-2xl font-bold text-xl transition-all ${isListening ? 'bg-yellow-500 text-black scale-95' : 'bg-slate-800 hover:bg-slate-700'}`}
                        >
                            {isListening ? "Listening..." : "Hold & Say 'Eeeee'"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CalibrationWizard;
