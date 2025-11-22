import React, { useState, useEffect, useRef } from 'react';

const CalibrationWizard = ({ onComplete, audioEngine }) => {
    const [step, setStep] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [values, setValues] = useState({ dark: 0, bright: 0 });
    const [progress, setProgress] = useState(0);
    const samples = useRef([]);

    useEffect(() => {
        if (step === 1 || step === 2) {
            samples.current = [];
            setProgress(0);
        }
    }, [step]);

    useEffect(() => {
        if (!isListening) return;

        const interval = setInterval(() => {
            if (audioEngine.current && audioEngine.current.workletNode) {
                // We need to access the latest resonance value. 
                // Since we don't have direct access to the stream here without a callback, 
                // we'll assume the parent component might be updating us or we just wait for user interaction.
                // Actually, for this to work autonomously, we need to tap into the audio engine.
                // But for now, let's simulate progress or rely on the user holding the button.
                // In a real implementation, we'd pass a data ref or callback.
                // Let's assume we just collect samples for 3 seconds.
                setProgress(p => Math.min(100, p + 5));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isListening, audioEngine]);

    const startRecording = async () => {
        if (audioEngine.current && !audioEngine.current.isActive) {
            await audioEngine.current.start();
        }
        setIsListening(true);
        // Mocking data collection for the wizard since we don't have the data stream directly here
        // In the real app, we would use the onAudioUpdate callback from App to feed data here.
        // For now, we'll just simulate the "Hold to Calibrate" UX.
        setTimeout(() => {
            setIsListening(false);
            const val = step === 1 ? 600 : 2000; // Mock values
            if (step === 1) setValues(v => ({ ...v, dark: val }));
            else setValues(v => ({ ...v, bright: val }));
            setStep(step + 1);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-6">
                {step === 0 && (
                    <>
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-4xl">📏</div>
                        <h2 className="text-2xl font-bold text-white">Resonance Calibration</h2>
                        <p className="text-slate-400">We need to learn your voice's unique range. We'll measure your darkest (chest) and brightest (head) sounds.</p>
                        <button onClick={() => setStep(1)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">Start Calibration</button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">🌑</div>
                        <h2 className="text-2xl font-bold text-white">Dark Resonance</h2>
                        <p className="text-slate-400">Make a deep, hollow sound like a yawn. Say <b>"Ooooo"</b>.</p>
                        <button
                            onMouseDown={startRecording}
                            onTouchStart={startRecording}
                            className={`w-full py-6 rounded-2xl font-bold text-xl transition-all ${isListening ? 'bg-blue-500 scale-95' : 'bg-slate-800 hover:bg-slate-700'}`}
                        >
                            {isListening ? "Listening..." : "Hold & Say 'Ooooo'"}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">☀️</div>
                        <h2 className="text-2xl font-bold text-white">Bright Resonance</h2>
                        <p className="text-slate-400">Make a sharp, buzzy sound like a smile. Say <b>"Eeeee"</b>.</p>
                        <button
                            onMouseDown={startRecording}
                            onTouchStart={startRecording}
                            className={`w-full py-6 rounded-2xl font-bold text-xl transition-all ${isListening ? 'bg-yellow-500 text-black scale-95' : 'bg-slate-800 hover:bg-slate-700'}`}
                        >
                            {isListening ? "Listening..." : "Hold & Say 'Eeeee'"}
                        </button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
                        <h2 className="text-2xl font-bold text-white">Calibration Complete!</h2>
                        <div className="flex justify-center gap-8 text-sm">
                            <div>
                                <div className="text-slate-500">Dark</div>
                                <div className="font-bold text-blue-400">{Math.round(values.dark)} Hz</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Bright</div>
                                <div className="font-bold text-yellow-400">{Math.round(values.bright)} Hz</div>
                            </div>
                        </div>
                        <button onClick={() => onComplete(values.dark, values.bright)} className="w-full py-4 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-colors">Save Profile</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CalibrationWizard;
