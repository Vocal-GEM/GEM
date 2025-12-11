import { useState } from 'react';
import { CheckCircle, AlertTriangle, Volume2, ArrowRight, Loader2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';

const EnvironmentCheck = ({ onClose }) => {
    const { runEnvironmentCheck } = useAudio();
    const { settings, updateSettings } = useSettings();
    const [status, setStatus] = useState('idle'); // idle, checking, success, error
    const [result, setResult] = useState(null);
    const [countdown, setCountdown] = useState(3);

    const startCheck = async () => {
        setStatus('checking');
        setCountdown(3);

        // Simple countdown for UX
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        try {
            // Run the actual check (takes ~3s)
            const analysis = await runEnvironmentCheck();
            setResult(analysis);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            clearInterval(timer);
        }
    };

    const applyOptimizations = () => {
        if (!result) return;

        // Calculate appropriate threshold based on noise floor
        // Noise floor is in dB (e.g. -60dB).
        // Threshold needs to be in Amplitude (0-1).
        // 0dB = 1.0, -20dB = 0.1, -40dB = 0.01, -60dB = 0.001

        // Let's be conservative: Threshold = NoiseFloor + 6dB (margin) converted to linear
        // If noise floor is -50dB, threshold should be -44dB.
        const margindB = 6;
        const targetdB = (result.noiseFloor || -60) + margindB;
        const targetThreshold = Math.pow(10, targetdB / 20);

        // Ensure it's within sane bounds (0.001 to 0.1)
        const safeThreshold = Math.min(Math.max(targetThreshold, 0.0001), 0.1);

        updateSettings({
            ...settings,
            noiseGate: safeThreshold
        });

        if (onClose) onClose();
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Volume2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Environment Check</h2>
                        <p className="text-sm text-slate-400">Optimize app for your room</p>
                    </div>
                </div>
            </div>

            {status === 'idle' && (
                <div className="space-y-4">
                    <p className="text-slate-300">
                        We&apos;ll listen to the background noise in your room to set the best microphone sensitivity.
                    </p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                Please remain silent during the check
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                It takes about 3 seconds
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={startCheck}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        Start Check <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {status === 'checking' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <Loader2 size={48} className="text-emerald-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xs">
                            {countdown}
                        </div>
                    </div>
                    <p className="text-slate-300 font-medium">Listening to background noise...</p>
                </div>
            )}

            {status === 'success' && result && (
                <div className="space-y-4">
                    <div className="text-center mb-6">
                        <div className={`text-3xl font-bold mb-1 ${result.score > 70 ? 'text-emerald-400' : result.score > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {result.score}/100
                        </div>
                        <p className="text-sm text-slate-400">Quality Score</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl space-y-3 border border-slate-700">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Noise Floor</span>
                            <span className="text-slate-200 font-mono">{result.noiseFloor} dB</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Issues</span>
                            <span className={result.clipping > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                                {result.clipping > 0 ? 'Clipping Detected' : 'None'}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-slate-700/50">
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {result.message}
                            </p>
                        </div>
                    </div>

                    {result.score < 50 && (
                        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-200">
                                Your environment is quite noisy. This may affect analysis accuracy. Try moving to a quieter room.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={applyOptimizations}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <CheckCircle size={18} /> Apply Optimization
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-slate-400 hover:text-white text-sm font-medium"
                    >
                        Skip
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-slate-300">Could not access microphone or run analysis.</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default EnvironmentCheck;
