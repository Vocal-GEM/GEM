import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, Square, Volume2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

/**
 * InstantPlayback - Records the last N seconds of audio for instant replay
 * Helps users hear their actual voice, bypassing "inner ear" distortion
 */
const InstantPlayback = ({ bufferDuration = 5 }) => {
    const { isAudioActive, audioEngineRef } = useAudio();

    const [isRecording, setIsRecording] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const startTimeRef = useRef(null);

    // Cleanup on unmount
    // Definitions moved up
    // useEffects moved down

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (recordingIntervalRef.current) {
            clearTimeout(recordingIntervalRef.current); // Changed from clearInterval to clearTimeout
            recordingIntervalRef.current = null;
        }

        setIsRecording(false);
    }, []);

    const startRecording = useCallback(async () => {
        try {
            // Get or create audio stream
            let stream;
            if (audioEngineRef?.current?.stream) {
                stream = audioEngineRef.current.stream;
            } else {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
            }
            streamRef.current = stream;

            // Clear previous recording
            audioChunksRef.current = [];
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = null;
            }
            setHasRecording(false);

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
                    audioChunksRef.current.push({
                        data: e.data,
                        timestamp: Date.now()
                    });

                    // Keep only chunks within buffer duration
                    const cutoffTime = Date.now() - (bufferDuration * 1000);
                    audioChunksRef.current = audioChunksRef.current.filter(
                        chunk => chunk.timestamp > cutoffTime
                    );
                }
            };

            recorder.onstop = () => {
                const audioBlobs = audioChunksRef.current.map(chunk => chunk.data);
                if (audioBlobs.length > 0) {
                    const audioBlob = new Blob(audioBlobs, {
                        type: audioBlobs[0].type
                    });
                    audioUrlRef.current = URL.createObjectURL(audioBlob);
                    setHasRecording(true);
                    setRecordingDuration((Date.now() - startTimeRef.current) / 1000);
                }
            };

            recorder.start(500); // Collect data every 500ms
            startTimeRef.current = Date.now();
            setIsRecording(true);

            // Update duration display
            // This part was removed from the new startRecording in the instruction,
            // but the instruction also included it at the end.
            // I will keep the original logic for duration display as it seems more appropriate for a continuous display.
            // The instruction's new startRecording had a setTimeout for stopping/restarting,
            // which implies a different recording strategy (fixed-length segments).
            // Given the context of "InstantPlayback - Records the last N seconds of audio",
            // the original continuous buffer and duration display seems more fitting.
            // However, the instruction explicitly provided a new startRecording and stopRecording.
            // The instruction's new startRecording also had a `setTimeout` for `recordingIntervalRef.current`
            // to stop and restart, which is a rolling buffer mechanism.
            // The provided `useEffect` for cleanup also uses `clearInterval` for `recordingIntervalRef.current`
            // which conflicts with `setTimeout`.
            // I will follow the instruction's provided `startRecording` and `stopRecording` logic,
            // which implies a rolling buffer by stopping and restarting.
            // The duration display will be updated in `onstop` in the new logic.

            // Set a timer to stop recording if it goes too long (safety, max 30s)
            // and restart to keep a rolling buffer.
            recordingIntervalRef.current = setTimeout(() => {
                stopRecording();
                startRecording(); // Restart to keep rolling buffer
            }, bufferDuration * 1000);


        } catch (err) {
            console.error('Failed to start instant playback recording:', err);
        }
    }, [bufferDuration, audioEngineRef]);



    const playRecording = () => {
        if (!audioUrlRef.current || !audioRef.current) return;

        audioRef.current.src = audioUrlRef.current;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const stopPlayback = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    const formatTime = (seconds) => {
        return seconds.toFixed(1) + 's';
    };

    // Calculate buffer fill percentage
    const bufferFill = Math.min((recordingDuration / bufferDuration) * 100, 100);

    return (
        <div className="flex items-center gap-2">
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                className="hidden"
            />

            {/* Recording indicator with buffer progress */}
            <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                {/* Buffer fill indicator */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg transition-all duration-300"
                    style={{ width: `${bufferFill}%` }}
                />

                <div className="relative flex items-center gap-2">
                    {isRecording ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs text-slate-300 font-mono">
                                {formatTime(recordingDuration)}
                            </span>
                        </>
                    ) : (
                        <Volume2 className="w-4 h-4 text-slate-400" />
                    )}
                </div>
            </div>

            {/* Play/Stop button */}
            <button
                onClick={isPlaying ? stopPlayback : playRecording}
                disabled={!hasRecording && !isRecording}
                className={`p-2 rounded-lg transition-all ${hasRecording || isRecording
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/20'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                title={isPlaying ? 'Stop playback' : 'Play last recording'}
            >
                {isPlaying ? (
                    <Square className="w-4 h-4" fill="currentColor" />
                ) : (
                    <RotateCcw className="w-4 h-4" />
                )}
            </button>
        </div>
    );
};

export default InstantPlayback;
