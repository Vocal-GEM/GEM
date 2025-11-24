import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useGem } from '../../context/GemContext';

const JournalForm = ({ onSubmit, onCancel }) => {
    const { audioEngineRef } = useGem();
    const [notes, setNotes] = useState('');
    const [script, setScript] = useState('');
    const [effort, setEffort] = useState(5);
    const [confidence, setConfidence] = useState(5);
    const [sentiment, setSentiment] = useState(3); // 1-5 scale
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlobUrl, setAudioBlobUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef(null);

    const toggleRecording = async () => {
        if (!audioEngineRef.current) return;

        if (isRecording) {
            // Stop
            const url = await audioEngineRef.current.stopRecording();
            setAudioBlobUrl(url);
            setIsRecording(false);
            clearInterval(timerRef.current);
        } else {
            // Start
            audioEngineRef.current.startRecording();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        let uploadedUrl = null;
        if (audioBlobUrl) {
            try {
                const blob = await fetch(audioBlobUrl).then(r => r.blob());
                const formData = new FormData();
                formData.append('file', blob, 'recording.ogg');

                const API_URL = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    uploadedUrl = data.url;
                } else {
                    console.warn("Audio upload failed, saving text only.");
                }
            } catch (err) {
                console.warn("Upload failed (network error?), saving text only.", err);
            }
        }

        // Call parent handler
        if (onSubmit) {
            onSubmit({
                notes,
                script,
                effort,
                confidence,
                sentiment,
                audioUrl: uploadedUrl,
                timestamp: Date.now()
            });
        }

        setIsSubmitting(false);
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-4 rounded-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Log Practice Session</h3>

            {/* Script Input */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Reading Script (Optional)</label>
                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 min-h-[60px] text-sm"
                    placeholder="Paste text here to read while recording..."
                ></textarea>
            </div>

            {/* Audio Recorder */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-3">
                <div className="text-2xl font-mono font-bold text-slate-200">{formatTime(recordingTime)}</div>

                {!audioBlobUrl ? (
                    <button
                        type="button"
                        onClick={toggleRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-600 hover:bg-red-500'}`}
                    >
                        {isRecording ? <div className="w-6 h-6 bg-white rounded-sm"></div> : <div className="w-6 h-6 bg-white rounded-full"></div>}
                    </button>
                ) : (
                    <div className="w-full flex items-center gap-2">
                        <audio src={audioBlobUrl} controls className="w-full h-8" />
                        <button type="button" onClick={() => setAudioBlobUrl(null)} className="p-2 text-red-400 hover:text-red-300"><Trash2 /></button>
                    </div>
                )}
                <p className="text-xs text-slate-500">{isRecording ? 'Recording... Read your script!' : 'Tap to record your voice'}</p>
            </div>

            {/* Notes */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">How did it feel?</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
                    placeholder="Describe your sensations, challenges, or wins..."
                ></textarea>
            </div>

            {/* Emotional Check-In */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">How does your voice feel?</label>
                <div className="flex justify-between gap-2">
                    {[
                        { emoji: '😞', value: 1, label: 'Dysphoric' },
                        { emoji: '😕', value: 2, label: 'Uncomfortable' },
                        { emoji: '😐', value: 3, label: 'Neutral' },
                        { emoji: '🙂', value: 4, label: 'Good' },
                        { emoji: '😊', value: 5, label: 'Euphoric' }
                    ].map(({ emoji, value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setSentiment(value)}
                            className={`flex-1 p-3 rounded-xl border transition-all ${sentiment === value
                                ? 'bg-blue-600 border-blue-500 scale-110'
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                                }`}
                            title={label}
                        >
                            <div className="text-2xl">{emoji}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Effort (1-10)</label>
                    <input type="range" min="1" max="10" value={effort} onChange={(e) => setEffort(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    <div className="text-center text-blue-400 font-bold">{effort}</div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Confidence (1-10)</label>
                    <input type="range" min="1" max="10" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    <div className="text-center text-emerald-400 font-bold">{confidence}</div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 ${isSubmitting ? 'bg-blue-800 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                    {isSubmitting ? 'Saving...' : 'Save Log'}
                </button>
            </div>
        </form>
    );
};

export default JournalForm;
