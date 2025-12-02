import React, { useState, useEffect } from 'react';
import { Mic, Square, Save, X } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const ClipCapture = ({ onCapture }) => {
    const { startRecording, stopRecording, isRecording, isAudioActive, toggleAudio } = useAudio();
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleToggle = async () => {
        if (isRecording) {
            const result = await stopRecording();
            if (result && onCapture) {
                onCapture(result);
            }
        } else {
            startRecording();
        }
    };

    if (!isAudioActive) {
        return (
            <button
                onClick={toggleAudio}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
            >
                <Mic size={12} />
                <span>Enable Mic</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                    }`}
            >
                {isRecording ? (
                    <>
                        <Square size={12} fill="currentColor" />
                        <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                    </>
                ) : (
                    <>
                        <Mic size={12} />
                        <span>Record Clip</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ClipCapture;
