import React, { useState } from 'react';
import { Book, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

const Module4WrapUp = ({ onComplete }) => {
    const [checkedTasks, setCheckedTasks] = useState({});

    const prompts = [
        "Are my voice goals now the same as they were at the start? If not, how have they changed?",
        "What unique gifts do I have that I wasn't aware of at the start? (e.g., ear for pitch, analysis skills, patience)",
        "How can I allow myself to be more vulnerable with the people in my life regarding my voice?"
    ];

    const homework = [
        { id: 'list', text: 'Re-evaluate "Inspiration Board" (Does pitch still matter?)' },
        { id: 'range', text: '5 mins/day: Sing Up To 5 (Test Mornging vs Night)' },
        { id: 'mwords', text: '5 mins/day: Umm to M-Words (With Pitch Target)' },
        { id: 'journal', text: 'Respond to Journal Prompts' },
        { id: 'warmup', text: 'Continue Daily Warm-ups' }
    ];

    const toggleTask = (id) => {
        setCheckedTasks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Celebration Header */}
            <div className="text-center space-y-4 py-8 bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="inline-block p-4 bg-slate-800 rounded-full mb-4 shadow-xl border border-slate-700">
                    <Sparkles className="text-indigo-400 w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-white">Module 4 Complete!</h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                    You&apos;ve demystified Pitch. Remember: It&apos;s not about how high you can go,
                    but about consistency and comfort in your chosen range.
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

            {/* Homework */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="text-indigo-500" />
                    <h3 className="text-xl font-bold text-white">Week 4 Homework</h3>
                </div>
                <div className="space-y-3">
                    {homework.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => toggleTask(item.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${checkedTasks[item.id]
                                ? 'bg-indigo-900/20 border-indigo-500/50'
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                                }`}
                        >
                            <span className={`font-bold ${checkedTasks[item.id] ? 'text-indigo-300' : 'text-slate-300'}`}>
                                {item.text}
                            </span>
                            <div className={`p-1 rounded-full ${checkedTasks[item.id] ? 'text-indigo-500' : 'text-slate-600'}`}>
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
                    Finish Module 4
                </button>
            </div>
        </div>
    );
};

export default Module4WrapUp;
