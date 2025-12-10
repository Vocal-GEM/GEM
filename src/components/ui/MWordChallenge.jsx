import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Lock, CheckCircle, Unlock } from 'lucide-react';

const LEVELS = [
    {
        id: 'vowels',
        title: 'Level 1: Vowels',
        desc: 'Slide from "Umm" into the vowel. Keep the energy up!',
        items: ["Moo", "Me", "Meh", "Moh", "May", "Maw", "My", "Mao"]
    },
    {
        id: '1syll',
        title: 'Level 2: One Syllable',
        desc: 'Now add a consonant at the end. Don\'t let the pitch drop!',
        items: ["Mood", "Move", "Moon", "Muse", "Make", "Mean", "Mouth", "Mind"]
    },
    {
        id: '2syll',
        title: 'Level 3: Two Syllables',
        desc: 'Endurance test. Stay bright through the second syllable.',
        items: ["Moonlight", "Music", "Moment", "Making", "Maybe", "Money", "Mirror", "Mountain"]
    },
    {
        id: '3syll',
        title: 'Level 4: Three Syllables',
        desc: 'advanced endurance.',
        items: ["Momentous", "Marshmallow", "Memory", "Manager", "Maximum", "Medicine"]
    },
    {
        id: '4syll',
        title: 'Level 5: Four Syllables',
        desc: 'Expert mode.',
        items: ["Medicinal", "Malleable", "Magnificent", "Material", "Memorial", "Majority"]
    },
    {
        id: 'phrases',
        title: 'Level 6: Short Phrases',
        desc: 'Putting it into context.',
        items: ["Me and You", "Macaroni and Cheese", "Making a Living", "Music and Dance", "My Oh My"]
    }
];

const MWordChallenge = ({ onComplete }) => {
    const [openLevel, setOpenLevel] = useState('vowels');
    const [completedLevels, setCompletedLevels] = useState([]);

    const handleLevelComplete = (id) => {
        if (!completedLevels.includes(id)) {
            setCompletedLevels([...completedLevels, id]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">The &quot;M-Word&quot; Challenge</h2>
                <p className="text-slate-400 mb-4">
                    The &quot;Umm&quot; sound is a perfect trigger because it naturally brings the sound forward.
                    Use &quot;Umm...&quot; to set your resonance, then slide into the word.
                </p>
                <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4">
                    <div className="text-2xl font-bold text-purple-400">&quot;Umm...&quot;</div>
                    <div className="flex-1 h-1 bg-purple-700/50 rounded-full relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-purple-500 to-transparent opacity-50"></div>
                    </div>
                    <div className="text-2xl font-bold text-white">Target Word</div>
                </div>
            </div>

            <div className="space-y-4">
                {LEVELS.map((level, index) => {
                    const isOpen = openLevel === level.id;
                    const isCompleted = completedLevels.includes(level.id);
                    const isLocked = index > 0 && !completedLevels.includes(LEVELS[index - 1].id) && !isCompleted;

                    return (
                        <div
                            key={level.id}
                            className={`border rounded-xl transition-all ${isOpen ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                                } ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <button
                                onClick={() => setOpenLevel(isOpen ? null : level.id)}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    {isCompleted ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : isLocked ? (
                                        <Lock className="text-slate-500" size={20} />
                                    ) : (
                                        <Unlock className="text-purple-400" size={20} />
                                    )}
                                    <span className={`font-bold ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                                        {level.title}
                                    </span>
                                </div>
                                {isOpen ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                            </button>

                            {isOpen && (
                                <div className="p-4 border-t border-slate-700 animate-in slide-in-from-top-2">
                                    <p className="text-slate-400 text-sm mb-4 italic">{level.desc}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        {level.items.map((word, i) => (
                                            <div key={i} className="bg-slate-900 p-3 rounded-lg text-center font-medium text-white shadow-sm border border-slate-700">
                                                {word}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleLevelComplete(level.id)}
                                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${isCompleted
                                                ? 'bg-green-600/20 text-green-400'
                                                : 'bg-purple-600 text-white hover:bg-purple-500'
                                                }`}
                                        >
                                            {isCompleted ? 'Completed' : 'Mark Complete & Unlock Next'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-white transition-colors"
                >
                    Finish Challenge
                </button>
            </div>
        </div>
    );
};

export default MWordChallenge;
