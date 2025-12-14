/**
 * PracticeSessionTimer.jsx
 * 
 * Tracks practice session duration and provides wellness reminders:
 * - Hydration reminder every 15 minutes
 * - Rest reminder at 20 minutes
 * - Break suggestion at 30+ minutes
 */

import { useState, useEffect, useRef } from 'react';
import { Timer, Droplets, Coffee, AlertTriangle, X, Pause } from 'lucide-react';

const HYDRATION_INTERVAL = 15 * 60 * 1000; // 15 minutes
const REST_WARNING = 20 * 60; // 20 minutes in seconds
const BREAK_SUGGESTION = 30 * 60; // 30 minutes in seconds

const PracticeSessionTimer = ({ isActive = true, onPause }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showReminder, setShowReminder] = useState(null); // 'hydration' | 'rest' | 'break' | null
    const [dismissedReminders, setDismissedReminders] = useState([]);
    const lastHydrationRef = useRef(Date.now());

    // Timer effect
    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive]);

    // Check for reminders
    useEffect(() => {
        if (!isActive || showReminder) return;

        const now = Date.now();

        // Check hydration reminder
        if (now - lastHydrationRef.current >= HYDRATION_INTERVAL && !dismissedReminders.includes('hydration')) {
            setShowReminder('hydration');
            return;
        }

        // Check break suggestion (30+ min)
        if (elapsedSeconds >= BREAK_SUGGESTION && !dismissedReminders.includes('break')) {
            setShowReminder('break');
            return;
        }

        // Check rest warning (20+ min)
        if (elapsedSeconds >= REST_WARNING && !dismissedReminders.includes('rest')) {
            setShowReminder('rest');
            return;
        }
    }, [elapsedSeconds, isActive, showReminder, dismissedReminders]);

    const handleDismiss = (type) => {
        if (type === 'hydration') {
            lastHydrationRef.current = Date.now();
        } else {
            setDismissedReminders(prev => [...prev, type]);
        }
        setShowReminder(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Determine timer color based on duration
    const getTimerColor = () => {
        if (elapsedSeconds >= BREAK_SUGGESTION) return 'text-red-400';
        if (elapsedSeconds >= REST_WARNING) return 'text-amber-400';
        return 'text-emerald-400';
    };

    return (
        <>
            {/* Compact Timer Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                <Timer size={14} className="text-slate-400" />
                <span className={`font-mono text-sm font-bold ${getTimerColor()}`}>
                    {formatTime(elapsedSeconds)}
                </span>
                {elapsedSeconds >= REST_WARNING && (
                    <span className="text-xs text-amber-400 animate-pulse">⚡</span>
                )}
            </div>

            {/* Reminder Popups */}
            {showReminder === 'hydration' && (
                <ReminderPopup
                    icon={Droplets}
                    iconColor="text-blue-400"
                    bgColor="from-blue-600/20 to-cyan-600/20"
                    borderColor="border-blue-500/30"
                    title="Hydration Break"
                    message="Time for a sip of water! Keeping your vocal cords hydrated improves resonance and protects your voice."
                    primaryAction={{ label: "I'll Drink Water", onClick: () => handleDismiss('hydration') }}
                    secondaryAction={{ label: "Remind Later", onClick: () => handleDismiss('hydration') }}
                />
            )}

            {showReminder === 'rest' && (
                <ReminderPopup
                    icon={Coffee}
                    iconColor="text-amber-400"
                    bgColor="from-amber-600/20 to-orange-600/20"
                    borderColor="border-amber-500/30"
                    title="Consider a Break"
                    message="You've been practicing for 20 minutes - great dedication! A short break helps prevent vocal fatigue."
                    primaryAction={{ label: "Keep Going", onClick: () => handleDismiss('rest') }}
                    secondaryAction={onPause ? { label: "Take a Break", onClick: () => { handleDismiss('rest'); onPause(); } } : undefined}
                />
            )}

            {showReminder === 'break' && (
                <ReminderPopup
                    icon={AlertTriangle}
                    iconColor="text-red-400"
                    bgColor="from-red-600/20 to-pink-600/20"
                    borderColor="border-red-500/30"
                    title="Rest Recommended"
                    message="You've been practicing for 30+ minutes. Extended practice without breaks can strain your voice. Consider a 5-10 minute break."
                    primaryAction={onPause ? { label: "Take a Break", onClick: () => { handleDismiss('break'); onPause(); } } : { label: "I'll Stop Soon", onClick: () => handleDismiss('break') }}
                    secondaryAction={{ label: "5 More Minutes", onClick: () => handleDismiss('break') }}
                    urgent
                />
            )}
        </>
    );
};

/**
 * Reminder popup component
 */
const ReminderPopup = ({
    icon: Icon,
    iconColor,
    bgColor,
    borderColor,
    title,
    message,
    primaryAction,
    secondaryAction,
    urgent = false
}) => (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm animate-in slide-in-from-right duration-300">
        <div className={`bg-gradient-to-br ${bgColor} backdrop-blur-xl rounded-2xl p-5 border ${borderColor} shadow-2xl`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-white/10 ${urgent ? 'animate-pulse' : ''}`}>
                    <Icon size={24} className={iconColor} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{message}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={primaryAction.onClick}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${urgent
                                    ? 'bg-red-500 hover:bg-red-400 text-white'
                                    : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                        >
                            {primaryAction.label}
                        </button>
                        {secondaryAction && (
                            <button
                                onClick={secondaryAction.onClick}
                                className="px-4 py-2 rounded-lg font-bold text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {secondaryAction.label}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PracticeSessionTimer;
