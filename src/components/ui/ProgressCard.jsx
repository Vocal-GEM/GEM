import React, { useRef, useState, useEffect } from 'react';
import { Share2, Download, X, Flame, Clock, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

const ProgressCard = ({ stats, onClose }) => {
    const cardRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        setCanShare(!!navigator.share);
    }, []);

    // Calculate stats
    const totalMinutes = Math.round((stats?.totalSeconds || 0) / 60);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const streak = stats?.currentStreak || 0;
    const sessions = stats?.totalSessions || 0;

    // Calculate days since first session
    const firstSession = stats?.firstSessionDate;
    const daysSinceStart = firstSession
        ? Math.floor((Date.now() - new Date(firstSession).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2, // High quality
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `voice-progress-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to generate image:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
            });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'voice-progress.png', { type: 'image/png' });

            await navigator.share({
                title: 'My Voice Training Progress',
                text: `${sessions} sessions, ${streak} day streak! 🎤`,
                files: [file],
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                // Fallback to download
                handleDownload();
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-amber-400" size={20} />
                        Share Your Progress
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* The Card to Export */}
                <div
                    ref={cardRef}
                    className="bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 rounded-2xl p-6 mb-4 relative overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                    {/* Logo/Title */}
                    <div className="text-center mb-6 relative">
                        <div className="text-3xl mb-1">🎤</div>
                        <h4 className="text-white font-bold text-lg">Voice Training Journey</h4>
                        <p className="text-white/60 text-sm">GEM Voice Coach</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 relative">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{streak}</div>
                            <div className="text-xs text-white/60 uppercase tracking-wider">Day Streak</div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Clock className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{totalHours}h</div>
                            <div className="text-xs text-white/60 uppercase tracking-wider">Practice</div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{sessions}</div>
                            <div className="text-xs text-white/60 uppercase tracking-wider">Sessions</div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{daysSinceStart}</div>
                            <div className="text-xs text-white/60 uppercase tracking-wider">Days Active</div>
                        </div>
                    </div>

                    {/* Motivational text */}
                    <div className="text-center mt-6 relative">
                        <p className="text-white/80 text-sm italic">
                            "Every practice session is a step towards my authentic voice."
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Download size={18} />
                        Download
                    </button>

                    {canShare && (
                        <button
                            onClick={handleShare}
                            disabled={isGenerating}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Share2 size={18} />
                            Share
                        </button>
                    )}
                </div>

                {isGenerating && (
                    <div className="text-center text-slate-400 text-sm mt-3 animate-pulse">
                        Generating image...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressCard;
