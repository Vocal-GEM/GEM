import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, Loader2, HelpCircle } from 'lucide-react';
import { useGuidedJourney } from '../../context/GuidedJourneyContext';
import { indexedDB } from '../../services/IndexedDBManager';
import { VoiceCalibrationService } from '../../services/VoiceCalibrationService';
import MicQualityTips from './MicQualityTips';

/**
 * BaselineRecorder - Records baseline voice samples for the guided journey
 * Saves recordings to IndexedDB with a special baseline tag
 * Now also extracts and saves voice metrics (pitch, formants, SPL)
 */
const BaselineRecorder = ({ instruction, promptText, onRecordingComplete }) => {
    const { saveBaselineRecording, saveVoiceBaseline, baselineRecording } = useGuidedJourney();

    const [state, setState] = useState('idle'); // idle, recording, processing, done
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);
    const [showMicTips, setShowMicTips] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    // Check for existing baseline on mount
    useEffect(() => {
        if (baselineRecording?.data?.url) {
            setAudioUrl(baselineRecording.data.url);
            setState('done');
        }
    }, [baselineRecording]);

    // Timer for recording duration
    useEffect(() => {
        if (state === 'recording') {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [state]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioUrl && !baselineRecording) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl, baselineRecording]);

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

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            // Determine supported mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                setState('processing');

                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Save to IndexedDB with baseline tag
                try {
                    // Extract voice metrics from the recording
                    let voiceMetrics = null;
                    try {
                        voiceMetrics = await VoiceCalibrationService.analyzeBaseline(audioBlob);
                        console.log('[BaselineRecorder] Voice metrics extracted:', voiceMetrics);

                        // Save to VoiceCalibrationService's localStorage (for standalone access)
                        VoiceCalibrationService.saveBaseline(voiceMetrics);

                        // Also save to journey context
                        saveVoiceBaseline(voiceMetrics);
                    } catch (metricsError) {
                        console.warn('[BaselineRecorder] Failed to extract voice metrics:', metricsError);
                        // Continue without metrics - recording is still saved
                    }

                    // Create recording object
                    const recordingData = {
                        id: 'baseline_' + Date.now(),
                        name: 'Baseline Recording',
                        type: 'baseline',
                        blob: audioBlob, // Store blob directly
                        url: url, // Note: URL is ephemeral, but useful for current session
                        timestamp: new Date().toISOString(),
                        duration: recordingTime,
                        mimeType: mimeType,
                        voiceMetrics: voiceMetrics // Include extracted metrics
                    };

                    // Use the new saveRecording method
                    await indexedDB.saveRecording(recordingData);

                    // Save reference in guided journey context (keep this for backward compatibility or context flow)
                    saveBaselineRecording({
                        url,
                        timestamp: recordingData.timestamp,
                        duration: recordingData.duration,
                        hasMetrics: !!voiceMetrics
                    });

                    setState('done');
                    onRecordingComplete?.();
                } catch (saveError) {
                    console.error('Failed to save baseline:', saveError);
                    setError('Failed to save recording. Please try again.');
                    setState('idle');
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(100); // Collect data every 100ms
            setState('recording');
        } catch (err) {
            console.error('Error starting recording:', err);
            setError(err.name === 'NotAllowedError'
                ? 'Microphone access denied. Please allow microphone access to record.'
                : 'Could not start recording. Please check your microphone.');
            setState('idle');
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const resetRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);
        setState('idle');
        setRecordingTime(0);
        setError(null);
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

    // Handle audio ended
    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-pink-500/20 p-6">
            {/* Header */}
            <div className="text-center mb-6 relative">
                {/* Mic Quality Tips Button */}
                <button
                    onClick={() => setShowMicTips(true)}
                    className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-pink-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Recording Tips"
                >
                    <HelpCircle size={18} />
                </button>

                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-slate-300">{instruction || 'Record your baseline voice sample'}</p>
                {promptText && (
                    <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Read this aloud:</p>
                        <p className="text-white font-medium italic">&quot;{promptText}&quot;</p>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Recording controls */}
            <div className="flex flex-col items-center gap-4">
                {state === 'idle' && (
                    <button
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 
                                   flex items-center justify-center shadow-lg shadow-pink-500/20 
                                   hover:shadow-pink-500/40 hover:scale-105 transition-all group"
                    >
                        <Mic className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                    </button>
                )}

                {state === 'recording' && (
                    <>
                        <div className="relative">
                            <button
                                onClick={stopRecording}
                                className="w-20 h-20 rounded-full bg-red-500 animate-pulse
                                           flex items-center justify-center shadow-lg shadow-red-500/30 
                                           hover:bg-red-600 transition-colors relative z-10"
                            >
                                <Square className="w-8 h-8 text-white" fill="white" />
                            </button>
                            {/* Recording indicator ring - pointer-events-none so it doesn't block clicks */}
                            <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping pointer-events-none" />
                        </div>
                        <div className="flex items-center gap-2 text-red-400">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                        </div>
                        <p className="text-sm text-slate-400">Recording... Click to stop</p>
                    </>
                )}

                {state === 'processing' && (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-12 h-12 text-pink-400 animate-spin" />
                        <p className="text-slate-400">Saving recording...</p>
                    </div>
                )}

                {state === 'done' && audioUrl && (
                    <>
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={handleAudioEnded}
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={togglePlayback}
                                className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500
                                           flex items-center justify-center shadow-lg shadow-green-500/20 
                                           hover:shadow-green-500/40 hover:scale-105 transition-all"
                            >
                                {isPlaying ? (
                                    <Pause className="w-7 h-7 text-white" />
                                ) : (
                                    <Play className="w-7 h-7 text-white ml-1" />
                                )}
                            </button>
                            <button
                                onClick={resetRecording}
                                className="w-12 h-12 rounded-full bg-slate-700 
                                           flex items-center justify-center 
                                           hover:bg-slate-600 transition-colors"
                                title="Record again"
                            >
                                <RotateCcw className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">Baseline recorded!</span>
                        </div>
                        <p className="text-xs text-slate-500 text-center">
                            This recording will be saved for comparison as you progress through your journey.
                        </p>
                    </>
                )}
            </div>

            {/* Instructions */}
            {state === 'idle' && (
                <p className="text-center text-xs text-slate-500 mt-4">
                    Tap the button above to start recording
                </p>
            )}

            {/* Mic Quality Tips Modal */}
            {showMicTips && (
                <MicQualityTips onClose={() => setShowMicTips(false)} />
            )}
        </div>
    );
};

export default BaselineRecorder;
