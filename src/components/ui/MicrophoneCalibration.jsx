import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, VolumeX, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const MicrophoneCalibration = ({ audioEngine }) => {
    const [calibrationStatus, setCalibrationStatus] = useState('idle'); // idle, measuring-silence, measuring-voice, complete
    const [detectedEnvironment, setDetectedEnvironment] = useState('normal');
    const [noiseFloor, setNoiseFloor] = useState(0);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [adaptiveThreshold, setAdaptiveThreshold] = useState(0.005);
    const [countdown, setCountdown] = useState(5);
    const [manualThreshold, setManualThreshold] = useState(null);

    const calibrationDataRef = useRef([]);
    const intervalRef = useRef(null);

    // Monitor current environment from audio engine
    useEffect(() => {
        if (!audioEngine) return;

        const updateInterval = setInterval(() => {
            // Get current data from audio engine
            const data = audioEngine.dataRef?.current;
            if (data && data.debug) {
                const threshold = data.debug.adaptiveThreshold || 0.005;
                setAdaptiveThreshold(threshold);

                // Determine environment based on threshold
                if (threshold < 0.004) {
                    setDetectedEnvironment('quiet');
                } else if (threshold < 0.010) {
                    setDetectedEnvironment('normal');
                } else {
                    setDetectedEnvironment('noisy');
                }
            }
        }, 500);

        return () => clearInterval(updateInterval);
    }, [audioEngine]);

    const startCalibration = () => {
        setCalibrationStatus('measuring-silence');
        setCountdown(5);
        calibrationDataRef.current = [];

        // Start countdown
        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    // Move to voice measurement
                    setTimeout(() => {
                        setCalibrationStatus('measuring-voice');
                        setCountdown(5);
                        startVoiceMeasurement();
                    }, 500);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Collect silence samples
        const silenceInterval = setInterval(() => {
            const data = audioEngine.dataRef?.current;
            if (data) {
                calibrationDataRef.current.push({
                    type: 'silence',
                    volume: data.volume || 0,
                    timestamp: Date.now()
                });
            }
        }, 100);

        setTimeout(() => {
            clearInterval(silenceInterval);
            // Calculate noise floor
            const silenceSamples = calibrationDataRef.current
                .filter(s => s.type === 'silence')
                .map(s => s.volume);

            if (silenceSamples.length > 0) {
                const sorted = silenceSamples.sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                setNoiseFloor(median);
            }
        }, 5000);
    };

    const startVoiceMeasurement = () => {
        // Start countdown for voice
        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    completeCalibration();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Collect voice samples
        const voiceInterval = setInterval(() => {
            const data = audioEngine.dataRef?.current;
            if (data && data.pitch > 50) { // Only count when actually speaking
                calibrationDataRef.current.push({
                    type: 'voice',
                    volume: data.volume || 0,
                    timestamp: Date.now()
                });
            }
        }, 100);

        setTimeout(() => {
            clearInterval(voiceInterval);
        }, 5000);
    };

    const completeCalibration = () => {
        // Calculate voice level
        const voiceSamples = calibrationDataRef.current
            .filter(s => s.type === 'voice')
            .map(s => s.volume);

        if (voiceSamples.length > 0) {
            const avgVoice = voiceSamples.reduce((a, b) => a + b, 0) / voiceSamples.length;
            setVoiceLevel(avgVoice);

            // Calculate recommended threshold (between noise floor and voice level)
            const recommended = noiseFloor * 2.5;
            setManualThreshold(recommended);

            // Apply to audio engine
            if (audioEngine.processor) {
                audioEngine.processor.port.postMessage({
                    type: 'config',
                    config: { threshold: recommended }
                });
            }
        }

        setCalibrationStatus('complete');
    };

    const cancelCalibration = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setCalibrationStatus('idle');
        setCountdown(5);
    };

    const applyManualThreshold = (value) => {
        setManualThreshold(value);
        if (audioEngine.processor) {
            audioEngine.processor.port.postMessage({
                type: 'config',
                config: { threshold: value }
            });
        }
    };

    const getEnvironmentColor = () => {
        switch (detectedEnvironment) {
            case 'quiet': return 'text-emerald-400';
            case 'normal': return 'text-blue-400';
            case 'noisy': return 'text-orange-400';
            default: return 'text-slate-400';
        }
    };

    const getEnvironmentLabel = () => {
        switch (detectedEnvironment) {
            case 'quiet': return 'Quiet Room';
            case 'normal': return 'Normal Room';
            case 'noisy': return 'Noisy Environment';
            default: return 'Unknown';
        }
    };

    return (
        <div className="space-y-4">
            {/* Current Environment Display */}
            <div className="glass-panel rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Mic className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-white">Microphone Calibration</h3>
                    </div>
                    {calibrationStatus === 'idle' && (
                        <button
                            onClick={startCalibration}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recalibrate
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Environment:</span>
                        <span className={`font-bold ${getEnvironmentColor()}`}>
                            {getEnvironmentLabel()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Noise Floor:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-300"
                                    style={{ width: `${Math.min(100, (adaptiveThreshold / 0.02) * 100)}%` }}
                                />
                            </div>
                            <span className="font-mono text-xs text-slate-300">
                                {adaptiveThreshold.toFixed(4)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calibration Wizard */}
            {calibrationStatus !== 'idle' && (
                <div className="glass-panel rounded-xl p-6 border border-white/10 bg-slate-900/50">
                    {calibrationStatus === 'measuring-silence' && (
                        <div className="text-center">
                            <VolumeX className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
                            <h4 className="text-lg font-bold text-white mb-2">
                                Step 1: Measuring Background Noise
                            </h4>
                            <p className="text-slate-400 text-sm mb-4">
                                Please stay silent for {countdown} seconds...
                            </p>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-1000"
                                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                                />
                            </div>
                            <button
                                onClick={cancelCalibration}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {calibrationStatus === 'measuring-voice' && (
                        <div className="text-center">
                            <Volume2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-pulse" />
                            <h4 className="text-lg font-bold text-white mb-2">
                                Step 2: Measuring Voice Level
                            </h4>
                            <p className="text-slate-400 text-sm mb-4">
                                Speak normally for {countdown} seconds...
                            </p>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                                />
                            </div>
                            <button
                                onClick={cancelCalibration}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {calibrationStatus === 'complete' && (
                        <div className="text-center">
                            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-white mb-2">
                                ✅ Calibration Complete!
                            </h4>

                            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Noise Floor:</span>
                                    <span className="font-mono text-white">{noiseFloor.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Voice Level:</span>
                                    <span className="font-mono text-white">{voiceLevel.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Recommended Threshold:</span>
                                    <span className="font-mono text-emerald-400">{manualThreshold?.toFixed(4)}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCalibrationStatus('idle')}
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-colors"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={startCalibration}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                >
                                    Recalibrate
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Override */}
            {calibrationStatus === 'idle' && (
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-bold text-white">Manual Override</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                        Adjust sensitivity if automatic detection isn&apos;t working well
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Sensitive</span>
                        <input
                            type="range"
                            min="0.001"
                            max="0.020"
                            step="0.001"
                            value={manualThreshold || adaptiveThreshold}
                            onChange={(e) => applyManualThreshold(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-slate-500">Less Sensitive</span>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-xs font-mono text-slate-400">
                            Current: {(manualThreshold || adaptiveThreshold).toFixed(4)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MicrophoneCalibration;
