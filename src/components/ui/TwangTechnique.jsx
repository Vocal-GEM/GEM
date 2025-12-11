import { useState } from 'react';
import { Megaphone, Zap, Radio, Volume2 } from 'lucide-react';

const TwangTechnique = ({ onComplete }) => {
    const [step, setStep] = useState(1);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Technique: Feminine Projection (Twang)</h2>
                <p className="text-slate-400">
                    How to shout at your kids, call a dog, or get attention <em>without</em> dropping into a deep masculine boom.
                </p>
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Megaphone className="text-red-400" /> The Problem
                        </h3>
                        <p className="text-slate-300">
                            You cannot shout with &quot;Thin&quot; vocal folds. They are too delicate.
                            If you try to shout normally, your body instinctively thickens the folds, and you sound masculine (&quot;HEY!&quot;).
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => setStep(2)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                            The Solution: Twang →
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Zap className="text-green-400" /> The Solution: Twang
                        </h3>
                        <p className="text-slate-300">
                            Instead of thickening the &quot;True Folds&quot;, we squeeze the &quot;Aryepiglottic Sphincter&quot; (The rim of the larynx).
                            This creates a piercing, bright, loud sound that cuts through noise but keeps the pitch high.
                        </p>
                    </div>

                    <h4 className="font-bold text-white mt-4">Triggers to find Twang:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <TriggerCard
                            icon={Radio}
                            title="The Nerd"
                            desc='"Technically, actually..." (Nasal/Bright)'
                        />
                        <TriggerCard
                            icon={Volume2}
                            title="Country Singer"
                            desc='"I left my baby in the pickup truck..."'
                        />
                        <TriggerCard
                            icon={Zap}
                            title="The Robot"
                            desc='"I. AM. A. RO-BOT."'
                        />
                    </div>

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(1)} className="text-slate-400">← Back</button>
                        <button
                            onClick={onComplete}
                            className="bg-white hover:bg-slate-200 text-slate-900 px-6 py-2 rounded-lg font-bold transition-colors shadow-lg"
                        >
                            I Can Project
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TriggerCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors text-center group cursor-pointer">
        <div className="flex justify-center mb-3 text-slate-400 group-hover:text-indigo-400">
            <Icon size={32} />
        </div>
        <div className="font-bold text-white mb-1">{title}</div>
        <div className="text-xs text-slate-400 italic">{desc}</div>
    </div>
);

export default TwangTechnique;
