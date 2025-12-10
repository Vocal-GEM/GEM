import React, { useState } from 'react';
import { Target, Activity, Wind, Zap, Mic, Waves, Smile, ArrowRight } from 'lucide-react';

const StudentSelfEvaluation = ({ onComplete }) => {
    const [ratings, setRatings] = useState({
        pitch: 0,
        anatomy: 0,
        breath: 0,
        openQuotient: 0,
        resonance: 0,
        tonalConsistency: 0,
        vocalWeight: 0,
        prosody: 0
    });

    const categories = [
        { id: 'pitch', label: 'Pitch', icon: Zap, desc: 'How high or low your voice sounds.' },
        { id: 'anatomy', label: 'Vocal Anatomy', icon: Activity, desc: 'Knowledge of the larynx, cords, and muscles.' },
        { id: 'breath', label: 'Breath Support', icon: Wind, desc: 'Managing air to fuel the voice.' },
        { id: 'openQuotient', label: 'Open/Closed Quotient', icon: Mic, desc: 'Breathiness or "flow" in the sound.' },
        { id: 'resonance', label: 'Resonance', icon: Waves, desc: 'The brightness or darkness (size) of the voice.' },
        { id: 'tonalConsistency', label: 'Tonal Consistency', icon: Target, desc: 'Maintaining quality across vowels.' },
        { id: 'vocalWeight', label: 'Vocal Weight', icon: Zap, desc: 'Heaviness, buzz, or mass in the chords.' },
        { id: 'prosody', label: 'Prosody / Inflection', icon: Smile, desc: 'The melody and rhythm of speech.' }
    ];

    const filledCount = Object.values(ratings).filter(r => r > 0).length;
    const progress = (filledCount / categories.length) * 100;

    const handleRate = (id, value) => {
        setRatings(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Self-Assessment</h2>
                <p className="text-slate-400">
                    Rate your current understanding of these concepts (0 = None, 10 = Expert).
                    <br />It's okay to be at 0! That's why you're here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <cat.icon className="text-indigo-400" size={20} />
                            <div>
                                <div className="font-bold text-white">{cat.label}</div>
                                <div className="text-xs text-slate-400">{cat.desc}</div>
                            </div>
                            <div className="ml-auto text-xl font-bold text-indigo-500">
                                {ratings[cat.id] || '-'}
                            </div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={ratings[cat.id]}
                            onChange={(e) => handleRate(cat.id, parseInt(e.target.value))}
                            className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>
                ))}
            </div>

            {progress === 100 && (
                <div className="flex justify-center pt-4 animate-in slide-in-from-bottom-4">
                    <button
                        onClick={onComplete}
                        className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg flex items-center gap-2"
                    >
                        Save Assessment <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentSelfEvaluation;
