import React, { useState } from 'react';
import { Book, CheckCircle, Award, Heart, Rocket } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Assuming a hook or use simple styles

const Module6WrapUp = ({ onComplete }) => {
    const [checkedTasks, setCheckedTasks] = useState({});

    // Simple window size simulation if hook is missing, but typically we'd use a hook
    // For now, let's just render Confetti assuming it handles undefined width/height gracefully or defaults

    const prompts = [
        "How can I be kinder and more compassionate toward myself as I continue?",
        "How will I creatively bring myself back to practice when (not if) life happens?",
        "What important lessons have I learned over the past six weeks?",
        "How has my mindset shifted?"
    ];

    const homework = [
        { id: 'plan', text: 'Create a sustainable Practice Plan (Where/When/How)' },
        { id: 'track', text: 'Choose a Progress Tracking method (Logbook/App)' },
        { id: 'review', text: 'Review notes from the whole course' },
        { id: 'journal', text: 'Complete all 21 Journal Prompts' }
    ];

    const toggleTask = (id) => {
        setCheckedTasks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 relative">
            <Confetti numberOfPieces={200} recycle={false} />

            {/* Celebration Header */}
            <div className="text-center space-y-4 py-12 bg-gradient-to-br from-indigo-900 via-pink-900 to-indigo-900 rounded-3xl border border-indigo-700 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500"></div>
                <div className="inline-block p-6 bg-slate-900 rounded-full mb-4 shadow-xl border-4 border-indigo-500">
                    <Rocket className="text-pink-500 w-16 h-16 animate-bounce" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight">COURSE COMPLETE!</h2>
                <div className="flex justify-center gap-2 text-indigo-200 uppercase font-bold tracking-widest text-sm">
                    <span>Awareness</span> • <span>Mechanics</span> • <span>Resonance</span> • <span>Pitch</span> • <span>Weight</span> • <span>Inflection</span>
                </div>
                <p className="text-slate-300 max-w-xl mx-auto px-4 mt-6">
                    You have done the work. You have the tools. The journey doesn't end here, it's just becoming YOURS.
                </p>
                <div className="flex justify-center text-red-400 mt-4 animate-pulse">
                    <Heart fill="currentColor" size={32} />
                </div>
            </div>

            {/* Journal Prompts */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <Book className="text-pink-500" />
                    <h3 className="text-xl font-bold text-white">Final Reflections</h3>
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
                    <CheckCircle className="text-indigo-500" />
                    <h3 className="text-xl font-bold text-white">Going Forward</h3>
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

            <div className="flex justify-center pt-8 pb-12">
                <button
                    onClick={onComplete}
                    className="px-12 py-4 bg-indigo-600 text-white font-black text-xl rounded-2xl hover:bg-indigo-500 transition-all shadow-xl hover:scale-105"
                >
                    I Am Ready.
                </button>
            </div>
        </div>
    );
};

export default Module6WrapUp;
