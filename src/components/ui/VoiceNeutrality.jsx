import React, { useState } from 'react';
import { Scale, MessageCircle, Heart, Shield } from 'lucide-react';

const VoiceNeutrality = ({ onComplete }) => {
    const [activeSection, setActiveSection] = useState('language');

    const examples = [
        { bad: "I sounded terrible.", good: "My pitch dropped at the end of the sentence." },
        { bad: "I can't do this.", good: "I am struggling with the Open Quotient concept." },
        { bad: "That was perfect!", good: "That was tonally consistent." },
    ];

    const affirmations = [
        "I am grateful for my voice.",
        "My voice, my choice!",
        "I give my voice permission to change.",
        "My voice does its best for me.",
        "I deserve to express myself authentically."
    ];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Voice Neutrality</h2>
                <p className="text-slate-400">
                    Self-love is hard. Self-hatred is easy.
                    **Neutrality** is the bridge.
                    We stop judging "Good vs Bad" and start observing "What Happened".
                </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveSection('language')}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeSection === 'language' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                >
                    <MessageCircle size={18} /> Neutral Language
                </button>
                <button
                    onClick={() => setActiveSection('affirmations')}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeSection === 'affirmations' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                >
                    <Heart size={18} /> Affirmations
                </button>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 min-h-[300px]">
                {activeSection === 'language' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-indigo-300 font-bold text-lg mb-4">
                            <Scale size={24} />
                            <span>Judge Less, Describe More</span>
                        </div>
                        <p className="text-slate-300">
                            Instead of saying "I messed up", describe <em>specifically</em> what happened mechanically.
                        </p>
                        <div className="space-y-3">
                            {examples.map((ex, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900 rounded-xl">
                                    <div className="text-red-400 flex flex-col">
                                        <span className="text-xs uppercase font-bold text-red-500/50">Subjective (Judgement)</span>
                                        "{ex.bad}"
                                    </div>
                                    <div className="text-green-400 flex flex-col">
                                        <span className="text-xs uppercase font-bold text-green-500/50">Neutral (Observation)</span>
                                        "{ex.good}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'affirmations' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-pink-300 font-bold text-lg mb-4">
                            <Shield size={24} />
                            <span>Permission to Change</span>
                        </div>
                        <p className="text-slate-300">
                            You don't have to love your voice yet. But you must respect it.
                        </p>
                        <ul className="space-y-3">
                            {affirmations.map((aff, i) => (
                                <li key={i} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg text-white">
                                    <Heart size={16} className="text-pink-500 shrink-0" />
                                    {aff}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Will Be Kind To My Voice
                </button>
            </div>
        </div>
    );
};

export default VoiceNeutrality;
