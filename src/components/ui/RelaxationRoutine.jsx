import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const RelaxationRoutine = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const routine = [
        { title: "Neck Rolls", desc: "Gently roll your head side to side. Visualize tension melting like wax.", duration: 30 },
        { title: "Jaw Release", desc: "Massage the masseter muscles (jaw hinge) with your knuckles. Let the jaw hang loose.", duration: 45 },
        { title: "Laryngeal Massage", desc: "Gently shimmy the larynx side to side. No clicking! Just gentle mobilization.", duration: 60 },
        { title: "Shoulder Drop", desc: "Squeeze shoulders up to ears, then DROP them suddenly. Exhale firmly.", duration: 30 }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Tension Release</h2>
                <p className="text-slate-400">
                    Tension is the enemy of resonance. A tight throat cannot be a bright throat.
                </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl text-center min-h-[300px] flex flex-col items-center justify-center border border-slate-700">
                <div className="text-indigo-400 mb-4 animate-bounce">
                    <Sparkles size={48} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{routine[step].title}</h3>
                <p className="text-slate-300 text-lg max-w-md mb-8">{routine[step].desc}</p>

                <div className="w-full bg-slate-700 h-2 rounded-full mb-8 overflow-hidden">
                    {/* Simplified visual progress bar - typically would animate */}
                    <div className="bg-indigo-500 h-full w-1/2"></div>
                </div>

                <div className="flex gap-4">
                    {step > 0 && (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-2 rounded-lg text-slate-400 hover:text-white">Back</button>
                    )}
                    <button
                        onClick={() => {
                            if (step < routine.length - 1) setStep(step + 1);
                            else onComplete();
                        }}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg transition-all"
                    >
                        {step < routine.length - 1 ? 'Next Exercise' : 'Finish Routine'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RelaxationRoutine;
