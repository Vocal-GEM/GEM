import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Mic, Volume2, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

const CalibrationWizard = ({ onComplete, onClose }) => {
    const { dataRef, audioEngineRef, isAudioActive, toggleAudio } = useAudio();
    const [step, setStep] = useState(0); // 0: Intro, 1: Silence, 2: Reference, 3: Done

    const [progress, setProgress] = useState(0);
    const [offset, setOffset] = useState(90);

    const samplesRef = useRef([]);

    useEffect(() => {
        if (!isAudioActive) toggleAudio();
    }, [isAudioActive, toggleAudio]);

    const startSampling = (duration, onFinish) => {
        samplesRef.current = [];
        setProgress(0);
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const p = Math.min(100, (elapsed / duration) * 100);
            setProgress(p);

            // Collect raw RMS (volume)
            if (dataRef.current) {
                samplesRef.current.push(dataRef.current.volume);
            }

            if (elapsed >= duration) {
                clearInterval(interval);
                const avg = samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length;
                onFinish(avg);
            }
        }, 50);
    };

    const handleStep1 = () => {
        // Measure Silence (3s)
        startSampling(3000, (_avgRMS) => {
            // avgRMS is raw 0-1.
            // We don't set offset yet, just store it.
            // setNoiseFloor(avgRMS); // unused
            setStep(2);
        });
    };

    const handleStep2 = () => {
        // Measure Reference Tone (5s) - User says "Ahhh" comfortably
        startSampling(5000, (avgRMS) => {
            // setReferenceLevel(avgRMS); // unused

            // Calculate Offset
            // Assume "Comfortable Sustained Vowel" is ~65 dB SPL at 30cm.
            // 20 * log10(avgRMS) + offset = 65
            // offset = 65 - 20 * log10(avgRMS)

            if (avgRMS > 0) {
                const calculatedOffset = 65 - (20 * Math.log10(avgRMS));
                setOffset(calculatedOffset);

                // Apply to Engine
                if (audioEngineRef.current) {
                    audioEngineRef.current.setCalibrationOffset(calculatedOffset);
                }
            }
            setStep(3);
        });
    };

    const handleFinish = () => {
        if (onComplete) onComplete(offset);
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Mic className="text-teal-400" /> Microphone Calibration
                    </h2>
                    <div className="text-slate-400 text-sm">Step {step + 1} of 4</div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 0 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Volume2 size={40} className="text-teal-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Let&apos;s set your levels</h3>
                            <p className="text-slate-400 mb-6">
                                To ensure accurate clinical measurements, we need to calibrate your microphone sensitivity.
                                Please find a quiet room.
                            </p>
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
                            >
                                Start Calibration <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Measure Background Noise</h3>
                            <p className="text-slate-400 mb-8">
                                Please remain silent for 3 seconds so we can measure the room noise.
                            </p>

                            {progress > 0 ? (
                                <div className="w-full bg-slate-800 rounded-full h-4 mb-4 overflow-hidden">
                                    <div
                                        className="bg-teal-500 h-full transition-all duration-100 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={handleStep1}
                                    className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-colors"
                                >
                                    Start Silence Check
                                </button>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Reference Tone</h3>
                            <p className="text-slate-400 mb-8">
                                Take a deep breath and say <strong>&quot;Ahhhhh&quot;</strong> at a comfortable, conversational volume for 5 seconds.
                            </p>

                            {progress > 0 ? (
                                <div className="w-full bg-slate-800 rounded-full h-4 mb-4 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full transition-all duration-100 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={handleStep2}
                                    className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors"
                                >
                                    Start Recording
                                </button>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Calibration Complete</h3>
                            <p className="text-slate-400 mb-6">
                                Your microphone has been calibrated.
                                <br />
                                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded mt-2 inline-block">Offset: {offset.toFixed(1)} dB</span>
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setStep(0)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw size={16} /> Redo
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalibrationWizard;
