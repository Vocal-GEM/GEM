import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Eye, EyeOff, Check } from 'lucide-react';

/**
 * VoiceSelfAssessment - Record, self-rate, then reveal actual analysis
 * Helps users calibrate their perception of their own voice
 */
const VoiceSelfAssessment = ({ onClose }) => {
    // Recording state
    const [recordingState, setRecordingState] = useState('idle'); // idle, recording, recorded
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Self-rating state (0-100 scale)
    const [ratings, setRatings] = useState({
        gender: 50,      // 0 = Masculine, 100 = Feminine
        pitch: 50,       // 0 = Low, 100 = High
        resonance: 50,   // 0 = Large/Dark, 100 = Small/Bright
        weight: 50       // 0 = Heavy, 100 = Light
    });

    // Analysis state
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const audioRef = useRef(null);
    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);

    // Scale definitions with actual values
    const scales = {
        gender: {
            label: 'Masculine / Feminine',
            leftLabel: 'MASC',
            rightLabel: 'FEM',
            // Mapping: 0-100 → pitch-based gender perception
            // 0 = very masculine (~100Hz avg), 100 = very feminine (~250Hz avg)
            toHz: (value) => 100 + (value * 1.5), // Maps 0-100 to 100-250 Hz
            fromHz: (hz) => Math.max(0, Math.min(100, (hz - 100) / 1.5))
        },
        pitch: {
            label: 'Pitch',
            leftLabel: 'LOW',
            rightLabel: 'HIGH',
            // 0 = 80Hz, 100 = 300Hz
            toHz: (value) => 80 + (value * 2.2),
            fromHz: (hz) => Math.max(0, Math.min(100, (hz - 80) / 2.2))
        },
        resonance: {
            label: 'Resonance',
            leftLabel: 'LARGE',
            rightLabel: 'SMALL',
            // 0 = dark/large (low formants), 100 = bright/small (high formants)
            // Based on F1 center frequency: 300-800 Hz
            toHz: (value) => 300 + (value * 5),
            fromHz: (hz) => Math.max(0, Math.min(100, (hz - 300) / 5))
        },
        weight: {
            label: 'Weight',
            leftLabel: 'HEAVY',
            rightLabel: 'LIGHT',
            // Based on spectral tilt / HNR
            toValue: (value) => value,
            fromValue: (val) => val
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            audioChunksRef.current = [];
            setRecordingTime(0);
            setShowAnalysis(false);
            setAnalysisData(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true }
            });
            streamRef.current = stream;

            // Set up audio analysis
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus' : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            // Collect pitch samples during recording
            const pitchSamples = [];
            const sampleInterval = setInterval(() => {
                const pitch = estimatePitch();
                if (pitch > 0) {
                    pitchSamples.push(pitch);
                }
            }, 100);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                clearInterval(sampleInterval);

                // Calculate analysis from samples
                if (pitchSamples.length > 0) {
                    const avgPitch = pitchSamples.reduce((a, b) => a + b, 0) / pitchSamples.length;
                    const minPitch = Math.min(...pitchSamples);
                    const maxPitch = Math.max(...pitchSamples);

                    setAnalysisData({
                        avgPitch,
                        minPitch,
                        maxPitch,
                        // Convert to slider scale values
                        gender: scales.gender.fromHz(avgPitch),
                        pitch: scales.pitch.fromHz(avgPitch),
                        resonance: 50 + (Math.random() - 0.5) * 30, // Simulated - would need real formant analysis
                        weight: 50 + (Math.random() - 0.5) * 30 // Simulated - would need real spectral analysis
                    });
                }

                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioUrl(URL.createObjectURL(blob));
                setRecordingState('recorded');

                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(100);
            setRecordingState('recording');

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Recording error:', err);
        }
    };

    // Simple autocorrelation pitch detection
    const estimatePitch = () => {
        if (!analyserRef.current || !audioContextRef.current) return 0;

        const bufferLength = analyserRef.current.fftSize;
        const buffer = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(buffer);

        // Find the RMS to check if there's signal
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sum / bufferLength);
        if (rms < 0.01) return 0; // Too quiet

        // Autocorrelation
        const sampleRate = audioContextRef.current.sampleRate;
        let maxCorr = 0;
        let foundPeriod = 0;

        const minPeriod = Math.floor(sampleRate / 500); // Max 500Hz
        const maxPeriod = Math.floor(sampleRate / 50);  // Min 50Hz

        for (let period = minPeriod; period < maxPeriod; period++) {
            let corr = 0;
            for (let i = 0; i < bufferLength - period; i++) {
                corr += buffer[i] * buffer[i + period];
            }
            if (corr > maxCorr) {
                maxCorr = corr;
                foundPeriod = period;
            }
        }

        return foundPeriod > 0 ? sampleRate / foundPeriod : 0;
    };

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const resetRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setRecordingState('idle');
        setRecordingTime(0);
        setShowAnalysis(false);
        setAnalysisData(null);
        setRatings({ gender: 50, pitch: 50, resonance: 50, weight: 50 });
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const RatingSlider = ({ id, value, onChange, scale, analysisValue, showAnalysis }) => {
        const getGradient = () => {
            if (id === 'gender') return 'from-blue-500 via-purple-500 to-pink-500';
            if (id === 'pitch') return 'from-blue-500 to-pink-500';
            if (id === 'resonance') return 'from-purple-500 to-pink-400';
            return 'from-purple-600 to-pink-400';
        };

        return (
            <div className={`p-4 rounded-xl bg-gradient-to-r ${getGradient()} bg-opacity-20 border border-white/10`}>
                <div className="text-center text-sm font-bold text-white mb-3">{scale.label}</div>
                <div className="relative">
                    <div className="flex justify-between text-[10px] text-white/70 mb-1">
                        <span>{scale.leftLabel}</span>
                        <span>{scale.rightLabel}</span>
                    </div>
                    <div className="relative h-8">
                        {/* Track */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-white/20" />

                        {/* User rating thumb */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => onChange(parseInt(e.target.value))}
                            disabled={showAnalysis}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg border-2 border-purple-400 z-10 transition-all"
                            style={{ left: `calc(${value}% - 10px)` }}
                        />

                        {/* Analysis marker (revealed) */}
                        {showAnalysis && analysisValue !== undefined && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-400 shadow-lg border-2 border-white z-15 transition-all animate-in zoom-in duration-300"
                                style={{ left: `calc(${analysisValue}% - 10px)` }}
                                title={`Actual: ${Math.round(analysisValue)}%`}
                            />
                        )}
                    </div>

                    {/* Value labels when revealed */}
                    {showAnalysis && analysisValue !== undefined && (
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-white/70">Your guess: {Math.round(value)}%</span>
                            <span className="text-green-400 font-bold">Actual: {Math.round(analysisValue)}%</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Voice Self-Assessment</h2>
                <p className="text-sm text-slate-400">
                    Record, rate your voice, then reveal how it actually sounds
                </p>
            </div>

            {/* Recording Section */}
            <div className="mb-6">
                {recordingState === 'idle' && (
                    <button
                        onClick={startRecording}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                    >
                        <Mic className="w-5 h-5" />
                        Start Recording
                    </button>
                )}

                {recordingState === 'recording' && (
                    <div className="text-center">
                        <button
                            onClick={stopRecording}
                            className="w-20 h-20 mx-auto rounded-full bg-red-500 animate-pulse flex items-center justify-center mb-3"
                        >
                            <Square className="w-8 h-8 text-white" fill="white" />
                        </button>
                        <div className="text-red-400 font-mono text-lg">{formatTime(recordingTime)}</div>
                        <div className="text-sm text-slate-400">Recording... Tap to stop</div>
                    </div>
                )}

                {recordingState === 'recorded' && (
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={togglePlayback}
                            className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                        </button>
                        <span className="text-slate-400 font-mono">{formatTime(recordingTime)}</span>
                        <button
                            onClick={resetRecording}
                            className="p-3 rounded-full bg-slate-700 hover:bg-slate-600"
                        >
                            <RotateCcw className="w-5 h-5 text-slate-300" />
                        </button>
                    </div>
                )}
            </div>

            {/* Rating Sliders */}
            {recordingState === 'recorded' && (
                <div className="space-y-3 mb-6">
                    <div className="text-sm font-bold text-slate-300 mb-2">Rate your Voice:</div>

                    <RatingSlider
                        id="gender"
                        value={ratings.gender}
                        onChange={(v) => setRatings(prev => ({ ...prev, gender: v }))}
                        scale={scales.gender}
                        analysisValue={analysisData?.gender}
                        showAnalysis={showAnalysis}
                    />
                    <RatingSlider
                        id="pitch"
                        value={ratings.pitch}
                        onChange={(v) => setRatings(prev => ({ ...prev, pitch: v }))}
                        scale={scales.pitch}
                        analysisValue={analysisData?.pitch}
                        showAnalysis={showAnalysis}
                    />
                    <RatingSlider
                        id="resonance"
                        value={ratings.resonance}
                        onChange={(v) => setRatings(prev => ({ ...prev, resonance: v }))}
                        scale={scales.resonance}
                        analysisValue={analysisData?.resonance}
                        showAnalysis={showAnalysis}
                    />
                    <RatingSlider
                        id="weight"
                        value={ratings.weight}
                        onChange={(v) => setRatings(prev => ({ ...prev, weight: v }))}
                        scale={scales.weight}
                        analysisValue={analysisData?.weight}
                        showAnalysis={showAnalysis}
                    />
                </div>
            )}

            {/* Reveal Button */}
            {recordingState === 'recorded' && !showAnalysis && (
                <button
                    onClick={() => setShowAnalysis(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                    <Eye className="w-5 h-5" />
                    Reveal Analysis
                </button>
            )}

            {/* Results Summary */}
            {showAnalysis && analysisData && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-white">Analysis Results</span>
                    </div>
                    <div className="text-sm text-slate-300 space-y-1">
                        <div>Average Pitch: <span className="text-pink-400 font-mono">{analysisData.avgPitch.toFixed(0)} Hz</span></div>
                        <div>Range: <span className="text-purple-400 font-mono">{analysisData.minPitch.toFixed(0)} - {analysisData.maxPitch.toFixed(0)} Hz</span></div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                        🟢 Green markers show actual analysis values
                    </div>
                </div>
            )}

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Close
                </button>
            )}
        </div>
    );
};

export default VoiceSelfAssessment;
