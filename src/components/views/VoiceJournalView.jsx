import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Calendar, Clock, Music, Plus, X, Tag } from 'lucide-react';
import { getRecordings, saveRecording, deleteRecording, updateRecording } from '../../services/VoiceJournalService';
import { recordPractice } from '../../services/StreakService';

const VoiceJournalView = () => {
    const [recordings, setRecordings] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [playingId, setPlayingId] = useState(null);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [currentBlob, setCurrentBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(new Audio());
    const timerRef = useRef(null);

    useEffect(() => {
        loadRecordings();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const loadRecordings = async () => {
        try {
            const data = await getRecordings();
            setRecordings(data);
        } catch (err) {
            console.error('Failed to load recordings:', err);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setCurrentBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleSave = async () => {
        if (!currentBlob) return;

        try {
            await saveRecording({
                audioBlob: currentBlob,
                notes,
                duration: recordingTime,
                tags: []
            });
            recordPractice(); // Count as practice for streak
            setShowRecordModal(false);
            setCurrentBlob(null);
            setNotes('');
            setRecordingTime(0);
            loadRecordings();
        } catch (err) {
            console.error('Failed to save recording:', err);
        }
    };

    const handlePlay = (recording) => {
        if (playingId === recording.id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            const url = URL.createObjectURL(recording.audioBlob);
            audioRef.current.src = url;
            audioRef.current.play();
            setPlayingId(recording.id);

            audioRef.current.onended = () => {
                setPlayingId(null);
                URL.revokeObjectURL(url);
            };
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this recording?')) {
            await deleteRecording(id);
            loadRecordings();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Voice Journal</h1>
                    <p className="text-slate-400">Track your voice progress over time</p>
                </div>
                <button
                    onClick={() => setShowRecordModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                >
                    <Plus size={20} /> New Recording
                </button>
            </div>

            {/* Recordings Timeline */}
            <div className="space-y-4">
                {recordings.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
                        <Mic size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">No recordings yet</p>
                        <p className="text-slate-500 text-sm">Start journaling to track your voice progress!</p>
                    </div>
                ) : (
                    recordings.map(recording => (
                        <div
                            key={recording.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Play Button */}
                                <button
                                    onClick={() => handlePlay(recording)}
                                    className={`p-4 rounded-full transition-colors ${playingId === recording.id
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    {playingId === recording.id ? <Pause size={24} /> : <Play size={24} />}
                                </button>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} /> {formatDate(recording.timestamp)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> {formatTime(recording.duration)}
                                        </span>
                                        {recording.pitchData && (
                                            <span className="flex items-center gap-1 text-pink-400">
                                                <Music size={14} /> {Math.round(recording.pitchData.avg)}Hz
                                            </span>
                                        )}
                                    </div>
                                    {recording.notes && (
                                        <p className="text-slate-300 text-sm">{recording.notes}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => handleDelete(recording.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Record Modal */}
            {showRecordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">New Recording</h2>
                            <button onClick={() => { setShowRecordModal(false); setCurrentBlob(null); }} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Recording UI */}
                        <div className="text-center mb-6">
                            {!currentBlob ? (
                                <>
                                    <div className="text-4xl font-mono text-white mb-4">{formatTime(recordingTime)}</div>
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${isRecording
                                                ? 'bg-red-500 animate-pulse'
                                                : 'bg-pink-500 hover:bg-pink-400'
                                            }`}
                                    >
                                        {isRecording ? <Square size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                                    </button>
                                    <p className="text-slate-400 text-sm mt-4">
                                        {isRecording ? 'Tap to stop' : 'Tap to start recording'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-emerald-400 text-lg mb-4">✓ Recording saved ({formatTime(recordingTime)})</div>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes about this recording..."
                                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
                                        rows={3}
                                    />
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        {currentBlob && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setCurrentBlob(null); setRecordingTime(0); }}
                                    className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700"
                                >
                                    Re-record
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceJournalView;
