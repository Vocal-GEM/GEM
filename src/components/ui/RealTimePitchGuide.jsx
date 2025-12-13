import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Target, TrendingUp } from 'lucide-react';

const RealTimePitchGuide = ({ targetPitch = 200, tolerance = 20, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [currentPitch, setCurrentPitch] = useState(0);
    const [pitchHistory, setPitchHistory] = useState([]);
    const [accuracy, setAccuracy] = useState(0);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const streamRef = useRef(null);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            setIsListening(true);
            detectPitch();
        } catch (error) {
            console.error('Microphone access denied:', error);
        }
    };

    const stopListening = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setIsListening(false);
    };

    const detectPitch = useCallback(() => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.fftSize;
        const buffer = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(buffer);

        // Simple autocorrelation pitch detection
        const sampleRate = audioContextRef.current.sampleRate;
        let maxCorrelation = 0;
        let bestOffset = -1;

        for (let offset = 20; offset < bufferLength / 2; offset++) {
            let correlation = 0;
            for (let i = 0; i < bufferLength / 2; i++) {
                correlation += Math.abs(buffer[i] - buffer[i + offset]);
            }
            correlation = 1 - (correlation / (bufferLength / 2));
            if (correlation > maxCorrelation && correlation > 0.9) {
                maxCorrelation = correlation;
                bestOffset = offset;
            }
        }

        if (bestOffset !== -1) {
            const detectedPitch = sampleRate / bestOffset;
            if (detectedPitch > 50 && detectedPitch < 400) {
                setCurrentPitch(Math.round(detectedPitch));
                setPitchHistory(prev => {
                    const newHistory = [...prev, detectedPitch].slice(-50);
                    // Calculate accuracy (how often within tolerance)
                    const inRange = newHistory.filter(p =>
                        Math.abs(p - targetPitch) <= tolerance
                    ).length;
                    setAccuracy(Math.round((inRange / newHistory.length) * 100));
                    return newHistory;
                });
            }
        }

        animationRef.current = requestAnimationFrame(detectPitch);
    }, [targetPitch, tolerance]);

    useEffect(() => {
        return () => stopListening();
    }, []);

    const isInRange = Math.abs(currentPitch - targetPitch) <= tolerance;
    const pitchDiff = currentPitch - targetPitch;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Real-Time Pitch Guide</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {/* Target Indicator */}
                <div className="text-center mb-8">
                    <div className="text-sm text-slate-400 mb-1">Target Pitch</div>
                    <div className="text-4xl font-bold text-blue-400">{targetPitch} Hz</div>
                    <div className="text-sm text-slate-500">±{tolerance} Hz tolerance</div>
                </div>

                {/* Visual Pitch Corridor */}
                <div className="relative w-full max-w-md h-64 bg-slate-900 rounded-2xl border border-slate-800 mb-8 overflow-hidden">
                    {/* Target Zone */}
                    <div
                        className="absolute left-0 right-0 bg-blue-500/20 border-y border-blue-500/50"
                        style={{
                            top: `${50 - (tolerance / 2)}%`,
                            height: `${tolerance}%`
                        }}
                    />

                    {/* Target Line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-blue-500 top-1/2" />

                    {/* Current Pitch Marker */}
                    {currentPitch > 0 && (
                        <div
                            className={`absolute left-4 right-4 h-3 rounded-full transition-all duration-75 ${isInRange ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                            style={{
                                top: `${50 - ((pitchDiff / 100) * 50)}%`,
                                transform: 'translateY(-50%)'
                            }}
                        />
                    )}

                    {/* Labels */}
                    <div className="absolute right-2 top-2 text-xs text-slate-500">High</div>
                    <div className="absolute right-2 bottom-2 text-xs text-slate-500">Low</div>
                </div>

                {/* Current Pitch Display */}
                <div className="text-center mb-8">
                    <div className="text-sm text-slate-400 mb-1">Current Pitch</div>
                    <div className={`text-6xl font-bold ${isInRange ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currentPitch || '--'}
                        <span className="text-2xl ml-2">Hz</span>
                    </div>
                    <div className={`text-sm mt-2 ${isInRange ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {currentPitch === 0 ? 'Speak to see pitch' :
                            isInRange ? '✓ In Range!' :
                                pitchDiff > 0 ? `↓ Too high by ${pitchDiff} Hz` : `↑ Too low by ${Math.abs(pitchDiff)} Hz`}
                    </div>
                </div>

                {/* Accuracy */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">{accuracy}%</div>
                        <div className="text-sm text-slate-400">Accuracy</div>
                    </div>
                </div>

                {/* Start/Stop Button */}
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {isListening ? <MicOff className="text-white" size={32} /> : <Mic className="text-white" size={32} />}
                </button>
            </div>
        </div>
    );
};

export default RealTimePitchGuide;
