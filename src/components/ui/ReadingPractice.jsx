import { useState } from 'react';


const ReadingPractice = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const passages = [
        {
            title: "Paragraph 1: Setup",
            text: [
                "When the sunlight strikes raindrops in the air,",
                "they act like a prism and form a rainbow.",
                "The rainbow is a division of white light into many beautiful colors."
            ],
            focus: "Monotone. Focus ONLY on keeping the 'EE' resonance anchor."
        },
        {
            title: "Paragraph 2: Breath",
            text: [
                "These take the shape of a long round arch,",
                "with its path high above,",
                "and its two ends apparently beyond the horizon."
            ],
            focus: "Add Breath. Keep the resonance, but make it softer (Higher Open Quotient)."
        },
        {
            title: "Paragraph 3: Flow",
            text: [
                "There is, according to legend,",
                "a boiling pot of gold at one end.",
                "People look, but no one ever finds it."
            ],
            focus: "Natural Flow. Let the pitch move slightly, but keep the Balance."
        }
    ];

    const current = passages[step];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Reading Lab: The Rainbow Passage</h2>
                <p className="text-slate-400">
                    The ultimate test. Can you maintain your new voice while reading?
                    We break it down into chunks.
                </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 min-h-[400px] flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{current.title}</div>
                        <div className="text-xs text-slate-500">{step + 1} / {passages.length}</div>
                    </div>

                    <div className="space-y-4 mb-8">
                        {current.text.map((line, i) => (
                            <p key={i} className="text-2xl text-white font-serif leading-relaxed hover:text-indigo-300 transition-colors cursor-default">
                                {line}
                            </p>
                        ))}
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-yellow-500">
                        <h4 className="font-bold text-white text-sm">Target Focus</h4>
                        <p className="text-slate-400 text-sm mt-1">{current.focus}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (step < passages.length - 1) setStep(step + 1);
                            else onComplete();
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg flex items-center gap-2"
                    >
                        {step < passages.length - 1 ? 'Next Paragraph' : 'Complete Reading'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Icon helper
const ArrowRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default ReadingPractice;
