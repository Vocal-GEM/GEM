import { useState } from 'react';
import { Repeat, Plus, Star, Calendar, Smartphone, Layout } from 'lucide-react';

const HabitBuilder = ({ onComplete }) => {
    const [existingHabit, setExistingHabit] = useState('');
    const [newAction, setNewAction] = useState('practice voice for 1 min');

    const strategies = [
        { icon: Star, title: "Gamify", desc: "Use apps like Habitica to get 'gold' for practicing." },
        { icon: Layout, title: "Environment", desc: "Put blue dot stickers on your water bottle as a trigger." },
        { icon: Calendar, title: "Schedule", desc: "Treat it like a dentist appointment. Same time daily." },
        { icon: Smartphone, title: "Reminders", desc: "Sticky notes on the mirror. Alarms on phone." }
    ];

    return (
        <div className="space-y-8">
            {/* The Theory */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-4">The Habit Loop</h2>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                        <div className="p-4 bg-slate-800 rounded-xl w-full">
                            <div className="text-indigo-400 font-bold mb-1">1. Cue</div>
                            <div className="text-xs text-slate-400">Trigger (Toothbrush)</div>
                        </div>
                        <div className="text-slate-500">→</div>
                        <div className="p-4 bg-slate-800 rounded-xl w-full">
                            <div className="text-white font-bold mb-1">2. Action</div>
                            <div className="text-xs text-slate-400">Behavior (Brush Teeth)</div>
                        </div>
                        <div className="text-slate-500">→</div>
                        <div className="p-4 bg-slate-800 rounded-xl w-full">
                            <div className="text-pink-400 font-bold mb-1">3. Reward</div>
                            <div className="text-xs text-slate-400">Dopamine (Minty Fresh)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Habit Stacker Tool */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 border border-indigo-500/30 p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-500 p-2 rounded-lg text-white"><Repeat size={24} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Habit Stacker</h3>
                        <p className="text-slate-400 text-sm">Attach a new habit to an old one.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">After I...</label>
                        <input
                            type="text"
                            placeholder="e.g. Brush my teeth"
                            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-indigo-500 outline-none"
                            value={existingHabit}
                            onChange={(e) => setExistingHabit(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">I will...</label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-indigo-500 outline-none"
                            value={newAction}
                            onChange={(e) => setNewAction(e.target.value)}
                        />
                    </div>
                </div>

                {existingHabit && (
                    <div className="p-6 bg-slate-950 rounded-xl border border-dashed border-slate-700 text-center animate-in zoom-in-95">
                        <div className="text-slate-500 text-sm mb-2">Your implementation intention:</div>
                        <div className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                            &quot;After I <span className="text-indigo-400 border-b-2 border-indigo-500/50">{existingHabit}</span>,<br />
                            I will <span className="text-pink-400 border-b-2 border-pink-500/50">{newAction}</span>!&quot;
                        </div>
                    </div>
                )}
            </div>

            {/* Strategies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {strategies.map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                        <div className="text-slate-400 shrink-0 mt-1">
                            <s.icon size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-white mb-1">{s.title}</div>
                            <div className="text-sm text-slate-400">{s.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Have a Plan
                </button>
            </div>
        </div>
    );
};

export default HabitBuilder;
