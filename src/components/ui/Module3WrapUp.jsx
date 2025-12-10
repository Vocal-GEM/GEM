import React, { useState } from 'react';
import { Book, CheckCircle, Trophy, Sparkles, AlertCircle } from 'lucide-react';

const Module3WrapUp = ({ onComplete }) => {
    const [checkedResources, setCheckedResources] = useState({});

    const prompts = [
        "I've been told that I’m already an expert at controlling resonance. Do I believe that fully? Why or why not?",
        "How can I bring a sense of curiosity and play to my voice practice?",
        "How can I level up my self-care practice?"
    ];

    const resources = [
        { id: 'meow', title: 'Meow-Yuh', desc: 'Use "Meow" to find bright resonance easily.' },
        { id: 'dog', title: 'Big Dog Little Dog', desc: 'Panting like a small dog creates brightness (no phonation).' },
        { id: 'nasal', title: 'The Nasality Test', desc: 'Pinch your nose! If sound changes, it\'s nasal.' }
    ];

    const toggleResource = (id) => {
        setCheckedResources(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Celebration Header */}
            <div className="text-center space-y-4 py-8 bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500"></div>
                <div className="inline-block p-4 bg-slate-800 rounded-full mb-4 shadow-xl border border-slate-700">
                    <Sparkles className="text-yellow-400 w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-white">Module 3 Complete!</h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                    You have unlocked the secrets of Resonance (R1).
                    The tools for brightening your voice are now in your hands.
                </p>
            </div>

            {/* Journal Prompts */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <Book className="text-pink-500" />
                    <h3 className="text-xl font-bold text-white">Journal Prompts</h3>
                </div>
                <div className="space-y-4">
                    {prompts.map((prompt, i) => (
                        <div key={i} className="p-4 bg-slate-800 rounded-xl border-l-4 border-pink-500">
                            <p className="text-slate-300 italic">"{prompt}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bonus Resources */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-yellow-500" />
                    <h3 className="text-xl font-bold text-white">Bonus Exercises</h3>
                </div>
                <div className="space-y-3">
                    {resources.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => toggleResource(item.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${checkedResources[item.id]
                                ? 'bg-yellow-900/20 border-yellow-500/50'
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                                }`}
                        >
                            <div>
                                <div className={`font-bold ${checkedResources[item.id] ? 'text-yellow-300' : 'text-white'}`}>{item.title}</div>
                                <div className="text-sm text-slate-400">{item.desc}</div>
                            </div>
                            <div className={`p-1 rounded-full ${checkedResources[item.id] ? 'text-yellow-500' : 'text-slate-600'}`}>
                                <CheckCircle size={20} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    Finish Resonance Module
                </button>
            </div>
        </div>
    );
};

export default Module3WrapUp;
