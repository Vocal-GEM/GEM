import { useState } from 'react';
import { Book, CheckCircle, Award, Target } from 'lucide-react';

const Module5WrapUp = ({ onComplete }) => {
    const [checkedTasks, setCheckedTasks] = useState({});

    const prompts = [
        "What am I most proud of having achieved these past five weeks? (Celebrate the small wins!)",
        "What are some limiting beliefs I still hold about myself? (e.g. &apos;I can&apos;t do this&apos;)",
        "How can I decouple my voice success from the way I am perceived by others? (Focus on what YOU control)"
    ];

    const homework = [
        { id: 'voicelist', text: 'Review Voice List: Identify Thick vs Thin qualities' },
        { id: 'toolbox', text: '5 mins/day: Vocal Weight Toolbox (Experiment!)' },
        { id: 'twang', text: '5 mins/day: Twang (Feminine Shouting)' },
        { id: 'journal', text: 'Respond to Journal Prompts' },
        { id: 'mwords', text: 'Combine Mass + M-Words Practice' }
    ];

    const toggleTask = (id) => {
        setCheckedTasks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Celebration Header */}
            <div className="text-center space-y-4 py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl border border-indigo-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500"></div>
                <div className="inline-block p-4 bg-indigo-800 rounded-full mb-4 shadow-xl border border-indigo-600">
                    <Award className="text-yellow-400 w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-white">Module 5 Complete!</h2>
                <p className="text-indigo-200 max-w-lg mx-auto">
                    You&apos;ve tackled the &quot;Big Three&quot;: Pitch, Resonance, and Weight.
                    You now have the full toolkit to sculpt your voice.
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
            </div>

            {/* Homework */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="text-indigo-500" />
                    <h3 className="text-xl font-bold text-white">Week 5 Homework</h3>
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
                    Finish Module 5
                </button>
            </div>
        </div>
    );
};

export default Module5WrapUp;
