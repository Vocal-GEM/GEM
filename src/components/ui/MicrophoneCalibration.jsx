import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, VolumeX, RefreshCw, CheckCircle, AlertCircle, Activity, BarChart2 } from 'lucide-react';
import { analyzeMicrophoneQuality } from '../../utils/MicrophoneQualityAnalyzer';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const MicrophoneCalibration = ({ audioEngine }) => {
    const [calibrationStatus, setCalibrationStatus] = useState('idle'); // idle, measuring-silence, measuring-voice, complete
    const [detectedEnvironment, setDetectedEnvironment] = useState('normal');
    const [adaptiveThreshold, setAdaptiveThreshold] = useState(0.005);
    const [countdown, setCountdown] = useState(3);
    const [manualThreshold, setManualThreshold] = useState(null);
    const [qualityResult, setQualityResult] = useState(null);
    const [voiceLevel, setVoiceLevel] = useState(0);

    const calibrationDataRef = useRef([]);
    const intervalRef = useRef(null);

    // Monitoring effect
    useEffect(() => {
        if (!audioEngine) return;

        const updateInterval = setInterval(() => {
            const data = audioEngine.dataRef?.current;
            if (data && data.debug) {
                const threshold = data.debug.adaptiveThreshold || 0.005;
                setAdaptiveThreshold(threshold);

                // Only update environment if not calibrating
                if (calibrationStatus === 'idle' && !qualityResult) {
                    if (threshold < 0.004) setDetectedEnvironment('quiet');
                    else if (threshold < 0.010) setDetectedEnvironment('normal');
                    else setDetectedEnvironment('noisy');
                }
            }
        }, 500);

        return () => clearInterval(updateInterval);
    }, [audioEngine, calibrationStatus, qualityResult]);

    const startCalibration = async () => {
        if (!audioEngine || !audioEngine.audioContext || !audioEngine.microphone) {
            console.error("Audio engine not ready");
            return;
        }

        setCalibrationStatus('measuring-silence');
        setCountdown(3);
        setQualityResult(null);

        // Start countdown
        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Run Quality Analysis (takes ~3s)
        try {
            const result = await analyzeMicrophoneQuality(
                audioEngine.audioContext,
                audioEngine.microphone,
                3000
            );

            setQualityResult(result);
            setDetectedEnvironment(result.environment);

            // Move to voice measurement
            setCalibrationStatus('measuring-voice');
            setCountdown(3);
            startVoiceMeasurement();

        } catch (err) {
            console.error("Calibration failed", err);
            setCalibrationStatus('idle');
        }
    };

    const startVoiceMeasurement = () => {
        calibrationDataRef.current = [];

        // Countdown for voice
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
            if (data && data.pitch > 50) {
                calibrationDataRef.current.push(data.volume || 0);
            }
        }, 50);

        setTimeout(() => {
            clearInterval(voiceInterval);
        }, 3000);
    };

    const completeCalibration = () => {
        // Calculate voice level
        const voiceSamples = calibrationDataRef.current;
        let avgVoice = 0;

        if (voiceSamples.length > 0) {
            avgVoice = voiceSamples.reduce((a, b) => a + b, 0) / voiceSamples.length;
            setVoiceLevel(avgVoice);
        }

        // Apply settings from quality analyzer
        if (qualityResult) {
            const { recommendations } = qualityResult;
            setManualThreshold(recommendations.noiseGateThreshold);

            // Apply to engine
            if (audioEngine.processor) {
                audioEngine.processor.port.postMessage({
                    type: 'config',
                    config: { threshold: recommendations.noiseGateThreshold }
                });
            }

            // Also update engine's main noise gate if available
            if (audioEngine.setNoiseGate) {
                audioEngine.setNoiseGate(recommendations.noiseGateThreshold);
            }

            // If gain compensation suggested
            // (We don't have a standardized gain node exposed in this component yet, 
            // but could log it or set it if AudioEngine supports it)
        }

        setCalibrationStatus('complete');
    };

    const cancelCalibration = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCalibrationStatus('idle');
        setCountdown(3);
    };

    const applyManualThreshold = (value) => {
        setManualThreshold(value);
        if (audioEngine.setNoiseGate) {
            audioEngine.setNoiseGate(value);
        }
        if (audioEngine.processor) {
            audioEngine.processor.port.postMessage({
                type: 'config',
                config: { threshold: value }
            });
        }
    };

    // Chart Data
    const getChartData = () => {
        if (!qualityResult) return null;

        const { frequencyResponse } = qualityResult;
        return {
            labels: ['Low (Bass)', 'Mid (Voice)', 'High (Treble)'],
            datasets: [
                {
                    fill: true,
                    label: 'Mic Response',
                    data: [
                        frequencyResponse.low + 100, // Offset for better visualization (dB is negative)
                        frequencyResponse.mid + 100,
                        frequencyResponse.high + 100
                    ],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    tension: 0.4
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `Response: ${(ctx.raw - 100).toFixed(1)} dB`
                }
            }
        },
        scales: {
            y: { display: false, min: 0, max: 100 },
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } }
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-4">
            {/* Status Panel */}
            <div className="glass-panel rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-white">Microphone Quality</h3>
                    </div>
                    {calibrationStatus === 'idle' && (
                        <button
                            onClick={startCalibration}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Calibrate
                        </button>
                    )}
                </div>

                {qualityResult ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                            <span className="text-slate-400">Quality Score</span>
                            <span className={`text-2xl font-bold ${getScoreColor(qualityResult.qualityScore)}`}>
                                {qualityResult.qualityScore}/100
                            </span>
                        </div>

                        <div className="h-24 w-full">
                            <Line options={chartOptions} data={getChartData()} />
                        </div>

                        <div className="text-xs text-slate-400 p-2 bg-slate-800/30 rounded border border-white/5">
                            <p>Noise Floor: <span className="text-white font-mono">{qualityResult.noiseFloorDb.toFixed(1)} dB</span></p>
                            <p className="mt-1">{qualityResult.recommendations.message}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">
                        <p>No calibration data yet.</p>
                        <p className="text-xs mt-1">Run calibration to analyze microphone quality.</p>
                    </div>
                )}
            </div>

            {/* Wizard Modal Overlay */}
            {calibrationStatus !== 'idle' && calibrationStatus !== 'complete' && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                        {calibrationStatus === 'measuring-silence' && (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <VolumeX className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-pulse" />
                                <h4 className="text-xl font-bold text-white mb-2">Staying Silent</h4>
                                <p className="text-slate-400 mb-6">Measuring background noise... Shhh! ({countdown}s)</p>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${((3 - countdown) / 3) * 100}%` }} />
                                </div>
                            </div>
                        )}

                        {calibrationStatus === 'measuring-voice' && (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <Volume2 className="w-16 h-16 text-emerald-400 mx-auto mb-6 animate-pulse" />
                                <h4 className="text-xl font-bold text-white mb-2">Speak Clearly</h4>
                                <p className="text-slate-400 mb-6">Say "Ahhhh" or count to 5... ({countdown}s)</p>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${((3 - countdown) / 3) * 100}%` }} />
                                </div>
                            </div>
                        )}

                        <button onClick={cancelCalibration} className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Complete Summary Overlay */}
            {calibrationStatus === 'complete' && qualityResult && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-emerald-500/30 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
                            <p className="text-emerald-400 font-medium mt-1">Settings have been optimized</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400">Mic Quality</span>
                                    <span className={`font-bold ${getScoreColor(qualityResult.qualityScore)}`}>
                                        {qualityResult.qualityScore}/100
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${qualityResult.qualityScore > 60 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${qualityResult.qualityScore}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Noise Floor</p>
                                    <p className="text-lg font-mono font-bold text-white">{qualityResult.noiseFloorDb.toFixed(0)} dB</p>
                                </div>
                                <div className="bg-slate-800 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gate Thresh</p>
                                    <p className="text-lg font-mono font-bold text-blue-400">{(qualityResult.recommendations.noiseGateThreshold * 1000).toFixed(1)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setCalibrationStatus('idle')}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Manual Override (Collapsed) */}
            {calibrationStatus === 'idle' && (
                <details className="group">
                    <summary className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors select-none">
                        <AlertCircle className="w-3 h-3" />
                        <span>Advanced Settings</span>
                    </summary>
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-16">Gate</span>
                            <input
                                type="range"
                                min="0.001"
                                max="0.020"
                                step="0.001"
                                value={manualThreshold || adaptiveThreshold}
                                onChange={(e) => applyManualThreshold(parseFloat(e.target.value))}
                                className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs font-mono text-slate-400 w-12 text-right">
                                {(manualThreshold || adaptiveThreshold).toFixed(3)}
                            </span>
                        </div>
                    </div>
                </details>
            )}
        </div>
    );
};

export default MicrophoneCalibration;
