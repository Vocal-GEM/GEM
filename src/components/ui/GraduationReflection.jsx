import { useState } from 'react';
import { Book, Heart, Map, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const GraduationReflection = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [glossary, setGlossary] = useState({});
    const [reflection, setReflection] = useState({});


    // 1. Readiness
    const readinessChecks = [
        "I can make a consistent, healthy sound for a few sentences.",
        "I can catch myself when my voice dips.",
        "I know how to reset (Recovery Strategy).",
        "I am ready to coach myself."
    ];
    const [readiness, setReadiness] = useState({});

    // 2. Glossary
    const concepts = [
        "Breath Support vs Management", "Open Quotient", "Resonance / R1",
        "Vocal Mass / Thickness", "Twang / Aryepiglottic Sphincter",
        "Prosody (Bounce/Tempo/Elongation)", "Recovery (Anchor Words)"
    ];

    const handleSubmit = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            onComplete?.();
        }, 5000);
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Readiness
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Are You Ready?</h2>
                            <p className="text-slate-400">Honesty is the most important tool you have.</p>
                        </div>
                        <div className="space-y-4">
                            {readinessChecks.map((item, i) => (
                                <label key={i} className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={readiness[i] || false}
                                        onChange={() => setReadiness(prev => ({ ...prev, [i]: !prev[i] }))}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                                    />
                                    <span className="text-slate-200">{item}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            disabled={Object.keys(readiness).length < readinessChecks.length}
                            onClick={() => setStep(1)}
                            className="w-full py-4 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl mt-8 transition-colors"
                        >
                            I Am Ready
                        </button>
                    </div>
                );

            case 1: // Glossary
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                                <Book size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">The Toolkit</h2>
                            <p className="text-slate-400">Confirm you can define AND demonstrate these concepts.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {concepts.map((concept, i) => (
                                <label key={i} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500/50">
                                    <input
                                        type="checkbox"
                                        checked={glossary[concept] || false}
                                        onChange={() => setGlossary(prev => ({ ...prev, [concept]: !prev[concept] }))}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                                    />
                                    <span className="text-sm text-slate-300 font-medium">{concept}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            disabled={Object.keys(glossary).length < concepts.length}
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl mt-8 transition-colors"
                        >
                            My Toolbox is Full
                        </button>
                    </div>
                );

            case 2: // Emotional
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-400">
                                <Heart size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Heart check</h2>
                            <p className="text-slate-400">Voice is emotional. Let&apos;s honor that.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-pink-300 mb-2">My Vocal Affirmation</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                                    placeholder="e.g., My voice deserves to be heard..."
                                    rows={2}
                                    value={reflection.affirmation || ''}
                                    onChange={e => setReflection({ ...reflection, affirmation: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-pink-300 mb-2">Advice to Future Students</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                                    placeholder="What do you wish you knew on Day 1?"
                                    rows={3}
                                    value={reflection.advice || ''}
                                    onChange={e => setReflection({ ...reflection, advice: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            disabled={!reflection.affirmation}
                            onClick={() => setStep(3)}
                            className="w-full py-4 bg-pink-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl mt-8 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                );

            case 3: // Future Plan
                return (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-400">
                                <Map size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">The Road Ahead</h2>
                            <p className="text-slate-400">You are your own coach now. What&apos;s the plan?</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-teal-300 mb-2">My &quot;Go-To&quot; Warmup</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                                    placeholder="e.g., Lip trills -> Sirens -> Reading"
                                    rows={2}
                                    value={reflection.warmup || ''}
                                    onChange={e => setReflection({ ...reflection, warmup: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-teal-300 mb-2">My Recovery Move</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
                                    placeholder="What do you do when you dip?"
                                    rows={2}
                                    value={reflection.recovery || ''}
                                    onChange={e => setReflection({ ...reflection, recovery: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            disabled={!reflection.warmup}
                            onClick={handleSubmit}
                            className="w-full py-4 bg-teal-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl mt-8 transition-colors shadow-lg shadow-teal-900/20"
                        >
                            GRADUATE
                        </button>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-6 flex justify-center gap-2">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-white' : 'bg-slate-800'}`} />
                ))}
            </div>
            {renderStep()}
        </div>
    );
};

export default GraduationReflection;
