import { useState } from 'react';
import { Droplets, Moon, AlertTriangle, Salad, CheckCircle } from 'lucide-react';

const VocalHygiene = ({ onComplete }) => {
    const [checks, setChecks] = useState({});

    const items = [
        { id: 'hydration', icon: Droplets, label: 'Hydration', desc: 'Sip water all day. Damp folds vibrate better.', color: 'text-blue-400' },
        { id: 'rest', icon: Moon, label: 'Vocal Rest', desc: 'Silence is golden. Give your voice breaks.', color: 'text-indigo-400' },
        { id: 'acid', icon: AlertTriangle, label: 'Reflux/Gerd', desc: 'Avoid spicy food late at night if you have reflux.', color: 'text-red-400' },
        { id: 'lifestyle', icon: Salad, label: 'General Health', desc: 'Your voice is your body. Sleep and nutrition matter.', color: 'text-green-400' }
    ];

    const toggleCheck = (id) => {
        setChecks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allChecked = items.every(i => checks[i.id]);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Vocal Hygiene: The Green Light</h2>
                <p className="text-slate-400">
                    You need a &quot;Green Light&quot; from your body before practicing.
                    If it hurts, stop. If you&apos;re hoarse, rest.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${checks[item.id]
                            ? 'bg-slate-800 border-green-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                            }`}
                    >
                        <div className={`p-3 rounded-full bg-slate-800 ${item.color}`}>
                            <item.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold ${checks[item.id] ? 'text-green-400' : 'text-white'}`}>
                                {item.label}
                            </div>
                            <div className="text-sm text-slate-400">{item.desc}</div>
                        </div>
                        {checks[item.id] && <CheckCircle className="text-green-500" />}
                    </button>
                ))}
            </div>

            {allChecked && (
                <div className="text-center animate-in zoom-in">
                    <div className="inline-block px-6 py-2 bg-green-500/20 text-green-400 font-bold rounded-full mb-4 border border-green-500/50">
                        Green Light Active
                    </div>
                    <button onClick={onComplete} className="block w-full py-4 bg-white text-slate-900 font-bold rounded-xl shadow-lg">
                        Proceed to Warm-up
                    </button>
                </div>
            )}

            <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl mt-8">
                <h3 className="font-bold text-red-400 flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} />
                    Red Flags: When to STOP
                </h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex gap-2">
                        <span className="text-red-500 font-bold">1.</span>
                        <span><strong>Rigidity:</strong> If your larynx feels &quot;stuck&quot; or you can&apos;t move while making sound.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-red-500 font-bold">2.</span>
                        <span><strong>Throat Clearing:</strong> Constant clearing means irritation. Swallow hard instead.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-red-500 font-bold">3.</span>
                        <span><strong>Hoarseness:</strong> If your voice is fuzzy, DO NOT push through. Rest is the only cure.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-red-500 font-bold">4.</span>
                        <span><strong>Pain:</strong> Any sharp pain is a hard stop.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default VocalHygiene;
