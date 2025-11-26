import React, { useState, useEffect, useRef } from 'react';
import { useClient } from '../../context/ClientContext';
import { Save, Clock, FileText } from 'lucide-react';

const SessionNotes = () => {
    const { activeClient, updateClient } = useClient();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const timeoutRef = useRef(null);

    // Load notes when active client changes
    useEffect(() => {
        if (activeClient) {
            setNotes(activeClient.notes || '');
        } else {
            setNotes('');
        }
    }, [activeClient]);

    // Auto-save logic
    const handleNotesChange = (e) => {
        const newNotes = e.target.value;
        setNotes(newNotes);
        setIsSaving(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            if (activeClient) {
                await updateClient({
                    ...activeClient,
                    notes: newNotes,
                    lastModified: new Date().toISOString()
                });
                setIsSaving(false);
                setLastSaved(new Date());
            }
        }, 1000); // Debounce 1s
    };

    if (!activeClient) {
        return (
            <div className="glass-panel-dark rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <FileText className="text-slate-600" />
                </div>
                <h3 className="text-slate-400 font-bold">No Client Selected</h3>
                <p className="text-xs text-slate-500 mt-1">Select a client to view and edit notes.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel-dark rounded-2xl p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-400" />
                    <h3 className="font-bold text-slate-200">Clinical Notes</h3>
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    {isSaving ? (
                        <span className="text-yellow-500 animate-pulse">Saving...</span>
                    ) : lastSaved ? (
                        <span className="flex items-center gap-1">
                            <Save size={10} />
                            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    ) : (
                        <span>Ready</span>
                    )}
                </div>
            </div>

            <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Enter session observations, goals, and homework..."
                className="flex-1 w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all resize-none font-sans leading-relaxed"
                spellCheck="false"
            />

            <div className="mt-3 flex justify-between items-center">
                <div className="text-[10px] text-slate-600 font-mono">
                    ID: {activeClient.id.slice(0, 8)}...
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-400 transition-colors">
                        Timestamp
                    </button>
                    <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-bold transition-colors">
                        Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionNotes;
