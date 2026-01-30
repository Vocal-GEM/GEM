import { useState, useEffect } from 'react';
import { X, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

// Tips organized by context/view
const TIPS_BY_CONTEXT = {
    dashboard: [
        { id: 'd1', text: 'Try the 5-minute warmup before each practice session to protect your voice.', category: 'best-practice' },
        { id: 'd2', text: 'Consistency matters more than duration. Even 10 minutes daily makes a difference.', category: 'motivation' },
        { id: 'd3', text: 'Use Voice Check to quickly assess how you sound today before practicing.', category: 'feature' },
    ],
    practice: [
        { id: 'p1', text: 'The orb shows your overall voice characteristics. Brighter = higher resonance.', category: 'guide' },
        { id: 'p2', text: 'Set a practice goal using the target button before starting your session.', category: 'feature' },
        { id: 'p3', text: 'Watch the recording indicator - it shows when your microphone is active.', category: 'guide' },
        { id: 'p4', text: 'Use Focus Mode to hide the side panel and concentrate on visualization.', category: 'feature' },
    ],
    pitch: [
        { id: 'pi1', text: 'The colored zones show typical pitch ranges. Aim for your target zone.', category: 'guide' },
        { id: 'pi2', text: 'Use the Pitch Pipe tool to hear reference tones and match them.', category: 'feature' },
        { id: 'pi3', text: 'Pitch stability is as important as hitting the right note. Watch for smooth lines.', category: 'technique' },
    ],
    resonance: [
        { id: 'r1', text: 'The orb grows brighter as your voice becomes more resonant (forward placement).', category: 'guide' },
        { id: 'r2', text: 'Think of "smiling" internally while speaking to increase brightness.', category: 'technique' },
        { id: 'r3', text: 'Resonance affects how your voice is perceived more than pitch alone.', category: 'knowledge' },
    ],
    spectrogram: [
        { id: 's1', text: 'Brighter horizontal lines indicate stronger harmonics. Look for patterns.', category: 'guide' },
        { id: 's2', text: 'The cursor shows frequency values - click anywhere to see exact Hz.', category: 'feature' },
        { id: 's3', text: 'Formants (F1, F2) appear as bright bands and shape your voice quality.', category: 'knowledge' },
    ],
    journal: [
        { id: 'j1', text: 'Use tags to categorize recordings and track patterns over time.', category: 'feature' },
        { id: 'j2', text: 'The pitch trend chart shows your progress across recent recordings.', category: 'guide' },
        { id: 'j3', text: 'Record in similar conditions each time for more accurate comparisons.', category: 'best-practice' },
    ],
    settings: [
        { id: 'se1', text: 'Set up a daily practice reminder to build consistency.', category: 'feature' },
        { id: 'se2', text: 'Calibrate your voice baseline for personalized tracking.', category: 'feature' },
        { id: 'se3', text: 'Export your data regularly to keep a backup of your progress.', category: 'best-practice' },
    ],
};

const CATEGORY_COLORS = {
    'best-practice': 'bg-green-500/10 border-green-500/20 text-green-400',
    'motivation': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    'feature': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    'guide': 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    'technique': 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    'knowledge': 'bg-teal-500/10 border-teal-500/20 text-teal-400',
};

const ContextualTips = ({ context = 'dashboard', compact = false }) => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [isDismissed, setIsDismissed] = useState(false);
    const [dismissedTips, setDismissedTips] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('gem_dismissed_tips') || '[]');
        } catch {
            return [];
        }
    });

    const tips = TIPS_BY_CONTEXT[context] || TIPS_BY_CONTEXT.dashboard;
    const availableTips = tips.filter(tip => !dismissedTips.includes(tip.id));

    useEffect(() => {
        // Reset to first tip when context changes
        setCurrentTipIndex(0);
        setIsDismissed(false);
    }, [context]);

    useEffect(() => {
        // Auto-rotate tips every 30 seconds if not compact
        if (compact || availableTips.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentTipIndex(prev => (prev + 1) % availableTips.length);
        }, 30000);

        return () => clearInterval(interval);
    }, [availableTips.length, compact]);

    const handleDismissTip = (tipId) => {
        const newDismissed = [...dismissedTips, tipId];
        setDismissedTips(newDismissed);
        localStorage.setItem('gem_dismissed_tips', JSON.stringify(newDismissed));

        if (currentTipIndex >= availableTips.length - 1) {
            setCurrentTipIndex(0);
        }
    };

    const handleDismissAll = () => {
        setIsDismissed(true);
    };

    const nextTip = () => {
        setCurrentTipIndex(prev => (prev + 1) % availableTips.length);
    };

    const prevTip = () => {
        setCurrentTipIndex(prev => (prev - 1 + availableTips.length) % availableTips.length);
    };

    if (isDismissed || availableTips.length === 0) return null;

    const currentTip = availableTips[currentTipIndex];
    const categoryStyle = CATEGORY_COLORS[currentTip.category] || CATEGORY_COLORS.guide;

    if (compact) {
        return (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${categoryStyle} text-sm`}>
                <Lightbulb size={14} className="flex-shrink-0" />
                <span className="flex-1 text-slate-300">{currentTip.text}</span>
                <button
                    onClick={() => handleDismissTip(currentTip.id)}
                    className="text-slate-500 hover:text-white p-1"
                >
                    <X size={12} />
                </button>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-xl border ${categoryStyle} animate-in fade-in duration-300`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">
                        <Lightbulb size={18} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                                {currentTip.category.replace('-', ' ')}
                            </span>
                            {availableTips.length > 1 && (
                                <span className="text-xs opacity-50">
                                    {currentTipIndex + 1} / {availableTips.length}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-200 text-sm">{currentTip.text}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {availableTips.length > 1 && (
                        <>
                            <button
                                onClick={prevTip}
                                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                aria-label="Previous tip"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={nextTip}
                                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                aria-label="Next tip"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleDismissAll}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        aria-label="Dismiss tips"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Function to reset dismissed tips (for testing)
export const resetDismissedTips = () => {
    localStorage.removeItem('gem_dismissed_tips');
};

export default ContextualTips;
