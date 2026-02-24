import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Check, Loader2 } from 'lucide-react';

const TaskRecorder = ({ task, onComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                setIsProcessing(false);
                onComplete && onComplete(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            setError(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const resetRecording = () => {
        setAudioUrl(null);
        setRecordingTime(0);
        setIsPlaying(false);
        if (onComplete) onComplete(null); // Clear completion
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-800/80 rounded-lg p-4 mb-4 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-white font-medium text-lg">{task.prompt}</h3>
                    {task.type === 'reading' && (
                        <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700 text-slate-300 italic">
                            &quot;{task.prompt.replace('Read: &quot;', '').replace('&quot;', '')}&quot;
                        </div>
                    )}
                    {task.duration && (
                        <p className="text-xs text-slate-400 mt-1">Target duration: {task.duration}s</p>
                    )}
                </div>
                {audioUrl && (
                    <div className="flex items-center text-green-400 bg-green-900/20 px-3 py-1 rounded-full text-sm">
                        <Check size={14} className="mr-1" /> Completed
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {!audioUrl ? (
                    !isRecording ? (
                        <button
                            onClick={startRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-full transition-colors"
                        >
                            <Mic size={18} /> Record Answer
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full animate-pulse transition-colors"
                        >
                            <Square size={18} fill="currentColor" /> Stop ({formatTime(recordingTime)})
                        </button>
                    )
                ) : (
                    isProcessing ? (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Loader2 size={18} className="animate-spin" /> Processing...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                            <button
                                onClick={togglePlayback}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
                            >
                                {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
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
                    )
                )}
                {error && <span className="text-red-400 text-sm">{error}</span>}
            </div>
        </div>
    );
};

export default TaskRecorder;
