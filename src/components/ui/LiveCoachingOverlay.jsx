/**
 * LiveCoachingOverlay.jsx
 * 
 * Real-time coaching overlay that shows contextual feedback during practice.
 * Non-intrusive toast-style messages that appear and fade naturally.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    MessageCircle, TrendingUp, Volume2, Sparkles,
    AlertTriangle, ThumbsUp, X, Settings
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import LiveCoachingService from '../../services/LiveCoachingService';
import { triggerHaptic } from '../../utils/haptics';

const FEEDBACK_DISPLAY_MS = 4000; // Show each message for 4 seconds

const LiveCoachingOverlay = ({ enabled = true, position = 'bottom-right' }) => {
    const { dataRef, isAudioActive } = useAudio();
    const { targetRange } = useProfile();

    const [currentFeedback, setCurrentFeedback] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [feedbackQueue, setFeedbackQueue] = useState([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        enabled: true,
        haptics: true,
        frequency: 'normal' // 'minimal', 'normal', 'verbose'
    });

    // Poll for coaching feedback
    useEffect(() => {
        if (!enabled || !isAudioActive || isMinimized || !settings.enabled) return;

        const checkInterval = setInterval(() => {
            if (!dataRef.current) return;

            const metrics = {
                pitch: dataRef.current.pitch || 0,
                resonance: dataRef.current.resonance || 50,
                weight: dataRef.current.weight || 50,
                tilt: dataRef.current.tilt || -12
            };

            const targets = {
                pitch: targetRange || { min: 160, max: 260 }
            };

            const feedback = LiveCoachingService.getRealtimeFeedback(metrics, targets);

            if (feedback) {
                // Adjust for frequency setting
                if (settings.frequency === 'minimal' && feedback.severity !== 'warning') {
                    if (Math.random() > 0.3) return; // Skip 70% of non-warnings
                }

                setFeedbackQueue(prev => [...prev, feedback]);
            }
        }, 2000); // Check every 2 seconds

        return () => clearInterval(checkInterval);
    }, [enabled, isAudioActive, targetRange, isMinimized, settings]);

    // Process feedback queue
    useEffect(() => {
        if (feedbackQueue.length === 0 || currentFeedback) return;

        const next = feedbackQueue[0];
        setCurrentFeedback(next);
        setFeedbackQueue(prev => prev.slice(1));
        setIsVisible(true);

        // Haptic feedback for warnings
        if (next.severity === 'warning' && settings.haptics) {
            triggerHaptic('warning');
        } else if (next.severity === 'praise' && settings.haptics) {
            triggerHaptic('success');
        }

        // Auto-hide after display time
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setCurrentFeedback(null), 300); // Wait for fade animation
        }, FEEDBACK_DISPLAY_MS);

        return () => clearTimeout(timer);
    }, [feedbackQueue, currentFeedback, settings.haptics]);

    const getIcon = (type, severity) => {
        if (severity === 'warning') return <AlertTriangle size={18} />;
        if (severity === 'praise') return <ThumbsUp size={18} />;

        switch (type) {
            case 'pitch': return <TrendingUp size={18} />;
            case 'resonance': return <Volume2 size={18} />;
            case 'encouragement': return <Sparkles size={18} />;
            default: return <MessageCircle size={18} />;
        }
    };

    const getColors = (severity) => {
        switch (severity) {
            case 'warning': return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
            case 'praise': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
            case 'suggestion': return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
            default: return 'bg-slate-800/90 border-slate-600 text-slate-200';
        }
    };

    const positionClasses = {
        'bottom-right': 'bottom-24 right-4',
        'bottom-left': 'bottom-24 left-4',
        'top-right': 'top-20 right-4',
        'top-left': 'top-20 left-4'
    };

    if (!enabled) return null;

    return (
        <>
            {/* Minimized indicator */}
            {isMinimized && (
                <button
                    onClick={() => setIsMinimized(false)}
                    className={`fixed ${positionClasses[position]} z-40 p-3 bg-slate-800/90 border border-slate-600 rounded-full shadow-lg transition-all hover:scale-105`}
                >
                    <MessageCircle size={20} className="text-teal-400" />
                </button>
            )}

            {/* Main Overlay */}
            {!isMinimized && currentFeedback && (
                <div
                    className={`fixed ${positionClasses[position]} z-40 max-w-sm transform transition-all duration-300 ${isVisible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-4 opacity-0'
                        }`}
                >
                    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-xl ${getColors(currentFeedback.severity)}`}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-white/10 shrink-0">
                                {getIcon(currentFeedback.type, currentFeedback.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm leading-snug">
                                    {currentFeedback.message}
                                </p>
                                {currentFeedback.tip && (
                                    <p className="text-xs mt-1 opacity-70">
                                        💡 {currentFeedback.tip}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(() => setCurrentFeedback(null), 100);
                                }}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Panel (mini) */}
            {!isMinimized && showSettings && (
                <div className={`fixed ${positionClasses[position]} z-50 mt-16 w-64 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl`}>
                    <h4 className="text-sm font-bold text-white mb-3">Coaching Settings</h4>

                    <label className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-300">Enable coaching</span>
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                            className="w-4 h-4 rounded"
                        />
                    </label>

                    <label className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-300">Haptic feedback</span>
                        <input
                            type="checkbox"
                            checked={settings.haptics}
                            onChange={(e) => setSettings(prev => ({ ...prev, haptics: e.target.checked }))}
                            className="w-4 h-4 rounded"
                        />
                    </label>

                    <div className="py-2">
                        <span className="text-sm text-slate-300 block mb-2">Frequency</span>
                        <select
                            value={settings.frequency}
                            onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white"
                        >
                            <option value="minimal">Minimal</option>
                            <option value="normal">Normal</option>
                            <option value="verbose">Verbose</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setShowSettings(false)}
                        className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg"
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Control buttons (when active) */}
            {!isMinimized && !currentFeedback && isAudioActive && settings.enabled && (
                <div className={`fixed ${positionClasses[position]} z-40 flex gap-2`}>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 bg-slate-800/80 border border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-2 bg-slate-800/80 border border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </>
    );
};

export default LiveCoachingOverlay;
