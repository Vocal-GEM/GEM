import React, { useState } from 'react';
import { Feather, Anchor, Info, Wind, Zap, Layers } from 'lucide-react';

const VocalWeightTheory = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('concept'); // concept, spectrum, anatomy

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Module 5: Vocal Weight</h2>
                <p className="text-slate-400">
                    Also known as "Mass" or "Fold Thickness". This is the difference between a heavy "Buzz" and a light "Float".
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
                {[
                    { id: 'concept', icon: Feather, label: 'The Concept' },
                    { id: 'spectrum', icon: Wind, label: 'The 3 B\'s' },
                    { id: 'anatomy', icon: Layers, label: 'Anatomy' },
                    { id: 'open-quotient', icon: Wind, label: 'Open Quotient' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl min-h-[400px] animate-in fade-in">
                {activeTab === 'concept' && <ConceptTab />}
                {activeTab === 'spectrum' && <SpectrumTab />}
                {activeTab === 'anatomy' && <AnatomyTab />}
                {activeTab === 'open-quotient' && <OpenQuotientTab />}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Understand Weight
                </button>
            </div>
        </div>
    );
};

/* --- Sub-Components --- */

const OpenQuotientTab = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Open Quotient (OQ)</h3>
        <p className="text-slate-300">
            OQ = The percentage of time your vocal folds stay <strong>OPEN</strong> during each vibration cycle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                    <Wind size={24} /> High OQ (Breathy)
                </div>
                <div className="text-sm text-slate-400 mb-4">
                    Folds are open longer. Air escapes. Soft, husky, feminine.
                </div>
                <div className="p-3 bg-slate-800 rounded-lg text-center font-bold text-white">
                    Icon: Marilyn Monroe
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2">
                    <Zap size={24} /> Low OQ (Pressed)
                </div>
                <div className="text-sm text-slate-400 mb-4">
                    Folds snap shut quickly. Buzzy, loud, piercing.
                </div>
                <div className="p-3 bg-slate-800 rounded-lg text-center font-bold text-white">
                    Icon: Action Movie Trailer
                </div>
            </div>
        </div>

        <div className="p-4 bg-indigo-900/20 text-indigo-200 rounded-xl text-sm border border-indigo-500/20">
            <strong>Goal:</strong> Feminine voices often lean towards a <em>slightly</em> higher OQ (softer) to avoid the "buzz" of heavy weight.
        </div>
    </div>
);

const ConceptTab = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Heaviness vs. Lightness</h3>
        <p className="text-slate-300">
            It's not just about Pitch. You can have a high pitch that is "Heavy" (Belting) or a low pitch that is "Light" (Sultry).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 space-y-4">
                <div className="flex items-center gap-3 text-pink-400 font-bold mb-2">
                    <Feather size={24} /> Thin / Light
                </div>
                <p className="text-sm text-slate-400">
                    Vocal folds are stretched and thin. Less surface area touches.
                </p>
                <div className="p-3 bg-slate-800 rounded-lg text-white text-center font-bold">
                    Trigger: The Yawn
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 space-y-4">
                <div className="flex items-center gap-3 text-yellow-500 font-bold mb-2">
                    <Anchor size={24} /> Thick / Heavy
                </div>
                <p className="text-sm text-slate-400">
                    Vocal folds are short and thick. More surface area touches.
                </p>
                <div className="p-3 bg-slate-800 rounded-lg text-white text-center font-bold">
                    Trigger: The Cough
                </div>
            </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex gap-3 text-sm text-slate-400 italic">
            <Info size={16} className="shrink-0 mt-1" />
            <div>
                "Testosterone deepens the voice by physically thickening the vocal folds.
                Feminizing involves learning to use just the thin edges, even if the folds are thick."
            </div>
        </div>
    </div>
);

const SpectrumTab = () => {
    const [val, setVal] = useState(50); // 0=Breathy, 50=Balanced, 100=Buzzy

    const getLabel = (v) => {
        if (v < 30) return { title: 'Breathy', desc: 'Too open. Air escapes. Marilyn Monroe-ish.', icon: Wind, color: 'text-blue-400' };
        if (v > 70) return { title: 'Buzzy', desc: 'Too closed. Pressed. "Coughing" sound.', icon: Zap, color: 'text-yellow-400' };
        return { title: 'Balanced', desc: 'Just right. Clean closure without pressing.', icon: Anchor, color: 'text-green-400' };
    };

    const info = getLabel(val);
    const Icon = info.icon;

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-white">The 3 B's of Phonation</h3>
            <p className="text-slate-300">
                Adduction (Closing) vs Abduction (Opening). Finding the Goldilocks zone.
            </p>

            <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 text-center space-y-6">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />

                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Breathy (Open)</span>
                    <span>Balanced</span>
                    <span>Buzzy (Closed)</span>
                </div>

                <div className={`transition-all duration-300 transform ${val < 30 ? '-translate-x-12' : val > 70 ? 'translate-x-12' : ''}`}>
                    <div className={`flex flex-col items-center gap-2 ${info.color}`}>
                        <Icon size={48} className="animate-pulse" />
                        <div className="text-2xl font-black uppercase">{info.title}</div>
                        <div className="text-slate-400 max-w-xs">{info.desc}</div>
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-500 text-center">
                Drag the slider to visualize the spectrum.
            </p>
        </div>
    );
};

const AnatomyTab = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">The Layers of the Larynx</h3>
        <p className="text-slate-300">
            We can close (adduct) at multiple levels.
        </p>

        <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-900 rounded-xl border-l-4 border-indigo-500">
                <div className="font-bold text-white w-32 shrink-0">True Folds</div>
                <div className="text-slate-400 text-sm">
                    The source of your pitch. This is where we control Thick vs Thin mass.
                    <br /><span className="text-xs text-slate-500 block mt-1">Goal: Thin Edges Only.</span>
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-900 rounded-xl border-l-4 border-pink-500">
                <div className="font-bold text-white w-32 shrink-0">False Folds</div>
                <div className="text-slate-400 text-sm">
                    (Vestibular Folds) Just above the true folds. Used for straining or "GRRR" sounds.
                    <br /><span className="text-xs text-slate-500 block mt-1">Goal: Keep these OPEN (Retracted).</span>
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-900 rounded-xl border-l-4 border-yellow-500">
                <div className="font-bold text-white w-32 shrink-0">Sphincter</div>
                <div className="text-slate-400 text-sm">
                    (Aryepiglottic Sphincter) The top rim. Creates "Twang".
                    <br /><span className="text-xs text-slate-500 block mt-1">Goal: Use this for LOUDNESS (Feminine Shout).</span>
                </div>
            </div>
        </div>
    </div>
);

export default VocalWeightTheory;
