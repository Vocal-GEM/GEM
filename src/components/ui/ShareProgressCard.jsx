import React, { useRef, useState } from 'react';
import { Share2, Download, Twitter, Copy, Check } from 'lucide-react';
import { getStreakData } from '../../services/StreakService';
import { getXPData } from '../../services/DailyChallengeService';
import { getActivitySummary } from '../../services/SessionReportService';

const ShareProgressCard = () => {
    const cardRef = useRef(null);
    const [copied, setCopied] = useState(false);

    const streak = getStreakData();
    const xp = getXPData();
    const activity = getActivitySummary();

    const generateShareText = () => {
        return `🎤 My Vocal GEM Progress\n` +
            `🔥 ${streak.currentStreak} day streak\n` +
            `⭐ Level ${xp.level} (${xp.totalXP} XP)\n` +
            `📈 ${activity.last30Days?.sessions || 0} sessions this month\n\n` +
            `#VoiceTraining #VocalGEM`;
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generateShareText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTwitterShare = () => {
        const text = encodeURIComponent(generateShareText());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Preview Card */}
            <div
                ref={cardRef}
                className="p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50"
            >
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">My Progress</h3>
                    <p className="text-slate-400 text-sm">Vocal GEM • Voice Training</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-3xl font-bold text-orange-400">{streak.currentStreak}</div>
                        <div className="text-xs text-slate-400">Day Streak</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-3xl font-bold text-purple-400">{xp.level}</div>
                        <div className="text-xs text-slate-400">Level</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-3xl font-bold text-blue-400">{activity.last30Days?.sessions || 0}</div>
                        <div className="text-xs text-slate-400">Sessions</div>
                    </div>
                </div>
            </div>

            {/* Share Actions */}
            <div className="p-4 bg-slate-950 flex gap-2">
                <button
                    onClick={handleCopy}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <button
                    onClick={handleTwitterShare}
                    className="py-3 px-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl"
                >
                    <Twitter size={18} />
                </button>
            </div>
        </div>
    );
};

export default ShareProgressCard;
