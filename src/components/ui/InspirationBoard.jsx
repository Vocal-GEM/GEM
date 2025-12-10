import React, { useState } from 'react';
import { User, Star, ThumbsUp, ThumbsDown, Plus, Trash2, Heart, Save, Mic2 } from 'lucide-react';

const InspirationBoard = ({ onComplete }) => {
    const [voices, setVoices] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('Public Figure');
    const [feelings, setFeelings] = useState('');
    const [likes, setLikes] = useState('');
    const [dislikes, setDislikes] = useState('');

    const handleAddVoice = () => {
        if (!name.trim()) return;
        setVoices(prev => [...prev, {
            id: Date.now(),
            name,
            relation,
            feelings,
            likes,
            dislikes,
            isTopPick: false
        }]);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setRelation('Public Figure');
        setFeelings('');
        setLikes('');
        setDislikes('');
        setIsAdding(false);
    };

    const toggleTopPick = (id) => {
        setVoices(prev => prev.map(v => v.id === id ? { ...v, isTopPick: !v.isTopPick } : v));
    };

    const topPicksCount = voices.filter(v => v.isTopPick).length;

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-pink-500/20 rounded-xl">
                        <User className="text-pink-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Inspiration List</h3>
                        <p className="text-slate-400 text-sm">
                            List voices you know—friends, family, or public figures.
                            Identify what triggers **strong feelings** (euphoria, jealousy, or even dislike).
                        </p>
                    </div>
                </div>

                {/* List */}
                <div className="grid gap-4 mb-6">
                    {voices.map(voice => (
                        <div key={voice.id} className={`bg-slate-900/80 rounded-xl p-4 border transition-all ${voice.isTopPick ? 'border-yellow-500/50 shadow-lg shadow-yellow-900/10' : 'border-slate-800 hover:border-slate-700'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-lg">{voice.name}</h4>
                                        <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-full text-slate-400 border border-slate-700">{voice.relation}</span>
                                    </div>
                                    <p className="text-sm text-pink-300 italic mb-3">&quot;{voice.feelings}&quot;</p>

                                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                                        <div className="flex items-start gap-2 text-slate-400">
                                            <ThumbsUp size={14} className="mt-0.5 text-green-400" />
                                            <span>{voice.likes || 'Nothing specific'}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-slate-400">
                                            <ThumbsDown size={14} className="mt-0.5 text-red-400" />
                                            <span>{voice.dislikes || 'Nothing specific'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={() => toggleTopPick(voice.id)}
                                        className={`p-2 rounded-full transition-all ${voice.isTopPick ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-600 hover:text-yellow-400 hover:bg-slate-800'}`}
                                        title="Mark as Top Pick for imitation"
                                    >
                                        <Star size={20} fill={voice.isTopPick ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={() => setVoices(prev => prev.filter(v => v.id !== voice.id))}
                                        className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Form */}
                {isAdding ? (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Plus size={18} /> Add New Voice
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-pink-500"
                                    placeholder="e.g. Beyoncé"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Relation</label>
                                <select
                                    value={relation}
                                    onChange={(e) => setRelation(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-pink-500"
                                >
                                    <option>Public Figure</option>
                                    <option>Friend</option>
                                    <option>Family</option>
                                    <option>Teacher</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 mb-1">Strong Feelings?</label>
                                <input
                                    type="text"
                                    value={feelings}
                                    onChange={(e) => setFeelings(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-pink-500"
                                    placeholder="e.g. Jealousy, comfort, repulsion..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">What do you LIKE?</label>
                                <input
                                    type="text"
                                    value={likes}
                                    onChange={(e) => setLikes(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-pink-500"
                                    placeholder="e.g. Warmth, clarity..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">What do you DISLIKE?</label>
                                <input
                                    type="text"
                                    value={dislikes}
                                    onChange={(e) => setDislikes(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-pink-500"
                                    placeholder="e.g. Nasality, too quiet..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                            <button
                                onClick={handleAddVoice}
                                disabled={!name}
                                className="px-6 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-lg font-bold"
                            >
                                Add Voice
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 border-2 border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus size={20} /> Add A Voice
                    </button>
                )}
            </div>

            {/* Sticky Requirements Bar */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${topPicksCount >= 1 ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-800/50 border-slate-700'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${topPicksCount >= 1 ? 'bg-green-500' : 'bg-slate-700'}`}>
                        {topPicksCount >= 1 ? <ThumbsUp size={16} className="text-white" /> : <Star size={16} className="text-slate-400" />}
                    </div>
                    <div>
                        <div className={`font-bold ${topPicksCount >= 1 ? 'text-green-400' : 'text-slate-300'}`}>
                            Select Top Picks
                        </div>
                        <div className="text-xs text-slate-500">Star at least 1 voice to use for imitation practice.</div>
                    </div>
                </div>

                <button
                    onClick={() => onComplete?.(voices.filter(v => v.isTopPick))}
                    disabled={topPicksCount < 1}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${topPicksCount >= 1
                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                >
                    Save Picks
                </button>
            </div>
        </div>
    );
};

export default InspirationBoard;
