import { useState } from 'react';
import { Book, CheckCircle, Trophy, Moon, Sun, Scan } from 'lucide-react';

const Module2WrapUp = ({ onComplete }) => {

    const [checkedHomework, setCheckedHomework] = useState({});

    const prompts = [
        "What areas of my body might benefit from a little extra love and attention?",
        "How do I feel when I make sounds I’m not used to? What can I do to honour and move through those feelings?",
        "What fears are beginning to come up for me in the second week of this course?"
    ];

    const homework = [
        { id: 1, text: "Unwind & Observe: Do the entire stretch routine in the morning.", icon: <Sun size={16} /> },
        { id: 2, text: "Bedtime Release: Do the entire stretch routine before bed.", icon: <Moon size={16} /> },
        { id: 3, text: "Mirror Work: Observe vocal structures (yawn, stretch) in the mirror.", icon: <Scan size={16} /> },
        { id: 4, text: "Consistency: Warm up 3-4 times this week.", icon: <CheckCircle size={16} /> },
    ];

    const toggleHomework = (id) => {
        setCheckedHomework(prev => ({ ...prev, [id]: !prev[id] }));
    };



    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Celebration Header */}
            <div className="text-center space-y-4 py-8 bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
                <div className="inline-block p-4 bg-slate-800 rounded-full mb-4 shadow-xl border border-slate-700">
                    <Trophy className="text-yellow-400 w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-white">Week 2 Complete!</h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                    You&apos;ve mastered the Warm Up, explored Vocal Anatomy, and learned the Big Picture of voice alteration.
                    You are now a Voice Practitioner.
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
                            <p className="text-slate-300 italic">&quot;{prompt}&quot;</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <button className="text-sm text-slate-500 hover:text-white underline">
                        Open Journal Entry
                    </button>
                </div>
            </div>

            {/* Homework Checklist */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-purple-500" />
                    <h3 className="text-xl font-bold text-white">Week 2 Homework</h3>
                </div>
                <div className="space-y-3">
                    {homework.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => toggleHomework(item.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${checkedHomework[item.id]
                                ? 'bg-purple-900/20 border-purple-500/50 text-slate-300'
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-white'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${checkedHomework[item.id] ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                {checkedHomework[item.id] ? <CheckCircle size={16} /> : item.icon}
                            </div>
                            <span className={checkedHomework[item.id] ? 'line-through text-slate-500' : ''}>
                                {item.text}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    Finish Module
                </button>
            </div>
        </div>
    );
};

export default Module2WrapUp;
