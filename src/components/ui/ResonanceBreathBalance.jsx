import { useState } from 'react';
import { Wind, Zap, MoveHorizontal, Volume2 } from 'lucide-react';

const ResonanceBreathBalance = ({ onComplete }) => {
    const [balance, setBalance] = useState(50); // 0=Breathy (Hee), 100=Pressed (Nee)

    const getProperties = (val) => {
        if (val < 30) return {
            vowel: 'HEE',
            quality: 'Too Breathy',
            desc: 'High Open Quotient. Air leaks out. Relaxed but weak.',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            icon: Wind
        };
        if (val > 70) return {
            vowel: 'NEE',
            quality: 'Too Pressed',
            desc: 'Low Open Quotient. No air. Bright but tight/whiny.',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/20',
            icon: Zap
        };
        return {
            vowel: 'MEE',
            quality: 'Balanced',
            desc: 'The Sweet Spot. Bright resonance + Enough airflow to release tension.',
            color: 'text-pink-400',
            bg: 'bg-pink-500/20',
            icon: Volume2
        };
    };

    const props = getProperties(balance);
    const Icon = props.icon;

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Resonance + Breath Balance</h2>
                <p className="text-slate-400">
                    We tend to tense up when we brighten our resonance.
                    The cure is <strong>Open Quotient (Breath)</strong>.
                    <br /><br />
                    We need to find the balance between the &quot;Nee&quot; (Bright/Tight) and the &quot;Hee&quot; (Breathy/Loose).
                </p>
            </div>

            {/* Interactive Slider Area */}
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl text-center space-y-8">

                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>Hee (Breathy)</span>
                    <span>Nee (Pressed)</span>
                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={balance}
                    onChange={(e) => setBalance(parseInt(e.target.value))}
                    className="w-full h-4 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />

                <div className={`p-6 rounded-xl border border-slate-700/50 transition-all duration-300 ${props.bg}`}>
                    <div className={`flex flex-col items-center gap-4 ${props.color}`}>
                        <Icon size={64} className="animate-bounce" />
                        <h3 className="text-4xl font-black">{props.vowel}</h3>
                        <div className="space-y-1">
                            <div className="text-xl font-bold">{props.quality}</div>
                            <div className="text-sm text-slate-300 max-w-sm mx-auto">{props.desc}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mt-4">
                    <div className="text-left">0% Tension<br />100% Flow</div>
                    <div className="text-center font-bold text-white">50/50 Balance</div>
                    <div className="text-right">100% Tension<br />0% Flow</div>
                </div>
            </div>

            <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30 flex gap-4">
                <MoveHorizontal className="text-indigo-400 shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-indigo-100">Exercise: The Slide</h4>
                    <p className="text-sm text-indigo-300 mt-1">
                        Start at &quot;NEE&quot; (Tight). Slowly relax into &quot;MEE&quot; (Balanced).
                        If you go too far, you&apos;ll hit &quot;HEE&quot; (Breathy).
                        <br />
                        <strong>Goal:</strong> Keep the Brightness of Nee, but with the Ease of Hee.
                    </p>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    I Found The Balance
                </button>
            </div>
        </div>
    );
};

export default ResonanceBreathBalance;
