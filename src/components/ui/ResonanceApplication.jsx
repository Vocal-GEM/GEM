import { useState } from 'react';
import { Key, Wind, AlertTriangle } from 'lucide-react';

const ResonanceApplication = ({ onComplete }) => {
    const [method, setMethod] = useState('key-oh');

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Applying Resonance</h2>
                <p className="text-slate-400">
                    Now that you can move your larynx, let&apos;s use it to brighten your voice.
                    Choose a method below.
                </p>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-xl">
                <button
                    onClick={() => setMethod('key-oh')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${method === 'key-oh' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Key size={18} /> The Key-Oh Method
                </button>
                <button
                    onClick={() => setMethod('whisper')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${method === 'whisper' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Wind size={18} /> The Whisper Scream
                </button>
            </div>

            <div className="min-h-[400px]">
                {method === 'key-oh' ? <KeyOhGuide /> : <WhisperScreamGuide />}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    Continue to Practice
                </button>
            </div>
        </div>
    );
};

const KeyOhGuide = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">How it Works</h3>
            <p className="text-slate-300">
                &quot;Key&quot; naturally raises the larynx (high vowel). &quot;Oh&quot; naturally lowers it.
                The goal is to say &quot;Oh&quot; using the &quot;Key&quot; position.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-900 p-4 rounded-xl text-center border border-purple-500/30">
                    <div className="text-purple-400 font-bold text-xl mb-1">1. &quot;Key&quot;</div>
                    <div className="text-sm text-slate-400">Say it bright. Feel the tongue high, larynx up.</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl text-center border border-blue-500/30">
                    <div className="text-blue-400 font-bold text-xl mb-1">2. &quot;Oh&quot;</div>
                    <div className="text-sm text-slate-400">Say it dark. Feel the open throat, larynx down.</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl text-center border border-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
                    <div className="text-white font-bold text-xl mb-1 relative">3. &quot;Key-Oh&quot;</div>
                    <div className="text-sm text-slate-300 relative">Keep the &quot;Key&quot; shape, but say &quot;Oh&quot;. Don&apos;t let it drop!</div>
                </div>
            </div>
        </div>

        <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase text-xs tracking-wider">Troubleshooting</h4>
            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg flex gap-3 text-red-200 text-sm">
                <AlertTriangle className="shrink-0" size={18} />
                <div>
                    <strong>Avoid &quot;List Prosody&quot;</strong>: Don&apos;t say &quot;1. Key, 2. Oh&quot;.
                    Say them as one unit: &quot;Key-Oh&quot;. Keep the energy up!
                </div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg flex gap-3 text-yellow-200 text-sm">
                <AlertTriangle className="shrink-0" size={18} />
                <div>
                    <strong>Statement, not Question</strong>: Don&apos;t go up in pitch (&quot;Key-Oh?&quot;).
                    Keep it flat or downward, but maintain the <em>brightness</em>.
                </div>
            </div>
        </div>
    </div>
);

const WhisperScreamGuide = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">How it Works</h3>
            <p className="text-slate-300">
                Start from silence (whisper) to find the position, then add sound. Invented by Zheanna Erose.
            </p>

            <ol className="space-y-4 list-decimal list-inside text-slate-300">
                <li className="p-2 rounded hover:bg-slate-700/50">
                    <strong>Unphonated &quot;Eh&quot; (Edge)</strong>: Whisper &quot;Eh&quot; with resistance at the vocal cords (not tongue). Should sound like a loud whisper.
                </li>
                <li className="p-2 rounded hover:bg-slate-700/50">
                    <strong>Lower Larynx</strong>: Yawn to drop the larynx while whispering. Sound gets lower/darker.
                </li>
                <li className="p-2 rounded hover:bg-slate-700/50">
                    <strong>Raise Larynx</strong>: Slowly brighten the whisper. Hear the pitch of the wind rise.
                </li>
                <li className="p-2 rounded hover:bg-slate-700/50">
                    <strong>Add Phonation</strong>: Once high, add an &quot;Ah&quot; sound.
                    <div className="mt-2 text-sm text-pink-300 italic bg-pink-900/20 p-2 rounded border border-pink-500/30">
                        Warning: It will sound whiny or ugly at first. That is SUCCESS. The only failure is dropping the larynx.
                    </div>
                </li>
            </ol>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-sm text-slate-400">
            <strong>Alternative:</strong> If &quot;Eh&quot; is hard, try &quot;Puh&quot; (as in Pudge). &quot;Puh... Puh... Puh...&quot;
        </div>
    </div>
);

export default ResonanceApplication;
