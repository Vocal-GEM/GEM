import { useState, useEffect } from 'react';
import { Save, Loader2, StickyNote, Check } from 'lucide-react';
import { indexedDB } from '../../services/IndexedDBManager';

const ModuleNotes = ({ moduleId, moduleTitle }) => {
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('loading'); // loading, idle, saving, saved, error
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        loadNote();
    }, [moduleId]);

    const loadNote = async () => {
        try {
            setStatus('loading');
            const data = await indexedDB.getModuleNote(moduleId);
            if (data) {
                setNote(data.content || '');
                setLastSaved(data.updatedAt);
            } else {
                setNote('');
                setLastSaved(null);
            }
            setStatus('idle');
        } catch (error) {
            console.error("Failed to load note:", error);
            setStatus('error');
        }
    };

    const handleSave = async () => {
        if (!moduleId) return;

        try {
            setStatus('saving');
            await indexedDB.saveModuleNote(moduleId, note);
            setLastSaved(Date.now());
            setStatus('saved');

            // Reset back to idle after a moment
            setTimeout(() => {
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error("Failed to save note:", error);
            setStatus('error');
        }
    };

    // Auto-save on blur or periodic could be added, 
    // but explicit save is safer for v1 to avoid overwriting data accidentally.
    // Let's add Ctrl+S support
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <div className="mt-8 bg-slate-900/50 rounded-2xl border border-indigo-500/20 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800/50 px-4 py-3 border-b border-indigo-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300">
                    <StickyNote className="w-5 h-5" />
                    <h3 className="font-bold text-sm">My Notes: {moduleTitle}</h3>
                </div>

                <div className="flex items-center gap-3">
                    {lastSaved && (
                        <span className="text-xs text-slate-500">
                            Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={status === 'saving' || status === 'loading'}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                            ${status === 'saved'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {status === 'saving' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : status === 'saved' ? (
                            <Check className="w-3.5 h-3.5" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        {status === 'saved' ? 'Saved' : 'Save Note'}
                    </button>
                </div>
            </div>

            {/* Note Input */}
            <div className="relative">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Write your thoughts, key takeaways, or practice reminders for ${moduleTitle}...`}
                    className="w-full h-48 bg-transparent text-slate-300 p-4 resize-y focus:outline-none focus:bg-slate-800/20 transition-colors placeholder:text-slate-600 text-sm leading-relaxed"
                />

                {status === 'loading' && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                )}
            </div>

            <div className="bg-slate-800/30 px-4 py-2 border-t border-white/5 text-[10px] text-slate-500 flex justify-between">
                <span>Notes are saved locally to your device.</span>
                <span>Pro tip: Press Ctrl+S to save</span>
            </div>
        </div>
    );
};

export default ModuleNotes;
