import { useState } from 'react';
import { Layers, Move, AlertCircle, Mic } from 'lucide-react';

const TonalConsistency = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('theory'); // theory, anchors, nasality

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Tonal Consistency</h2>
                <p className="text-slate-400">
                    Masculine speech &quot;chews&quot; vowels (moving the jaw/tongue excessively).
                    Feminine speech maintains a consistent &quot;Bright&quot; container (R1) while the tongue dances inside.
                </p>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-xl">
                {[
                    { id: 'theory', label: 'The Theory (R1/R2/R3)', icon: Layers },
                    { id: 'anchors', label: 'The EE Anchor', icon: Move },
                    { id: 'nasality', label: 'Nasality Check', icon: Mic },
                ].map(tab => (
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

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl min-h-[400px]">
                {activeTab === 'theory' && <TheoryTab />}
                {activeTab === 'anchors' && <AnchorTab />}
                {activeTab === 'nasality' && <NasalityTab />}
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

/* Sub-components */

const TheoryTab = () => (
    <div className="space-y-6 animate-in fade-in">
        <h3 className="text-xl font-bold text-white">The Resonance Chambers</h3>
        <p className="text-slate-300">
            We change resonance by changing the shape of the tube.
        </p>

        <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-slate-900 rounded-xl border-l-4 border-indigo-500">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">R1</div>
                <div>
                    <h4 className="font-bold text-white">The Throat (Pharynx)</h4>
                    <p className="text-sm text-slate-400">
                        This is the &quot;Big Knob&quot;. Squeeze the throat (like swallowing) to make it smaller = Brighter sound.
                    </p>
                </div>
            </div>

            <div className="flex gap-4 p-4 bg-slate-900 rounded-xl border-l-4 border-pink-500">
                <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xl">R2</div>
                <div>
                    <h4 className="font-bold text-white">The Mouth (Oral Cavity)</h4>
                    <p className="text-sm text-slate-400">
                        Controlled by tongue height. High Tongue (&quot;EE&quot;) = Smaller space = Brighter sound.
                    </p>
                </div>
            </div>

            <div className="flex gap-4 p-4 bg-slate-900 rounded-xl border-l-4 border-yellow-500">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-xl">R3</div>
                <div>
                    <h4 className="font-bold text-white">The Lips</h4>
                    <p className="text-sm text-slate-400">
                        Spread lips (Smile) = Shorter tube = Brighter. Round lips (Ooh) = Longer tube = Darker.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const AnchorTab = () => (
    <div className="space-y-6 animate-in fade-in">
        <h3 className="text-xl font-bold text-white">The &quot;EE&quot; Anchor</h3>
        <p className="text-slate-300">
            Most feminine vowels are modified towards &quot;EE&quot;. Why? Because &quot;EE&quot; forces the tongue high (Small R2).
        </p>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-6 rounded-xl text-center border border-green-500/30">
                <div className="text-4xl mb-4">😁</div>
                <h4 className="font-bold text-white">The Goal</h4>
                <p className="text-sm text-slate-400">
                    Keep the back of the tongue HIGH and WIDE (touching upper molars) like you are saying &quot;EE&quot;, even when saying &quot;Ah&quot;.
                </p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl text-center border border-red-500/30">
                <div className="text-4xl mb-4">😮</div>
                <h4 className="font-bold text-white">The Habit</h4>
                <p className="text-sm text-slate-400">
                    Dropping the jaw and tongue floor for every vowel. This creates &quot;Muddy&quot; or &quot;Dark&quot; spots in your speech.
                </p>
            </div>
        </div>

        <div className="p-4 bg-indigo-900/20 text-indigo-200 rounded-xl text-sm border border-indigo-500/20">
            <strong>Try it:</strong> Say &quot;EE&quot;. Feel the sides of your tongue touching your top teeth. <br />
            Now say &quot;Ah&quot; <em>without letting the tongue lose contact with the teeth</em>.
        </div>
    </div>
);

const NasalityTab = () => (
    <div className="space-y-6 animate-in fade-in">
        <h3 className="text-xl font-bold text-white">Nasality vs. Brightness</h3>
        <p className="text-slate-300">
            We want Brightness (Oral Resonance), not Nasality (Nasal Resonance). They are often confused.
        </p>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 space-y-4">
            <h4 className="font-bold text-white border-b border-slate-700 pb-2">The Nose Pinch Test</h4>
            <ol className="list-decimal list-inside text-slate-300 space-y-2">
                <li>Say a vowel: <strong>&quot;Ahhhhh&quot;</strong></li>
                <li>While sustaining it, <strong>pinch your nose</strong>.</li>
                <li>
                    Did the sound change?
                    <ul className="pl-6 list-disc text-slate-400 mt-1">
                        <li><strong>Yes (Quack sound):</strong> You are Nasal (Air represents escaping nose).</li>
                        <li><strong>No Change:</strong> You are Oral (Good!).</li>
                    </ul>
                </li>
            </ol>
        </div>

        <div className="p-4 bg-yellow-900/20 text-yellow-200 rounded-xl text-sm border border-yellow-500/20 flex gap-2">
            <AlertCircle className="shrink-0" />
            <span>
                <strong>Fix:</strong> If you are nasal, imagine the sound hitting the hard palate (roof of mouth) instead of the mask of the face.
            </span>
        </div>
    </div>
);

export default TonalConsistency;
