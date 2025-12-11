import { useState } from 'react';
import { Activity, Type, Music, MoveHorizontal, AlignCenter } from 'lucide-react';

const ProsodyTheory = ({ onComplete }) => {
    const [activeKey, setActiveKey] = useState('bounce');

    const keys = [
        { id: 'bounce', icon: Activity, label: 'Bounciness', desc: 'Moving pitch constantly. Never flat.' },
        { id: 'tempo', icon: MoveHorizontal, label: 'Tempo', desc: 'Slowing down for emphasis. Speeding up for flow.' },
        { id: 'elongation', icon: Music, label: 'Elongation', desc: 'Stretching vowels to express emotion.' },
        { id: 'diction', icon: Type, label: 'Diction', desc: 'Crisp consonants. Ending your words.' },
        { id: 'separation', icon: AlignCenter, label: 'Separation', desc: 'Treating syllables as individual notes.' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">The 5 Keys of Prosody</h2>
                <p className="text-slate-400">
                    &quot;Prosody&quot; is the melody and rhythm of speech. <br />
                    Without it, you sound &quot;Monotone&quot; (which reads as Masculine).
                    With it, you sound &quot;Alive&quot; (which reads as Feminine).
                </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {keys.map(k => (
                    <button
                        key={k.id}
                        onClick={() => setActiveKey(k.id)}
                        className={`p-4 rounded-xl font-bold flex flex-col items-center gap-2 min-w-[120px] transition-all border ${activeKey === k.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                    >
                        <k.icon size={24} />
                        <span className="text-sm">{k.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl min-h-[300px]">
                {activeKey === 'bounce' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-indigo-400">Bounciness</h3>
                        <p className="text-xl text-white">&quot;Don&apos;t walk. Dance.&quot;</p>
                        <p className="text-slate-300">
                            Masculine speech tends to hit a note and stay there. Feminine speech is rarely static.
                            It&apos;s always moving up or down, even on a single syllable.
                        </p>
                        <div className="p-4 bg-slate-900 rounded-xl">
                            <div className="text-center font-mono text-lg">
                                &quot;Hello&quot; &rarr; &quot;He-↗llo-↘&quot;
                            </div>
                        </div>
                    </div>
                )}
                {activeKey === 'tempo' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-pink-400">Tempo Variation</h3>
                        <p className="text-xl text-white">&quot;Fast for facts. Slow for feelings.&quot;</p>
                        <p className="text-slate-300">
                            Don&apos;t speak at one speed. Speed up through unimportant words (&quot;and then i went to the&quot;),
                            and SLOW DOWN on the Gold Nugggets (&quot;STORE&quot;).
                        </p>
                    </div>
                )}
                {activeKey === 'elongation' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-yellow-400">Vowel Elongation</h3>
                        <p className="text-xl text-white">&quot;Luxuriate in the Vowels.&quot;</p>
                        <p className="text-slate-300">
                            Short clipped vowels sound militant. Long vowels sound warm and engaging.
                            <br />
                            Don&apos;t say &quot;Gud&quot;. Say &quot;Goooood&quot;.
                        </p>
                    </div>
                )}
                {activeKey === 'diction' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-green-400">Diction & Articulation</h3>
                        <p className="text-xl text-white">&quot;Crisp Consonants.&quot;</p>
                        <p className="text-slate-300">
                            Feminine speech is often more precise. Pronounce your T&apos;s and K&apos;s.
                            Don&apos;t &quot;mumble&quot;. Use your lips and teeth.
                        </p>
                    </div>
                )}
                {activeKey === 'separation' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-blue-400">Syllable Separation</h3>
                        <p className="text-xl text-white">&quot;Every. Syllable. Counts.&quot;</p>
                        <p className="text-slate-300">
                            When we slur words together, we lose pitch control.
                            Treat every syllable as a separate note on a piano.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Have Studied The 5 Keys
                </button>
            </div>
        </div>
    );
};

export default ProsodyTheory;
