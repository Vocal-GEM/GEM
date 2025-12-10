import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle } from 'lucide-react';

const InflectionExercises = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const exercises = [
        {
            title: "1. The Rising Gliss",
            desc: "Slide up from your Low Note to your High Note on 'M' + Vowels.",
            visual: "up",
            content: ["Mmm-eee", "Mmm-ay", "Mmm-eye", "Mmm-oh", "Mmm-oo"],
            tip: "Don't go higher than your comfortable Top Note. It's a question? Not a screech."
        },
        {
            title: "2. The Falling Gliss",
            desc: "Slide down from Top to Bottom. Don't crash into the basement!",
            visual: "down",
            content: ["Mmm-eee", "Mmm-ay", "Mmm-eye", "Mmm-oh", "Mmm-oo"],
            tip: "Keep the resonance bright even as you go down. Don't let it get rumbly."
        },
        {
            title: "3. Counting Up",
            desc: "Count to 10. Start low and end high on EACH number.",
            visual: "up",
            content: ["One ⤴", "Two ⤴", "Three ⤴", "Four ⤴", "Five ⤴"],
            tip: "Like every number is a fascinating question."
        },
        {
            title: "4. Counting Down",
            desc: "Count to 10. Start high and sigh down on EACH number.",
            visual: "down",
            content: ["One ⤵", "Two ⤵", "Three ⤵", "Four ⤵", "Five ⤵"],
            tip: "A gentle sigh. 'Aww, poor thing'."
        },
        {
            title: "5. Alternating (The Bounce)",
            desc: "Count to 10. One Up, One Down.",
            visual: "wave",
            content: ["One ⤴", "Two ⤵", "Three ⤴", "Four ⤵", "Five ⤴"],
            tip: "This builds agility. Up, down, up, down."
        },
        {
            title: "6. Days & Months",
            desc: "Say the days of the week with the rising glide.",
            visual: "up",
            content: ["Monday ⤴", "Tuesday ⤴", "Wednesday ⤴", "Thursday ⤴"],
            tip: "Now try them ALL falling. Then alternate."
        },
        {
            title: "7. Phrases",
            desc: "Declarative (Down) vs Interrogative (Up).",
            visual: "split",
            content: [
                "Go right, then left. ⤵ (Statement)",
                "Have you seen my keys? ⤴ (Question)",
                "I'll have a small coffee. ⤵",
                "Did you take the dog out? ⤴"
            ],
            tip: "Questions go Down-then-Up. Statements go Up-then-Down (Glide and Slide)."
        }
    ];

    const currentEx = exercises[step];

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex gap-1">
                {exercises.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full transition-all ${i === step ? 'bg-indigo-500' : i < step ? 'bg-indigo-900' : 'bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl min-h-[400px] flex flex-col items-center text-center animate-in slide-in-from-right-8" key={step}>
                <h3 className="text-2xl font-bold text-white mb-2">{currentEx.title}</h3>
                <p className="text-slate-400 mb-8 max-w-md">{currentEx.desc}</p>

                {/* Visualizer Placeholder */}
                <div className="mb-8 p-6 bg-slate-800 rounded-full w-32 h-32 flex items-center justify-center border-4 border-slate-700">
                    {currentEx.visual === 'up' && <ArrowUpRight size={64} className="text-indigo-400" />}
                    {currentEx.visual === 'down' && <ArrowDownRight size={64} className="text-pink-400" />}
                    {currentEx.visual === 'wave' && <RefreshCw size={50} className="text-purple-400" />}
                    {currentEx.visual === 'split' && <div className="flex"><ArrowDownRight size={32} /><ArrowUpRight size={32} /></div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
                    {currentEx.content.map((text, i) => (
                        <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-lg font-medium text-white shadow-sm">
                            {text}
                        </div>
                    ))}
                </div>

                <div className="flex-1"></div>

                <div className="mt-8 p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl w-full text-sm text-indigo-300">
                    <strong>Coach Tip:</strong> {currentEx.tip}
                </div>

                <div className="flex gap-4 mt-8 w-full">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (step < exercises.length - 1) setStep(step + 1);
                            else onComplete();
                        }}
                        className="flex-[2] py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        {step < exercises.length - 1 ? 'Next Exercise' : 'Finish'}
                        {step === exercises.length - 1 && <CheckCircle size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InflectionExercises;
