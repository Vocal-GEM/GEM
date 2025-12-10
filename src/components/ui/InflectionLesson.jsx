import React, { useState } from 'react';
import { TrendingUp, Volume2, Music, AlertCircle } from 'lucide-react';

const InflectionLesson = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('concept');
    const [emphasisWord, setEmphasisWord] = useState(null);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Module 6: Inflection</h2>
                <p className="text-slate-400">
                    The &quot;Melody&quot; of speech. How we emphasize words gives them meaning.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
                {[
                    { id: 'concept', label: 'Bouncing vs Barking' },
                    { id: 'meaning', label: 'Changing Meaning' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl min-h-[400px]">
                {activeTab === 'concept' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bouncing */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-indigo-500/30 hover:border-indigo-500 transition-colors">
                                <div className="flex items-center gap-3 text-indigo-400 font-bold mb-4">
                                    <TrendingUp size={24} />
                                    <span>Bouncing (Feminine)</span>
                                </div>
                                <p className="text-slate-300 text-sm mb-4">
                                    Using <strong>Pitch Elevation</strong> to emphasize words.
                                    <br />Like a Disney Princess.
                                </p>
                                <div className="h-24 bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    {/* Simple visual of bouncing line */}
                                    <svg viewBox="0 0 100 40" className="w-full h-full text-indigo-500">
                                        <path d="M10,30 Q30,30 40,10 Q50,30 90,30" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span className="absolute text-xs text-white bg-slate-900 px-2 py-1 rounded top-2">&quot;Really?&quot;</span>
                                </div>
                            </div>

                            {/* Barking */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-yellow-500/30 hover:border-yellow-500 transition-colors">
                                <div className="flex items-center gap-3 text-yellow-500 font-bold mb-4">
                                    <Volume2 size={24} />
                                    <span>Barking (Masculine)</span>
                                </div>
                                <p className="text-slate-300 text-sm mb-4">
                                    Using <strong>Volume/Loudness</strong> to emphasize words.
                                    <br />Like a Drill Sergeant.
                                </p>
                                <div className="h-24 bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    {/* Simple visual of spiking volume */}
                                    <div className="flex items-end gap-1 h-12">
                                        <div className="w-4 h-4 bg-slate-600"></div>
                                        <div className="w-4 h-12 bg-yellow-500"></div>
                                        <div className="w-4 h-4 bg-slate-600"></div>
                                    </div>
                                    <span className="absolute text-xs text-white bg-slate-900 px-2 py-1 rounded top-2">&quot;HEY!&quot;</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900 rounded-xl flex gap-3 text-sm text-slate-400 italic">
                            <AlertCircle size={16} className="shrink-0 mt-1" />
                            <div>
                                &quot;Feminizing is less about how HIGH you speak, and more about how LOW you DON&apos;T speak.
                                Avoid letting the pitch drop into the basement at the end of sentences.&quot;
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'meaning' && (
                    <div className="space-y-8 animate-in fade-in">
                        <h3 className="text-xl font-bold text-white">Click a word to emphasize it:</h3>

                        <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 text-center">
                            <div className="flex flex-wrap justify-center gap-2 text-2xl md:text-3xl font-serif">
                                {['I', 'never', 'said', 'I', 'stole', 'your', 'money'].map((word, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setEmphasisWord(i)}
                                        className={`px-2 rounded transition-all transform ${emphasisWord === i
                                            ? 'bg-indigo-600 text-white scale-110 shadow-lg -translate-y-1 font-bold italic'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {emphasisWord !== null && (
                            <div className="p-6 bg-indigo-900/20 rounded-xl border border-indigo-500/30 text-center animate-in slide-in-from-bottom-2">
                                <h4 className="text-indigo-300 font-bold mb-1">Implied Meaning:</h4>
                                <p className="text-white text-lg">
                                    {getMeaning(emphasisWord)}
                                </p>
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                onClick={onComplete}
                                className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                            >
                                Continue to Exercises
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const getMeaning = (index) => {
    const meanings = [
        "SOMEONE ELSE said it. Not me.", // I
        "I absolutely DENY ever saying it.", // never
        "I implied it, maybe... but I didn't SAW it.", // said
        "I said SOMEONE ELSE stole it.", // I (2)
        "I borrowed it? I invested it? I didn't STEAL it.", // stole
        "I stole SOMEONE ELSE'S money.", // your
        "I stole your CAR? Your HEART? Not your money." // money
    ];
    return meanings[index] || "";
};

export default InflectionLesson;
