import { useState } from 'react';
import { ArrowUp, Repeat } from 'lucide-react';

const PitchExercises = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('sing5');

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Target Pitch Exercises</h2>
                <p className="text-slate-400">
                    Once you&apos;ve chosen a comfortable starting note (e.g., D3, E3, F3), practice these drills to solidify your range.
                </p>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-xl">
                {['sing5', 'jump', 'sing-ah'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab
                            ? 'bg-pink-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab === 'sing5' && "1. Sing Up to 5"}
                        {tab === 'jump' && "2. Count Jump Slide"}
                        {tab === 'sing-ah' && "3. Sing-Ah (Mix)"}
                    </button>
                ))}
            </div>

            <div className="min-h-[300px] bg-slate-800 border border-slate-700 p-6 rounded-2xl animate-in fade-in">
                {activeTab === 'sing5' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Sing Up to 5</h3>
                        <p className="text-slate-300">
                            Find 5 notes that are comfortable at the bottom, and don&apos;t flip at the top.
                        </p>

                        <div className="flex items-end justify-center gap-2 h-40 bg-slate-900 rounded-xl p-8">
                            {[1, 2, 3, 4, 5].map((n, i) => (
                                <div key={n} className="w-12 bg-pink-500 rounded-t-lg transition-all hover:bg-pink-400 flex items-end justify-center pb-2 text-white font-bold" style={{ height: `${(i + 1) * 20}%` }}>
                                    {n}
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-slate-900 rounded-lg text-sm text-slate-400 border border-slate-800">
                            <strong>Goal:</strong> No cracking, no straining. If 5 notes is too hard, try 4.
                        </div>
                    </div>
                )}

                {activeTab === 'jump' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Count, Jump, Slide</h3>
                        <p className="text-slate-300">
                            Practice navigating your new range dynamically.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded-xl text-center">
                                <div className="text-slate-500 text-xs uppercase font-bold mb-2">Part 1: The Base</div>
                                <div className="text-2xl font-bold text-white">1 - 2 - 3 - 4 - 5</div>
                                <div className="text-sm text-pink-400 mt-1">Stay Low/Stable</div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl text-center relative overflow-hidden">
                                <div className="absolute top-2 right-2 text-pink-600 opacity-20"><ArrowUp size={48} /></div>
                                <div className="text-slate-500 text-xs uppercase font-bold mb-2">Part 2: The Jump</div>
                                <div className="text-2xl font-bold text-white">6... 7 8 9 10</div>
                                <div className="text-sm text-pink-400 mt-1">Jump High, Slide Down</div>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-sm text-yellow-200 flex gap-3">
                            <Repeat className="shrink-0" />
                            Ensure &quot;10&quot; lands in the same place as &quot;1&quot;. Don&apos;t fall into the basement!
                        </div>
                    </div>
                )}

                {activeTab === 'sing-ah' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Sing-Ah (Register Blending)</h3>
                        <p className="text-slate-300">
                            For smoothing out the break between chest and head voice.
                        </p>

                        <ol className="list-decimal list-inside space-y-4 text-slate-300">
                            <li className="p-3 bg-slate-900 rounded-lg">
                                <span className="text-white font-bold">&quot;Sing...&quot;</span> (Hold the NG sound). Air comes out nose.
                            </li>
                            <li className="p-3 bg-slate-900 rounded-lg">
                                <span className="text-white font-bold">Slide Up</span> (Glissando up a 5th on NG).
                            </li>
                            <li className="p-3 bg-slate-900 rounded-lg">
                                <span className="text-white font-bold">Open to &quot;Ah&quot;</span> (Keep the position).
                            </li>
                            <li className="p-3 bg-slate-900 rounded-lg">
                                <span className="text-white font-bold">Slide Down</span> (Return to start).
                            </li>
                        </ol>
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I&apos;ve Practiced These
                </button>
            </div>
        </div>
    );
};

export default PitchExercises;
