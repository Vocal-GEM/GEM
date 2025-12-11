import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Info, Smile } from 'lucide-react';

/**
 * BrightnessMeter - Visual F2 brightness tracking with /i/ reference
 * 
 * Based on research: All vowels should have an underlying /i/ posture
 * for bright resonance. F2 is the primary acoustic correlate of brightness.
 */
const BrightnessMeter = ({ dataRef, showTip = true }) => {
    const [brightness, setBrightness] = useState({
        score: 0,
        zone: 'neutral',
        f2Current: 0,
        f2Target: 2300
    });
    const [showTooltip, setShowTooltip] = useState(false);
    const animationRef = useRef();

    useEffect(() => {
        const update = () => {
            if (dataRef?.current) {
                const { f2 } = dataRef.current;

                if (f2 && f2 > 0) {
                    // Calculate brightness based on F2
                    const f2Min = 700;
                    const f2Max = 2300; // /i/ target
                    const f2Clamped = Math.max(f2Min, Math.min(f2, f2Max + 300));
                    const score = ((f2Clamped - f2Min) / (f2Max - f2Min)) * 100;

                    let zone = 'neutral';
                    if (score < 35) zone = 'dark';
                    else if (score >= 60) zone = 'bright';

                    setBrightness({
                        score: Math.max(0, Math.min(100, score)),
                        zone,
                        f2Current: f2,
                        f2Target: 2300
                    });
                }
            }
            animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationRef.current);
    }, [dataRef]);

    const getZoneColor = () => {
        switch (brightness.zone) {
            case 'dark': return 'from-red-500 to-orange-500';
            case 'bright': return 'from-emerald-500 to-teal-500';
            default: return 'from-yellow-500 to-amber-500';
        }
    };

    const getZoneLabel = () => {
        switch (brightness.zone) {
            case 'dark': return 'Dark';
            case 'bright': return 'Bright ✓';
            default: return 'Neutral';
        }
    };

    const getTip = () => {
        switch (brightness.zone) {
            case 'dark': return 'Think /i/ - spread lips slightly like a smile 😊';
            case 'bright': return 'Sweet spot! Maintain this bright posture';
            default: return 'Getting brighter - add more /i/ posture';
        }
    };

    return (
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getZoneColor()}`}>
                        {brightness.zone === 'dark' ? (
                            <Moon className="w-4 h-4 text-white" />
                        ) : (
                            <Sun className="w-4 h-4 text-white" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Brightness Meter</h3>
                        <p className="text-xs text-slate-400">F2 → /i/ Target</p>
                    </div>
                </div>
                <button
                    className="text-slate-600 hover:text-slate-300 transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute z-50 mt-2 p-3 bg-slate-900/95 backdrop-blur border border-white/10 rounded-lg text-xs text-slate-300 max-w-xs shadow-xl">
                    Measures how &quot;bright&quot; or &quot;forward&quot; your vowel resonance is based on F2 frequency.
                    The /i/ vowel (as in &quot;feet&quot;) has the highest F2 and is your brightness target.
                </div>
            )}

            {/* Main Gauge */}
            <div className="relative h-8 bg-slate-800 rounded-full overflow-hidden mb-3">
                {/* Gradient background showing dark to bright */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 via-yellow-900/50 to-emerald-900/50" />

                {/* Target zone indicator */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white/30"
                    style={{ left: '60%' }}
                />

                {/* Current position indicator */}
                <div
                    className={`absolute top-1 bottom-1 w-4 rounded-full bg-gradient-to-b ${getZoneColor()} shadow-lg transition-all duration-200`}
                    style={{ left: `calc(${brightness.score}% - 8px)` }}
                />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                    <Moon size={10} />
                    Dark
                </span>
                <span className={`font-bold ${brightness.zone === 'dark' ? 'text-red-400' :
                    brightness.zone === 'bright' ? 'text-emerald-400' :
                        'text-yellow-400'
                    }`}>
                    {getZoneLabel()}
                </span>
                <span className="flex items-center gap-1">
                    Bright
                    <Sun size={10} />
                </span>
            </div>

            {/* F2 Values */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-white">
                        {brightness.f2Current > 0 ? brightness.f2Current.toFixed(0) : '—'}
                    </div>
                    <div className="text-xs text-slate-500">Current F2</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-emerald-400">
                        {brightness.f2Target}
                    </div>
                    <div className="text-xs text-slate-500">/i/ Target</div>
                </div>
            </div>

            {/* Tip */}
            {showTip && (
                <div className={`flex items-start gap-2 p-3 rounded-xl ${brightness.zone === 'dark' ? 'bg-red-500/10 border border-red-500/20' :
                    brightness.zone === 'bright' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                        'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                    <Smile className={`w-4 h-4 shrink-0 mt-0.5 ${brightness.zone === 'dark' ? 'text-red-400' :
                        brightness.zone === 'bright' ? 'text-emerald-400' :
                            'text-yellow-400'
                        }`} />
                    <p className="text-xs text-slate-300">{getTip()}</p>
                </div>
            )}
        </div>
    );
};

export default BrightnessMeter;
