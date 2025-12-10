import React, { useState } from 'react';
import { Volume2, Wind, Zap, Music, Plus, Edit3, Trash2, Save, Smile, CloudLightning, Coffee, Radio } from 'lucide-react';

const INSPIRATION_PROMPTS = [
    { label: 'Nature', items: ['🐶 Dog Bark', '🐱 Cat Meow', '🌬️ Wind in Trees', '🦗 Cicada', '🌊 Waterfall'] },
    { label: 'Machines', items: ['🚗 Car Revving', '☢️ Microwave Hum', '☕ Coffee Grinder', '🔌 Static'] },
    { label: 'Abstract', items: ['📉 Descending Gliss', '📈 Ascending Gliss', '👻 Ghost Sound', '🤖 Robot Voice'] }
];

const SoundJournal = ({ onComplete }) => {
    const [entries, setEntries] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [soundName, setSoundName] = useState('');
    const [sensation, setSensation] = useState('');
    const [variations, setVariations] = useState('');
    const [description, setDescription] = useState('');

    const handleAddEntry = () => {
        if (!soundName.trim()) return;
        setEntries(prev => [...prev, {
            id: Date.now(),
            name: soundName,
            sensation,
            variations,
            description,
            timestamp: new Date().toISOString()
        }]);
        resetForm();
    };

    const resetForm = () => {
        setSoundName('');
        setSensation('');
        setVariations('');
        setDescription('');
        setIsAdding(false);
    };

    const usePrompt = (item) => {
        setSoundName(item.split(' ')[1] || item); // Simple split to remove emoji
        setIsAdding(true);
    };

    return (
        <div className="space-y-8">
            {/* Header / Intro */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Music className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Sound Journal</h3>
                        <p className="text-slate-400 text-sm">
                            Explore the bounds of your voice by making "weird" sounds.
                            Don't worry about being feminine right now—just be curious about what your voice <em>can</em> do.
                        </p>
                    </div>
                </div>

                {/* Inspiration Chips */}
                {!isAdding && (
                    <div className="space-y-3 mt-6">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspiration</label>
                        <div className="flex flex-wrap gap-2">
                            {INSPIRATION_PROMPTS.flatMap(cat => cat.items).map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => usePrompt(item)}
                                    className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-purple-500/50 text-slate-300 text-xs transition-all hover:scale-105"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Entry List */}
            <div className="space-y-4">
                {entries.map(entry => (
                    <div key={entry.id} className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-colors group relative">
                        <button
                            onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                            className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/4">
                                <h4 className="font-bold text-white text-lg mb-1">{entry.name}</h4>
                                <div className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-xs font-bold text-purple-400 mb-1">Physical Sensation</div>
                                    <p className="text-slate-300">{entry.sensation || '-'}</p>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-blue-400 mb-1">Variations Tried</div>
                                    <p className="text-slate-300">{entry.variations || '-'}</p>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-green-400 mb-1">Description / Emotion</div>
                                    <p className="text-slate-300">{entry.description || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Entry Form */}
            {isAdding ? (
                <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="font-bold text-indigo-100 mb-4 flex items-center gap-2">
                        <Plus size={18} /> New Sound Entry
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-indigo-300 mb-1">Sound Name</label>
                            <input
                                autoFocus
                                type="text"
                                value={soundName}
                                onChange={(e) => setSoundName(e.target.value)}
                                placeholder="e.g., Microwave Hum"
                                className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-indigo-300 mb-1">Physical Sensation</label>
                            <textarea
                                value={sensation}
                                onChange={(e) => setSensation(e.target.value)}
                                placeholder="Where did you feel vibration? Muscle tension?"
                                className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 h-24"
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-indigo-300 mb-1">Variations</label>
                                <input
                                    type="text"
                                    value={variations}
                                    onChange={(e) => setVariations(e.target.value)}
                                    placeholder="e.g., Louder, different vowels..."
                                    className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-indigo-300 mb-1">Description / Emotion</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g., Felt silly, sounded buzzy"
                                    className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddEntry}
                            disabled={!soundName.trim()}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                        >
                            <Save size={18} /> Save Entry
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-900/10 transition-all flex flex-col items-center justify-center gap-2 font-bold group"
                >
                    <div className="p-3 rounded-full bg-slate-800 group-hover:bg-indigo-600 transition-colors text-white">
                        <Plus size={24} />
                    </div>
                    Log New Sound
                </button>
            )}

            {/* Complete Button */}
            {entries.length > 0 && !isAdding && (
                <div className="flex justify-end pt-8 border-t border-slate-800">
                    <button
                        onClick={() => onComplete?.(entries)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transform hover:scale-[1.02] transition-all"
                    >
                        Complete Session
                    </button>
                </div>
            )}
        </div>
    );
};

export default SoundJournal;
