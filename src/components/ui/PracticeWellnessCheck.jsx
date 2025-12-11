import { useState } from 'react';
import { Heart, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SelfCareService } from '../../services/SelfCareService';

/**
 * PracticeWellnessCheck - Post-session wellness assessment
 * Helps users check in with their physical and emotional state after practice.
 */
const PracticeWellnessCheck = ({ onComplete, onDismiss, sessionDuration }) => {
    const [fatigue, setFatigue] = useState(3);
    const [tension, setTension] = useState(3);
    const [mood, setMood] = useState(3);
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);

    const handleSubmit = () => {
        const entry = SelfCareService.logWellnessCheck({
            fatigue,
            tension,
            mood,
            notes: notes.trim(),
            sessionDuration
        });
        onComplete?.(entry);
    };

    const renderScale = (label, value, setValue, lowLabel, highLabel, color) => (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">{label}</span>
                <span className={`font-bold ${color}`}>{value}/5</span>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        onClick={() => setValue(n)}
                        className={`flex-1 h-10 rounded-lg transition-all ${n <= value
                            ? n <= 2
                                ? 'bg-emerald-500'
                                : n === 3
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                            : 'bg-slate-700'
                            } ${n === value ? 'ring-2 ring-white/50' : ''}`}
                        aria-label={`${label}: ${n}`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{lowLabel}</span>
                <span>{highLabel}</span>
            </div>
        </div>
    );

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Heart className="text-pink-400" size={20} />
                    How Are You Feeling?
                </h3>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <p className="text-slate-400 text-sm mb-6">
                Take a moment to check in with yourself after this practice session.
            </p>

            {/* Scales */}
            {renderScale(
                'Voice Fatigue',
                fatigue,
                setFatigue,
                'None',
                'Very tired',
                fatigue <= 2 ? 'text-emerald-400' : fatigue >= 4 ? 'text-rose-400' : 'text-amber-400'
            )}

            {renderScale(
                'Physical Tension',
                tension,
                setTension,
                'Relaxed',
                'Very tense',
                tension <= 2 ? 'text-emerald-400' : tension >= 4 ? 'text-rose-400' : 'text-amber-400'
            )}

            {renderScale(
                'Emotional State',
                mood,
                setMood,
                'Great',
                'Struggling',
                mood <= 2 ? 'text-emerald-400' : mood >= 4 ? 'text-rose-400' : 'text-amber-400'
            )}

            {/* Notes toggle */}
            <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
                {showNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Add notes (optional)
            </button>

            {showNotes && (
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any thoughts about this session..."
                    className="w-full h-20 bg-slate-700 border border-slate-600 rounded-xl p-3 text-white text-sm placeholder:text-slate-500 focus:border-pink-500 outline-none resize-none mb-4"
                />
            )}

            {/* Warning if high scores */}
            {(fatigue >= 4 || tension >= 4 || mood >= 4) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                    <p className="text-amber-300 text-sm">
                        💛 Your scores indicate you might need a break. Remember: consistent short sessions
                        beat occasional long ones. It&apos;s okay to stop here.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default PracticeWellnessCheck;
