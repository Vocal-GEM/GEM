import React, { useState } from 'react';
import { ChevronRight, ArrowDown, ArrowUp, Smile, RotateCw } from 'lucide-react';

const EXERCISES = [
    {
        id: 'yawn',
        title: 'Yawning (Lowering)',
        icon: <ArrowDown size={24} />,
        color: 'text-blue-400',
        steps: [
            "Consciously yawn and feel the larynx descending.",
            "Touch your throat to feel the movement (look for the 'Adam's Apple' dropping).",
            "Try to yawn without opening your mouth wide (stifled yawn).",
            "Alternative: 'Darth Vader' breath through a 1/2 inch tube/straw."
        ]
    },
    {
        id: 'swallow',
        title: 'Swallowing (Raising)',
        icon: <ArrowUp size={24} />,
        color: 'text-pink-400',
        steps: [
            "Swallow and feel the larynx rise up and forward.",
            "Try to hold the larynx in that elevated position for a split second.",
            "If successful, try to bring the larynx up without the full swallow.",
            "Note: About 50% of people can't do the hold. If that's you, move to Pull-ups!"
        ]
    },
    {
        id: 'pullups',
        title: 'Larynx Pull-ups',
        icon: <RotateCw size={24} />,
        color: 'text-green-400',
        steps: [
            "Say a small, cute 'ee' sound (like 'Cute' or baby talk).",
            "Feel the larynx rise.",
            "Step 2: Make the 'ee' shape *without* sound (silent trigger).",
            "Step 3: Hold that top position for 1-2 seconds.",
            "Step 4: Breathe while holding the larynx high."
        ]
    },
    {
        id: 'smile',
        title: 'Inner Smile',
        icon: <Smile size={24} />,
        color: 'text-yellow-400',
        steps: [
            "Pretend you have a juicy secret.",
            "Smile internally (behind the eyes/cheeks).",
            "Notice if this subtle shift raises your larynx.",
            "Experiment with other facial expressions (Surprise, etc)."
        ]
    }
];

const LarynxControl = ({ onComplete }) => {
    const [activeExercise, setActiveExercise] = useState('yawn');

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Larynx Gym</h2>
                <p className="text-slate-400">
                    The larynx floats freely. We need to learn to move it up (for brightness) and down (for flexibility).
                    Explore these triggers to find what works for you.
                </p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {EXERCISES.map(ex => (
                    <button
                        key={ex.id}
                        onClick={() => setActiveExercise(ex.id)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center ${activeExercise === ex.id
                                ? 'bg-slate-800 border-pink-500 shadow-lg shadow-pink-900/20'
                                : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                            }`}
                    >
                        <div className={`${activeExercise === ex.id ? ex.color : 'text-slate-500'}`}>
                            {ex.icon}
                        </div>
                        <span className={`text-sm font-bold ${activeExercise === ex.id ? 'text-white' : 'text-slate-400'}`}>
                            {ex.title}
                        </span>
                    </button>
                ))}
            </div>

            {/* Active Content */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-300 min-h-[300px]">
                {EXERCISES.map(ex => {
                    if (ex.id !== activeExercise) return null;
                    return (
                        <div key={ex.id} className="space-y-6">
                            <h3 className={`text-xl font-bold flex items-center gap-2 ${ex.color}`}>
                                {ex.icon} {ex.title}
                            </h3>

                            <div className="space-y-4">
                                {ex.steps.map((step, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400 mt-0.5">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-200 text-lg leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>

                            {ex.id === 'yawn' && (
                                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
                                    💡 <strong>Why lower the larynx?</strong> Flexibility! A flexible larynx moves easier in <em>both</em> directions.
                                </div>
                            )}
                            {ex.id === 'swallow' && (
                                <div className="p-4 bg-pink-900/20 border border-pink-500/30 rounded-lg text-sm text-pink-300">
                                    💡 <strong>Can't hold it?</strong> Don't worry, 50% of people can't. Try the Pull-ups instead!
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                    I've Explored These <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default LarynxControl;
