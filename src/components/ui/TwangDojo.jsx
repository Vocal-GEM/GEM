import { useState } from 'react';
import { Zap, Volume2, MoveVertical } from 'lucide-react';

const TwangDojo = ({ onComplete }) => {
    const [activeTool, setActiveTool] = useState('concept');

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">The Twang Dojo</h2>
                <p className="text-slate-400">
                    Twang is &quot;The Laser Effect&quot;. It adds piercing brightness without adding weight.
                    It turns a quiet &quot;Breath&quot; voice into a &quot;Power&quot; voice.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { id: 'concept', label: 'What is it?', icon: Zap },
                    { id: 'baby', label: 'The Baby Cry', icon: Volume2 },
                    { id: 'witch', label: 'The Witch', icon: MoveVertical },
                ].map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${activeTool === tool.id
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <tool.icon size={24} />
                        <span>{tool.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl min-h-[350px]">
                {activeTool === 'concept' && <ConceptTab />}
                {activeTool === 'baby' && <BabyTab />}
                {activeTool === 'witch' && <WitchTab />}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Can Twang
                </button>
            </div>
        </div>
    );
};

/* Sub-Components */

const ConceptTab = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">The Epilaryngeal Funnel</h3>
        <p className="text-slate-300">
            Twang narrows the &quot;funnel&quot; just above the vocal cords.
            It boosts the volume by 15-20 decibels <em>without</em> needing more air or muscle effort.
        </p>

        <div className="flex gap-4 p-4 bg-slate-900 rounded-xl border-l-4 border-yellow-500">
            <Zap className="shrink-0 text-yellow-500" />
            <div className="text-sm">
                <strong className="text-white block mb-1">Key Insight:</strong>
                Feminine voices often use Twang to get &quot;Loudness&quot; instead of &quot;Heavy Weight&quot; (Shouting).
            </div>
        </div>

        <div className="text-center p-8">
            <div className="inline-block text-6xl animate-pulse">📢</div>
        </div>
    </div>
);

const BabyTab = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">The Baby Cry</h3>
        <p className="text-slate-300">
            Babies can scream for hours without losing their voice. Why? <strong>Twang</strong>.
        </p>

        <div className="bg-slate-900 p-6 rounded-xl text-center space-y-4">
            <div className="text-5xl">👶</div>
            <h4 className="text-2xl font-black text-white">&quot;Wah! Wah!&quot;</h4>
            <p className="text-slate-400">
                Imitate a bratty annoying baby. <br />
                Feel the sound squeeze right behind your nose? That&apos;s it.
            </p>
        </div>

        <div className="p-4 bg-indigo-900/20 text-indigo-200 rounded-xl text-sm border border-indigo-500/20">
            <strong>Exercise:</strong> Make the &quot;Wah&quot; sound, then slowly morph it into a normal &quot;Ah&quot;. Keep the ring!
        </div>
    </div>
);

const WitchTab = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">The Witch Cackle</h3>
        <p className="text-slate-300">
            Another classic trigger for high-larynx twang.
        </p>

        <div className="bg-slate-900 p-6 rounded-xl text-center space-y-4">
            <div className="text-5xl">🧙‍♀️</div>
            <h4 className="text-2xl font-black text-white">&quot;Hee Hee Hee!&quot;</h4>
            <p className="text-slate-400">
                Make a wicked witch laugh. <br />
                Notice how your tongue goes high and wide? That&apos;s high resonance + twang.
            </p>
        </div>

        <div className="p-4 bg-indigo-900/20 text-indigo-200 rounded-xl text-sm border border-indigo-500/20">
            <strong>Check:</strong> Is it scratchy in the throat? If yes, stop. It should feel buzzy in the nose/face, not scratchy.
        </div>
    </div>
);

export default TwangDojo;
