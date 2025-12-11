import { useState } from 'react';
import { Music, Anchor, Sun, MessageCircle, Info } from 'lucide-react';

const VoiceAlterationLesson = ({ onComplete }) => {
    const [activeTab, setActiveTab] = useState('pitch');

    const tabs = [
        { id: 'pitch', label: 'Pitch', icon: <Music size={18} /> },
        { id: 'weight', label: 'Weight', icon: <Anchor size={18} /> },
        { id: 'resonance', label: 'Resonance', icon: <Sun size={18} /> },
        { id: 'inflection', label: 'Inflection', icon: <MessageCircle size={18} /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 p-1 bg-slate-800 rounded-lg w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px] border border-slate-700 rounded-2xl p-6 bg-slate-900/50">
                {activeTab === 'pitch' && <PitchSection />}
                {activeTab === 'weight' && <WeightSection />}
                {activeTab === 'resonance' && <ResonanceSection />}
                {activeTab === 'inflection' && <InflectionSection />}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-pink-900/20"
                >
                    Complete Lesson
                </button>
            </div>
        </div>
    );
};

const PitchSection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="text-pink-500" /> Pitch (Source)
        </h3>
        <p className="text-slate-300 text-lg">
            Highness vs. Lowness. Determined by how stretched the vocal folds are (like a guitar string).
        </p>

        <div className="bg-slate-800 p-6 rounded-xl space-y-4">
            <h4 className="font-bold text-white mb-2">The Ranges</h4>

            {/* Range Viz */}
            <div className="space-y-4">
                <div className="relative h-12 bg-slate-700/50 rounded-lg overflow-hidden flex items-center">
                    <div className="absolute left-[10%] w-[40%] h-full bg-blue-500/30 border-l-4 border-blue-500 flex items-center pl-2">
                        <span className="text-xs font-bold text-blue-300">Masculine (A2-A3)</span>
                    </div>
                </div>
                <div className="relative h-12 bg-slate-700/50 rounded-lg overflow-hidden flex items-center">
                    <div className="absolute left-[35%] w-[40%] h-full bg-pink-500/30 border-l-4 border-pink-500 flex items-center pl-2">
                        <span className="text-xs font-bold text-pink-300">Feminine (F3-F4)</span>
                    </div>
                </div>
                <div className="relative h-8">
                    <div className="absolute left-[35%] w-[15%] h-full border-2 border-dashed border-yellow-500/50 rounded flex items-center justify-center">
                        <span className="text-xs text-yellow-500 font-bold">Overlap Zone</span>
                    </div>
                </div>
            </div>

            <div className="text-sm text-slate-400 italic">
                &quot;It&apos;s extremely possible to find a note in the overlap that is sufficiently feminine.&quot;
            </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-lg flex items-start gap-3">
            <Info className="text-blue-400 shrink-0 mt-1" size={20} />
            <div>
                <h5 className="font-bold text-blue-300">Myth Buster</h5>
                <p className="text-blue-200 text-sm">
                    We don&apos;t need &quot;Minnie Mouse&quot; falsetto.Feminine voices aren&apos;t cartoons. We aim for a natural range, not the stratosphere.
                </p>
            </div>
        </div>
    </div>
);

const WeightSection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Anchor className="text-amber-500" /> Vocal Weight (Source)
        </h3>
        <p className="text-slate-300 text-lg">
            Thickness vs. Thinness (Spectral Tilt). Think of an elastic band: thick when relaxed, thin when stretched.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 border border-slate-700">
                <div className="w-full h-8 bg-amber-600 rounded-full shadow-lg"></div>
                <div>
                    <div className="font-bold text-white text-lg">Thick (Heavy)</div>
                    <div className="text-slate-400 text-sm">More buzzing, louder, &quot;masculine&quot; tendency.</div>
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 border border-slate-700">
                <div className="w-full h-2 bg-amber-400 rounded-full shadow-lg mt-3 mb-3"></div>
                <div>
                    <div className="font-bold text-white text-lg">Thin (Light)</div>
                    <div className="text-slate-400 text-sm">Less buzzing, softer, &quot;feminine&quot; tendency.</div>
                </div>
            </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-2">The Goal: Lightness without Breathiness</h4>
            <p className="text-slate-400 text-sm">
                Testosterone thickens vocal folds. We use SOVT exercises (Straws!) to find the lightest *complete* closure.
                Avoid breathiness—it&apos;s sultry but inefficient.
            </p>
        </div>
    </div>
);

const ResonanceSection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sun className="text-yellow-500" /> Resonance (Filter)
        </h3>
        <p className="text-slate-300 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-400">
            The Most Important Quality.
        </p>
        <p className="text-slate-300">
            Brightness vs. Darkness. Modified by the size and shape of the vocal tract (Throat + Mouth).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h4 className="font-bold text-white mb-4">R1: Pharynx (The Gender Dial)</h4>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Large Throat (Low Larynx)</span>
                        <span>Small Throat (High Larynx)</span>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-slate-900 to-yellow-500 rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow border-2 border-yellow-500"></div>
                    </div>
                    <div className="flex justify-between font-bold text-white">
                        <span>Darker 🌑</span>
                        <span>Brighter ☀️</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h4 className="font-bold text-white mb-2">R2: Mouth (Oral Geometry)</h4>
                <p className="text-slate-400 text-sm mb-4">
                    You are already an expert at this! It&apos;s how we make vowels (Ee vs Ah).
                </p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-700 rounded text-white font-mono">Ee</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-yellow-400">Small/Bright</span>
                </div>
                <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-slate-700 rounded text-white font-mono">Ah</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-blue-400">Large/Dark</span>
                </div>
            </div>
        </div>
    </div>
);

const InflectionSection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="text-purple-500" /> Inflection (Putting it Together)
        </h3>
        <p className="text-slate-300 text-lg">
            Also called Prosody or Contour. It&apos;s Pitch, Weight, and Resonance in action.
        </p>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h4 className="font-bold text-white mb-2">Context Matters</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li><strong className="text-purple-400">English:</strong> Highly gendered. Feminine = Dynamic (Disney Princess). Masculine = Flat (Neo).</li>
                <li><strong className="text-blue-400">French/Spanish:</strong> Less gendered inflection.</li>
                <li><strong className="text-pink-400">Japanese:</strong> Extremely gendered.</li>
            </ul>
            <p className="mt-4 text-slate-400 italic text-sm">
                &quot;Listen to the people in your life and determine if there&apos;s a pattern you want to copy.&quot;
            </p>
        </div>
    </div>
);

export default VoiceAlterationLesson;
