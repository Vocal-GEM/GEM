import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, CheckCircle, ArrowRight, RefreshCw, X, Loader2, TrendingUp } from 'lucide-react';
import { VoiceCalibrationService } from '../../services/VoiceCalibrationService';

/**
 * VoiceCalibrationWizard - Standalone wizard for voice baseline calibration
 * Similar to CalibrationWizard (for SPL) but captures pitch, formant, and voice quality metrics.
 */
const VoiceCalibrationWizard = ({ onComplete, onClose }) => {
    const [step, setStep] = useState(0); // 0: Intro, 1: Recording, 2: Processing, 3: Results
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

    const READING_PASSAGE = "The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.";

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            setError(null);
            audioChunksRef.current = [];
            setRecordingTime(0);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });
            streamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                setStep(2); // Processing
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                try {
                    const extractedMetrics = await VoiceCalibrationService.analyzeBaseline(audioBlob);
                    VoiceCalibrationService.saveBaseline(extractedMetrics);
                    setMetrics(extractedMetrics);
                    setStep(3); // Results
                } catch (err) {
                    console.error('Failed to analyze audio:', err);
                    setError('Failed to analyze recording. Please try again.');
                    setStep(1);
                }

                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(100);
            setIsRecording(true);

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Recording error:', err);
            setError(err.name === 'NotAllowedError'
                ? 'Microphone access denied. Please allow access.'
                : 'Could not start recording.');
        }
    };

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const reset = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setMetrics(null);
        setError(null);
        setRecordingTime(0);
        setStep(1);
    };

    const handleFinish = () => {
        onComplete?.(metrics);
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-purple-400" /> Voice Baseline Calibration
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-slate-400 text-sm">Step {step + 1} of 4</div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Step 0: Intro */}
                    {step === 0 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Volume2 size={40} className="text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Capture Your Voice Baseline</h3>
                            <p className="text-slate-400 mb-6">
                                Record a short sample of your natural speaking voice. This will be used to track your progress and personalize feedback.
                            </p>
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
                            >
                                Start Calibration <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Step 1: Recording */}
                    {step === 1 && (
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Read the Passage</h3>
                            <p className="text-slate-400 mb-4">
                                Read the following text aloud at your normal speaking pace and volume.
                            </p>

                            {/* Reading passage */}
                            <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 mb-6 text-left">
                                <p className="text-white italic leading-relaxed">"{READING_PASSAGE}"</p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {isRecording ? (
                                <div className="flex flex-col items-center gap-4">
                                    <button
                                        onClick={stopRecording}
                                        className="w-20 h-20 rounded-full bg-red-500 animate-pulse flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
                                    >
                                        <Square size={32} className="text-white" fill="white" />
                                    </button>
                                    <div className="flex items-center gap-2 text-red-400">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                        <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">Recording... Click to stop when finished</p>
                                </div>
                            ) : (
                                <button
                                    onClick={startRecording}
                                    className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all mx-auto"
                                >
                                    <Mic size={40} className="text-white" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 2: Processing */}
                    {step === 2 && (
                        <div className="text-center">
                            <Loader2 size={48} className="text-purple-400 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Voice...</h3>
                            <p className="text-slate-400">Extracting pitch, formants, and voice quality metrics.</p>
                        </div>
                    )}

                    {/* Step 3: Results */}
                    {step === 3 && metrics && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Baseline Captured!</h3>

                            {/* Metrics display */}
                            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                                <div className="bg-slate-800 rounded-xl p-4">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Average Pitch</div>
                                    <div className="text-2xl font-bold text-purple-400">
                                        {Math.round(metrics.pitch?.mean || 0)} <span className="text-sm font-normal">Hz</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Range: {Math.round(metrics.pitch?.min || 0)} - {Math.round(metrics.pitch?.max || 0)} Hz
                                    </div>
                                </div>
                                <div className="bg-slate-800 rounded-xl p-4">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Formants</div>
                                    <div className="text-lg font-bold text-pink-400">
                                        F1: {Math.round(metrics.formants?.f1?.mean || 0)} Hz
                                    </div>
                                    <div className="text-lg font-bold text-pink-400">
                                        F2: {Math.round(metrics.formants?.f2?.mean || 0)} Hz
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-6">
                                Your voice baseline has been saved. You'll now see personalized comparisons in your analysis tools.
                            </p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={reset}
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

export default VoiceCalibrationWizard;
