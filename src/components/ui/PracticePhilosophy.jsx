import React, { useState } from 'react';
import { Brain, Zap, Repeat, Trophy, Target } from 'lucide-react';

const PracticePhilosophy = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('concept');

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">The Two Types of Practice</h2>
                <p className="text-slate-400">
                    Before we start mechanics, we need to agree on HOW we practice.
                    There is a difference between <strong>learning</strong> a skill and <strong>owning</strong> it.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Practice */}
                <div className="bg-slate-900 p-6 rounded-xl border border-indigo-500/30 hover:border-indigo-500 transition-colors">
                    <div className="flex items-center gap-3 text-indigo-400 font-bold mb-4">
                        <Zap size={24} />
                        <span>Active Practice</span>
                    </div>
                    <ul className="space-y-3 text-slate-300 text-sm">
                        <li className="flex gap-2"><Target size={16} className="shrink-0 mt-1" /> Focus is 100% on the mechanic.</li>
                        <li className="flex gap-2"><Target size={16} className="shrink-0 mt-1" /> &quot;Does this feel right?&quot;</li>
                        <li className="flex gap-2"><Target size={16} className="shrink-0 mt-1" /> Fatigue happens quickly.</li>
                        <li className="flex gap-2"><Target size={16} className="shrink-0 mt-1" /> <strong>Goal:</strong> Build the skill.</li>
                    </ul>
                </div>

                {/* Passive Practice */}
                <div className="bg-slate-900 p-6 rounded-xl border border-pink-500/30 hover:border-pink-500 transition-colors">
                    <div className="flex items-center gap-3 text-pink-400 font-bold mb-4">
                        <Repeat size={24} />
                        <span>Passive Practice</span>
                    </div>
                    <ul className="space-y-3 text-slate-300 text-sm">
                        <li className="flex gap-2"><Brain size={16} className="shrink-0 mt-1" /> Focus is on life/content.</li>
                        <li className="flex gap-2"><Brain size={16} className="shrink-0 mt-1" /> &quot;Am I holding it?&quot;</li>
                        <li className="flex gap-2"><Brain size={16} className="shrink-0 mt-1" /> Can do it all day.</li>
                        <li className="flex gap-2"><Brain size={16} className="shrink-0 mt-1" /> <strong>Goal:</strong> Build the habit.</li>
                    </ul>
                </div>
            </div>

            <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30 text-center">
                <h3 className="text-xl font-bold text-white mb-2">The Rule</h3>
                <p className="text-indigo-200 italic text-lg">
                    &quot;Active practice builds the car. Passive practice drives it.&quot;
                </p>
                <p className="text-slate-400 text-sm mt-4">
                    Don&apos;t try to &quot;drive&quot; (speak full time) until you&apos;ve &quot;built the car&quot; (learned the mechanics).
                </p>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Understand
                </button>
            </div>
        </div>
    );
};

export default PracticePhilosophy;
