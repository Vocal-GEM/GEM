import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Plus, Trash2, Save, FileText, Smile, Meh, Frown } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const DEFAULT_MODES = [
    { id: 'normal', name: 'Normal / Stranger', description: 'How you speak to someone you just met' },
    { id: 'pet', name: 'Talking to a Pet', description: 'High pitch, affectionate, "baby talk"' },
    { id: 'angry', name: 'Angry / Frustrated', description: 'Feeling upset or annoyed' },
    { id: 'sleepy', name: 'Sleepy / Tired', description: 'Just woke up or about to sleep' },
    { id: 'attention', name: 'Getting Attention', description: 'Shouting "Hey!" to someone across the street' },
    { id: 'comforting', name: 'Comforting Someone', description: 'Speaking softly to soothe a friend' },
    { id: 'excited', name: 'Excited / Surprised', description: 'Reacting to great news' }
];

const VoiceAudit = ({ onComplete }) => {
    const { audioEngineRef } = useAudio();
    const [modes, setModes] = useState(DEFAULT_MODES.map(m => ({ ...m, recordingUrl: null, notes: '', sensation: '' })));
    const [activeRecordingId, setActiveRecordingId] = useState(null);
    const [newModeName, setNewModeName] = useState('');
    const [isAddingMode, setIsAddingMode] = useState(false);

    const toggleRecording = async (id) => {
        if (!audioEngineRef.current) return;

        if (activeRecordingId === id) {
            // Stop recording
            const url = await audioEngineRef.current.stopRecording();
            setModes(prev => prev.map(m => m.id === id ? { ...m, recordingUrl: url } : m));
            setActiveRecordingId(null);
        } else {
            // Start recording
            if (activeRecordingId) {
                // Stop previous if any
                await audioEngineRef.current.stopRecording();
            }
            audioEngineRef.current.startRecording();
            setActiveRecordingId(id);
        }
    };

    const updateModeData = (id, field, value) => {
        setModes(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleAddMode = () => {
        if (!newModeName.trim()) return;
        setModes(prev => [...prev, {
            id: Date.now().toString(),
            name: newModeName,
            description: 'Custom mode',
            recordingUrl: null,
            notes: '',
            sensation: ''
        }]);
        setNewModeName('');
        setIsAddingMode(false);
    };

    const completedCount = modes.filter(m => m.recordingUrl || m.notes).length;

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <FileText className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Voice Audit</h3>
                        <p className="text-slate-400 text-sm">
                            Record the sentence <strong>"Hi, how are you?"</strong> (or any sentence) in as many different ways as you can.
                            Notice how your voice naturally shifts based on context.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {modes.map(mode => (
                        <div key={mode.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Header / Controls */}
                                <div className="sm:w-1/3 space-y-2">
                                    <div>
                                        <h4 className="font-bold text-white">{mode.name}</h4>
                                        <p className="text-xs text-slate-500">{mode.description}</p>
                                    </div>

                                    <button
                                        onClick={() => toggleRecording(mode.id)}
                                        className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${activeRecordingId === mode.id
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : mode.recordingUrl
                                                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {activeRecordingId === mode.id ? (
                                            <><Square size={16} fill="currentColor" /> Stop</>
                                        ) : mode.recordingUrl ? (
                                            <><Play size={16} /> Re-Record</>
                                        ) : (
                                            <><Mic size={16} /> Record</>
                                        )}
                                    </button>

                                    {mode.recordingUrl && (
                                        <audio src={mode.recordingUrl} controls className="w-full h-8 opacity-50 hover:opacity-100 transition-opacity" />
                                    )}
                                </div>

                                {/* Comparison Notes */}
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Physical Sensation (Metaphors welcome!)</label>
                                        <textarea
                                            value={mode.sensation}
                                            onChange={(e) => updateModeData(mode.id, 'sensation', e.target.value)}
                                            placeholder='e.g., "Feels buzzier in my nose", "Like a ghost in a well"...'
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[60px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Emotional Reaction</label>
                                        <input
                                            type="text"
                                            value={mode.notes}
                                            onChange={(e) => updateModeData(mode.id, 'notes', e.target.value)}
                                            placeholder='e.g., "Felt dysphoric", "Neutral", "Surprising"...'
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Mode */}
                    {isAddingMode ? (
                        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 border-dashed flex items-center gap-3">
                            <input
                                type="text"
                                value={newModeName}
                                onChange={(e) => setNewModeName(e.target.value)}
                                placeholder="Name of new mode (e.g., Whispering)"
                                className="flex-1 bg-transparent border-b border-slate-600 focus:border-blue-500 px-2 py-1 text-white focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMode()}
                            />
                            <button onClick={handleAddMode} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"><Save size={16} /></button>
                            <button onClick={() => setIsAddingMode(false)} className="p-2 text-slate-400 hover:text-white"><Trash2 size={16} /></button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingMode(true)}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/30 transition-all flex items-center justify-center gap-2 font-bold"
                        >
                            <Plus size={20} /> Add Another Voice Mode
                        </button>
                    )}
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-2xl">
                <div>
                    <div className="text-sm text-slate-400">Progress</div>
                    <div className="font-bold text-white">{completedCount} / {modes.length} Modes Audited</div>
                </div>
                <button
                    onClick={() => onComplete?.(modes)}
                    disabled={completedCount < 1}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${completedCount > 0
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

export default VoiceAudit;
