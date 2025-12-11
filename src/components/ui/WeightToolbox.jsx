import { useState } from 'react';
import { Mic, MoveVertical, Wind, Music, AlertCircle } from 'lucide-react';

const WeightToolbox = ({ onComplete }) => {
    const [activeTool, setActiveTool] = useState('imitation');

    const tools = [
        { id: 'imitation', label: '1. Imitation', icon: Music },
        { id: 'triggers', label: '2. Behavioral Triggers', icon: AlertCircle },
        { id: 'chicken', label: '3. Chicken Neck', icon: MoveVertical },
        { id: 'sovt', label: '4. SOVT (Straws)', icon: Wind },
        { id: 'ingression', label: '5. Ingression', icon: Wind },
        { id: 'slides', label: '6. Pitch Slides', icon: MoveVertical },
        { id: 'pop', label: '7. Pop Test', icon: Mic },
        { id: 'flow', label: '8. Flow Phonation', icon: Wind },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-2 shrink-0">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-4">
                    <h2 className="font-bold text-white mb-1">The Toolbox</h2>
                    <p className="text-xs text-slate-400">8 ways to find &quot;Thin&quot;.Experiment to find what works for YOU.</p>
                </div>
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold text-left ${activeTool === tool.id
                            ? 'bg-indigo-600 text-white shadow-lg translate-x-1'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        <tool.icon size={18} />
                        {tool.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                {activeTool === 'imitation' && <ImitationTool />}
                {activeTool === 'triggers' && <TriggersTool />}
                {activeTool === 'chicken' && <ChickenNeckTool />}
                {activeTool === 'sovt' && <SOVTTool />}
                {activeTool === 'ingression' && <IngressionTool />}
                {activeTool === 'slides' && <SlidesTool />}
                {activeTool === 'pop' && <PopTestTool />}
                {activeTool === 'flow' && <FlowPhonationTool />}

                <div className="mt-8 pt-8 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={onComplete}
                        className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2"
                    >
                        I&apos;ve explored these tools <span className="text-xl">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- Tools --- */

const FlowPhonationTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">Flow Phonation</h3>
        <p className="text-slate-300">
            Finding the balance between breath and tone.
        </p>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-6xl mb-4">🕯️</div>
            <div className="text-xl font-bold text-white mb-2">The Candle Blow</div>
            <p className="text-sm text-slate-400">
                Imagine blowing out a candle gently. <br />
                Add a sound to it: <strong>&quot;Hoooo&quot;</strong>.
            </p>
        </div>

        <div className="p-4 bg-indigo-900/20 rounded-xl text-sm text-indigo-200">
            <strong>Goal:</strong> You should feel a LOT of air moving past your lips, but still hear a clear note.
        </div>
    </div>
);

const ImitationTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">Imitation</h3>
        <p className="text-slate-300">
            Imitating voices forces your body to configure itself correctly. Try these characters:
        </p>

        <div className="grid grid-cols-1 gap-4">
            <div className="bg-pink-900/20 border border-pink-500/30 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-2xl">⭐</div>
                <div>
                    <h4 className="font-bold text-white">Patrick Star</h4>
                    <p className="text-sm text-pink-200">&quot;I&apos;m Patrick.&quot; (Duh...)</p>
                    <div className="text-xs text-slate-400 mt-1">
                        Low Pitch + <span className="text-white font-bold">THIN</span> Weight
                    </div>
                </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-2xl">🧽</div>
                <div>
                    <h4 className="font-bold text-white">SpongeBob</h4>
                    <p className="text-sm text-yellow-200">&quot;I&apos;m Ready!&quot; (Annoying laugh)</p>
                    <div className="text-xs text-slate-400 mt-1">
                        High Pitch + <span className="text-white font-bold">THICK</span> Weight + Twang
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TriggersTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">Behavioral Triggers</h3>
        <p className="text-slate-300">
            Use natural bodily functions to find the sensation.
        </p>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-yellow-500">
                <h4 className="font-bold text-white mb-2">Thick/Heavy Triggers</h4>
                <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                    <li>Coughing</li>
                    <li>Shouting (&quot;Hey!&quot;)</li>
                    <li>Grunt (&quot;Ugh&quot;)</li>
                </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-pink-500">
                <h4 className="font-bold text-white mb-2">Thin/Light Triggers</h4>
                <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                    <li>Yawning (The best one!)</li>
                    <li>Sobbing / Whimpering</li>
                    <li>Giggling (Hee hee)</li>
                </ul>
            </div>
        </div>

        <div className="mt-4 p-4 bg-indigo-900/20 rounded-xl text-sm text-indigo-200">
            <strong>Exercise:</strong> Yawn (&quot;Haaaa&quot;), notice the lightness, then try to say &quot;One&quot; (&quot;Haaa-wun&quot;).
        </div>
    </div>
);

const ChickenNeckTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">Chicken Neck</h3>
        <p className="text-slate-300">
            Physically stretching the folds from the outside.
        </p>

        <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl">
                <div className="text-4xl">🐢</div>
                <div>
                    <h4 className="font-bold text-white">1. Double Chin (Back)</h4>
                    <p className="text-sm text-slate-400">Push chin back. Compresses folds. Makes BIG THICK sound.</p>
                </div>
            </div>

            <div className="flex justify-center text-slate-500 text-2xl">⬇️</div>

            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-pink-500/50">
                <div className="text-4xl">🐔</div>
                <div>
                    <h4 className="font-bold text-white">2. Chicken (Forward)</h4>
                    <p className="text-sm text-slate-400">
                        Lead with your chin forward. Stretches folds. Makes <span className="text-pink-400">THIN</span> sound.
                    </p>
                </div>
            </div>

            <div className="flex justify-center text-slate-500 text-2xl">⬇️</div>

            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl">
                <div className="text-4xl">😐</div>
                <div>
                    <h4 className="font-bold text-white">3. Neutral (Return)</h4>
                    <p className="text-sm text-slate-400">Pull back to normal posture while <em>keeping</em> the thin feeling.</p>
                </div>
            </div>
        </div>
    </div>
);

const SOVTTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">Semi-Occluded Vocal Tract (SOVT)</h3>
        <p className="text-slate-300">
            Blocking the mouth creates &quot;Back Pressure&quot; which helps folds close gently (Bernoulli Effect).
        </p>

        <div className="grid grid-cols-2 gap-4">
            {['Straw Phonation', 'Lip Trills (Brrr)', 'Blowfish Face', 'Closed Nostril Hum'].map(item => (
                <div key={item} className="bg-slate-900 p-3 rounded-lg text-center text-sm font-bold text-slate-300 border border-slate-700 hover:border-indigo-500 transition-colors">
                    {item}
                </div>
            ))}
        </div>

        <div className="p-4 bg-slate-900 rounded-xl space-y-2">
            <h4 className="font-bold text-white">The Routine</h4>
            <ol className="list-decimal list-inside text-sm text-slate-400 space-y-2">
                <li>Hum/Sing into the straw (or closed nostril).</li>
                <li>Notice how easy/light it feels.</li>
                <li>Remove the straw and keep singing immediately.</li>
                <li>Try to keep that same &quot;Easy&quot; feeling.</li>
            </ol>
        </div>
    </div>
);

const IngressionTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">Ingression</h3>
        <p className="text-slate-300">
            Making sound while breathing IN. It&apos;s weird, but it forces thinness.
        </p>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-6xl mb-4">😮</div>
            <div className="text-xl font-bold text-white mb-2">The Gasp</div>
            <p className="text-sm text-slate-400">
                Gasp inward with a tiny squeak. That is pure thinness.
            </p>
        </div>

        <div className="p-4 bg-indigo-900/20 rounded-xl text-sm text-indigo-200">
            <strong>Challenge:</strong> Gasp In (Squeak) → Exhale Out (Same Squeak).
            <br />In... Out... In... Out...
        </div>
    </div>
);

const SlidesTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">Pitch Slides</h3>
        <p className="text-slate-300">
            Slide from Thick (Low) to Thin (High).
        </p>

        <div className="h-32 bg-slate-900 rounded-xl relative overflow-hidden flex items-end px-4 pb-4">
            <div className="absolute top-0 right-0 p-16 bg-pink-500/20 blur-xl rounded-full"></div>
            {/* Visual Graph */}
            <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,100 Q50,100 100,0" stroke="url(#gradient)" strokeWidth="4" fill="none" />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#eab308" /> {/* Yellow Thick */}
                        <stop offset="100%" stopColor="#ec4899" /> {/* Pink Thin */}
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute bottom-2 left-2 text-yellow-500 font-bold text-sm">Thick / Low</div>
            <div className="absolute top-2 right-2 text-pink-500 font-bold text-sm">Thin / High</div>
        </div>

        <p className="text-sm text-center text-slate-400">
            Start with a &quot;Hey&quot; (Chest) and slide up to a &quot;Woo&quot; (Head). <br />
            Then try to bring that &quot;Woo&quot; feeling back down.
        </p>
    </div>
);

const PopTestTool = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white">The Pop Test</h3>
        <p className="text-slate-300">
            Rapidly switching between Thick and Thin on the SAME note.
        </p>

        <div className="flex justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-500 animate-pulse">
                THICK
            </div>
            <div className="flex items-center text-slate-500">vs</div>
            <div className="w-24 h-24 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center font-bold text-pink-500 animate-pulse delay-75">
                THIN
            </div>
        </div>

        <p className="text-sm text-center text-slate-400 bg-slate-900 p-4 rounded-xl">
            Sounds like: &quot;Ah (Heavy) - Ah (Light) - Ah (Heavy)&quot;.<br />
            You should hear a &quot;Pop&quot; or &quot;Flip&quot; between them. If you don&apos;t hear a difference, you aren&apos;t moving enough.
        </p>
    </div>
);

export default WeightToolbox;
