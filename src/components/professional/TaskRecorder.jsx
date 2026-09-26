import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, Loader2 } from 'lucide-react';

const TaskRecorder = ({ task, onComplete }) => {
    const [state, setState] = useState('idle'); // idle, recording, processing, done
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    // Timer
    useEffect(() => {
        if (state === 'recording') {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [state]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
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

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setAudioBlob(blob);
                setState('done');
                onComplete(task.id, blob); // Notify parent immediately
            };

            recorder.start();
            setState('recording');
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied or not available.");
            setState('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && state === 'recording') {
            mediaRecorderRef.current.stop();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };

    const resetRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setState('idle');
        setRecordingTime(0);
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

    return (
        <div className="bg-slate-800/80 rounded-lg p-4 mb-4 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-white font-medium text-lg">{task.prompt}</h3>
                    {task.text && (
                        <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700 text-slate-300 italic">
                            "{task.prompt.replace('Read: "', '').replace('"', '')}"
                        </div>
                    )}
                    {task.duration && (
                        <p className="text-xs text-slate-400 mt-1">Target duration: {task.duration}s</p>
                    )}
                </div>

                {state === 'done' && (
                    <div className="flex items-center text-green-400 bg-green-900/20 px-3 py-1 rounded-full text-sm">
                        <Check size={14} className="mr-1" /> Completed
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {state === 'idle' && (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-full transition-colors"
                    >
                        <Mic size={18} /> Record
                    </button>
                )}

                {state === 'recording' && (
                    <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full animate-pulse transition-colors"
                    >
                        <Square size={18} fill="currentColor" /> Stop ({formatTime(recordingTime)})
                    </button>
                )}

                {state === 'processing' && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 size={18} className="animate-spin" /> Processing...
                    </div>
                )}

                {state === 'done' && (
                    <div className="flex items-center gap-2">
                        <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                        <button
                            onClick={togglePlayback}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button
                            onClick={resetRecording}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 transition-colors"
                            title="Redo"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <span className="text-xs text-slate-500 ml-2">{formatTime(recordingTime)}</span>
                    </div>
                )}

                {error && <span className="text-red-400 text-sm">{error}</span>}
            </div>
        </div>
    );
};

export default TaskRecorder;
