/**
 * FeatureUnlockOverlay.jsx
 * 
 * Shows when new features are unlocked and displays locked feature gates.
 */

import { useEffect } from 'react';
import {
    Unlock, Lock, Star, X, Sparkles, Gift
} from 'lucide-react';
import BeginnerModeService from '../../services/BeginnerModeService';
import { getXPData } from '../../services/XPService';

// Celebration overlay when feature unlocks
export const UnlockCelebration = ({ feature, onClose }) => {
    useEffect(() => {
        // Auto-close after 5 seconds
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-sm w-full bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-3xl border border-purple-500/30 p-8 text-center shadow-2xl">
                <div className="relative">
                    {/* Sparkles */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Sparkles className="text-amber-400 animate-pulse" size={32} />
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Unlock className="text-white" size={36} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">New Feature Unlocked!</h2>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300 mb-3">
                        {feature.label}
                    </div>
                    <p className="text-purple-200 text-sm mb-6">{feature.description}</p>

                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-purple-100 transition-colors"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
};

// Locked feature gate
export const LockedFeatureGate = ({ feature, compact = false }) => {
    const xp = getXPData();
    const progress = Math.min(100, (xp.totalXP / feature.xp) * 100);

    if (compact) {
        return (
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center gap-3">
                <Lock size={16} className="text-slate-500" />
                <div className="flex-1">
                    <span className="text-sm text-slate-400">{feature.label}</span>
                    <span className="text-xs text-slate-500 ml-2">
                        ({feature.xpNeeded} XP to unlock)
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                <Lock className="text-slate-500" size={28} />
            </div>
            <h3 className="font-bold text-white mb-1">{feature.label}</h3>
            <p className="text-sm text-slate-400 mb-4">{feature.description}</p>

            {/* Progress bar */}
            <div className="mb-2">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            <p className="text-xs text-slate-500">
                {feature.xpNeeded} more XP to unlock
            </p>
        </div>
    );
};

// Progress panel showing all unlocks
const FeatureUnlockPanel = ({ onClose }) => {
    const { unlocked, locked } = BeginnerModeService.getUnlockedFeatures();
    const xp = getXPData();
    const nextUnlock = BeginnerModeService.getNextUnlock();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[85vh] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20">
                            <Gift className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white">Feature Unlocks</h2>
                            <p className="text-xs text-purple-300">
                                {unlocked.length} unlocked • Level {xp.level}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Next unlock preview */}
                {nextUnlock && (
                    <div className="p-4 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-b border-slate-800">
                        <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">Next Unlock</div>
                        <div className="flex items-center gap-3">
                            <Star className="text-amber-400" size={20} />
                            <div className="flex-1">
                                <div className="font-bold text-white">{nextUnlock.label}</div>
                                <div className="text-xs text-slate-400">{nextUnlock.xpNeeded} XP away</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feature list */}
                <div className="p-4 overflow-y-auto max-h-96 space-y-2">
                    {/* Unlocked */}
                    {unlocked.map(feature => (
                        <div key={feature.id} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                            <Unlock size={16} className="text-emerald-400" />
                            <div className="flex-1">
                                <div className="font-bold text-emerald-300 text-sm">{feature.label}</div>
                                <div className="text-xs text-slate-400">{feature.description}</div>
                            </div>
                        </div>
                    ))}

                    {/* Locked */}
                    {locked.map(feature => (
                        <div key={feature.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-3 opacity-60">
                            <Lock size={16} className="text-slate-500" />
                            <div className="flex-1">
                                <div className="text-sm text-slate-400">{feature.label}</div>
                                <div className="text-xs text-slate-500">Level {feature.level} • {feature.xp} XP</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeatureUnlockPanel;
