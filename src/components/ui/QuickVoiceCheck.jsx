/**
 * QuickVoiceCheck.jsx
 * 
 * "How Am I Doing?" - A quick 5-second voice check that gives instant feedback
 * on current voice metrics compared to baseline and goals.
 */

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCw, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { VoiceCalibrationService } from '../../services/VoiceCalibrationService';

const CHECK_DURATION = 5000; // 5 seconds

const QuickVoiceCheck = ({ onClose }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const { targetRange } = useProfile();

    const [status, setStatus] = useState('idle'); // idle, recording, analyzing, complete
    const [countdown, setCountdown] = useState(5);
    const [results, setResults] = useState(null);

    const samplesRef = useRef({ pitch: [], resonance: [], weight: [] });
    const timerRef = useRef(null);
    const countdownRef = useRef(null);

    // Start recording
    const startCheck = async () => {
        if (!isAudioActive) {
            await toggleAudio();
        }

        samplesRef.current = { pitch: [], resonance: [], weight: [] };
        setStatus('recording');
        setCountdown(5);

        // Sample data every 100ms
        timerRef.current = setInterval(() => {
            if (dataRef.current && dataRef.current.pitch > 0) {
                samplesRef.current.pitch.push(dataRef.current.pitch);
                samplesRef.current.resonance.push(dataRef.current.resonance || 50);
                samplesRef.current.weight.push(dataRef.current.weight || 50);
            }
        }, 100);

        // Countdown
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Stop after duration
        setTimeout(() => {
            stopCheck();
        }, CHECK_DURATION);
    };

    const stopCheck = () => {
        clearInterval(timerRef.current);
        clearInterval(countdownRef.current);
        setStatus('analyzing');

        // Calculate results
        const { pitch, resonance, weight } = samplesRef.current;

        if (pitch.length < 10) {
            setStatus('idle');
            return;
        }

        const avgPitch = pitch.reduce((a, b) => a + b, 0) / pitch.length;
        const avgResonance = resonance.reduce((a, b) => a + b, 0) / resonance.length;
        const avgWeight = weight.reduce((a, b) => a + b, 0) / weight.length;

        // Get baseline for comparison
        const baseline = VoiceCalibrationService.getBaseline();

        // Determine status relative to target
        const targetPitch = targetRange?.target || 200;
        const pitchInTarget = avgPitch >= (targetRange?.min || 160) && avgPitch <= (targetRange?.max || 280);

        setResults({
            pitch: {
                value: Math.round(avgPitch),
                target: targetPitch,
                inTarget: pitchInTarget,
                trend: baseline?.pitch?.mean ? (avgPitch > baseline.pitch.mean ? 'up' : avgPitch < baseline.pitch.mean ? 'down' : 'stable') : null
            },
            resonance: {
                value: Math.round(avgResonance),
                level: avgResonance > 60 ? 'bright' : avgResonance < 40 ? 'dark' : 'balanced'
            },
            weight: {
                value: Math.round(avgWeight),
                level: avgWeight > 60 ? 'heavy' : avgWeight < 40 ? 'light' : 'balanced'
            },
            overallScore: pitchInTarget ? (avgResonance > 50 ? 'excellent' : 'good') : 'needs_work',
            sampleCount: pitch.length
        });

        setStatus('complete');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearInterval(countdownRef.current);
        };
    }, []);

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <TrendingUp className="text-emerald-400" size={16} />;
        if (trend === 'down') return <TrendingDown className="text-amber-400" size={16} />;
        return <Minus className="text-slate-400" size={16} />;
    };

    const getOverallMessage = (score) => {
        if (score === 'excellent') return { emoji: '🌟', text: 'Excellent! You sound great!', color: 'emerald' };
        if (score === 'good') return { emoji: '👍', text: 'Good job! Keep practicing.', color: 'blue' };
        return { emoji: '💪', text: 'Keep working at it!', color: 'amber' };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 p-6 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Quick Voice Check</h2>
                    <p className="text-slate-400 text-sm">Speak for 5 seconds to see how you're doing</p>
                </div>

                {/* Status-based content */}
                {status === 'idle' && (
                    <div className="text-center py-8">
                        <button
                            onClick={startCheck}
                            className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/30 transition-all hover:scale-105"
                        >
                            <Mic size={40} className="text-white" />
                        </button>
                        <p className="text-slate-300 mt-6">Tap to start</p>
                        <p className="text-slate-500 text-sm mt-2">Say anything! Read aloud or just talk.</p>
                    </div>
                )}

                {status === 'recording' && (
                    <div className="text-center py-8">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                            <div className="relative w-24 h-24 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">{countdown}</span>
                            </div>
                        </div>
                        <p className="text-slate-300 text-lg">Listening...</p>
                        <p className="text-slate-500 text-sm mt-2">Keep talking naturally</p>
                    </div>
                )}

                {status === 'analyzing' && (
                    <div className="text-center py-8">
                        <Activity size={48} className="mx-auto text-purple-400 animate-pulse mb-4" />
                        <p className="text-slate-300">Analyzing your voice...</p>
                    </div>
                )}

                {status === 'complete' && results && (
                    <div className="space-y-4">
                        {/* Overall Score */}
                        {(() => {
                            const overall = getOverallMessage(results.overallScore);
                            return (
                                <div className={`text-center p-4 bg-${overall.color}-500/10 border border-${overall.color}-500/20 rounded-2xl`}>
                                    <span className="text-4xl">{overall.emoji}</span>
                                    <p className={`text-lg font-bold text-${overall.color}-300 mt-2`}>{overall.text}</p>
                                </div>
                            );
                        })()}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Pitch */}
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-white">{results.pitch.value}</div>
                                <div className="text-xs text-slate-400">Hz</div>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    {results.pitch.trend && getTrendIcon(results.pitch.trend)}
                                    <span className={`text-xs ${results.pitch.inTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {results.pitch.inTarget ? 'On Target' : 'Adjust'}
                                    </span>
                                </div>
                            </div>

                            {/* Resonance */}
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-white">{results.resonance.value}</div>
                                <div className="text-xs text-slate-400">Resonance</div>
                                <span className={`text-xs ${results.resonance.level === 'bright' ? 'text-pink-400' :
                                    results.resonance.level === 'dark' ? 'text-blue-400' : 'text-slate-400'
                                    }`}>
                                    {results.resonance.level.charAt(0).toUpperCase() + results.resonance.level.slice(1)}
                                </span>
                            </div>

                            {/* Weight */}
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-white">{results.weight.value}</div>
                                <div className="text-xs text-slate-400">Weight</div>
                                <span className={`text-xs ${results.weight.level === 'light' ? 'text-cyan-400' :
                                    results.weight.level === 'heavy' ? 'text-orange-400' : 'text-slate-400'
                                    }`}>
                                    {results.weight.level.charAt(0).toUpperCase() + results.weight.level.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setStatus('idle');
                                    setResults(null);
                                }}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Check Again
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold rounded-xl transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}

                {/* Close button for idle/recording states */}
                {(status === 'idle' || status === 'recording') && (
                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuickVoiceCheck;
