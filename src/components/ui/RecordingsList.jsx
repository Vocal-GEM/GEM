import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, Download, Edit2, Check, X, Mic, Calendar, Clock, Loader2 } from 'lucide-react';
import { indexedDB } from '../../services/IndexedDBManager';

const RecordingsList = () => {
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    // Audio playback refs
    const audioRef = useRef(new Audio());
    const [audioUrl, setAudioUrl] = useState(null);

    useEffect(() => {
        loadRecordings();
        const audio = audioRef.current;

        // Cleanup audio URL on unmount
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (audio) audio.pause();
        };
    }, [audioUrl]);

    const loadRecordings = async () => {
        try {
            setLoading(true);
            const data = await indexedDB.getRecordings();
            setRecordings(data);
        } catch (error) {
            console.error("Failed to load recordings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = (recording) => {
        if (playingId === recording.id) {
            audioRef.current.pause();
            setPlayingId(null);
            return;
        }

        // Cleanup previous
        if (audioUrl) URL.revokeObjectURL(audioUrl);

        // Create new URL from blob
        const url = URL.createObjectURL(recording.blob);
        setAudioUrl(url);

        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingId(recording.id);

        audioRef.current.onended = () => {
            setPlayingId(null);
        };
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recording?')) return;

        try {
            await indexedDB.deleteRecording(id);
            if (playingId === id) {
                audioRef.current.pause();
                setPlayingId(null);
            }
            // Optimistic update
            setRecordings(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to delete recording:", error);
        }
    };

    const handleDownload = (recording) => {
        const url = URL.createObjectURL(recording.blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // Sanitized filename
        const safeName = (recording.name || 'recording').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `${safeName}_${new Date(recording.timestamp).toISOString().split('T')[0]}.webm`; // Assuming webm for now
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const startEditing = (recording) => {
        setEditingId(recording.id);
        setEditName(recording.name || 'Untitled Recording');
    };

    const saveEdit = async (recording) => {
        try {
            const updatedRecording = { ...recording, name: editName };
            await indexedDB.saveRecording(updatedRecording);
            setRecordings(prev => prev.map(r => r.id === recording.id ? updatedRecording : r));
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update recording:", error);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (recordings.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500">
                <Mic className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No recordings found.</p>
                <p className="text-xs mt-1">Record a baseline or practice session to see it here.</p>
            </div>
        );
    }

    return (
        <div id="recordings-list" className="space-y-3">
            {recordings.map((recording, index) => (
                <div key={recording.id} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-4 transition-all group">
                    <div className="flex items-center justify-between gap-4">

                        {/* Play Button */}
                        <button
                            id={index === 0 ? 'recording-play-btn' : undefined}
                            onClick={() => handlePlay(recording)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${playingId === recording.id
                                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {playingId === recording.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>

                        {/* Info / Edit Input */}
                        <div className="flex-1 min-w-0">
                            {editingId === recording.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-slate-900 border border-violet-500 rounded px-2 py-1 text-sm text-white focus:outline-none w-full"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(recording)}
                                    />
                                    <button onClick={() => saveEdit(recording)} className="p-1 hover:text-green-400 text-slate-400"><Check size={16} /></button>
                                    <button onClick={cancelEdit} className="p-1 hover:text-red-400 text-slate-400"><X size={16} /></button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-white truncate">{recording.name || 'Untitled Recording'}</h4>
                                        <button
                                            id={index === 0 ? 'recording-edit-btn' : undefined}
                                            onClick={() => startEditing(recording)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-violet-400 transition-opacity"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    </div>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(recording.timestamp).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(recording.duration)}</span>
                                        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-slate-300">{recording.type || 'audio'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleDownload(recording)}
                                title="Download"
                                className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <Download size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(recording.id)}
                                title="Delete"
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecordingsList;
