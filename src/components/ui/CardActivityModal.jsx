import React, { useState, useEffect } from 'react';
import { X, Activity, Mic, Clock, ExternalLink, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePracticeCards } from '../../context/PracticeCardsContext';
import { findCardById } from '../../data/PracticeCardsData';

const CardActivityModal = ({ cardId, onClose }) => {
    const { getCardActivity, getRecordingsForCard, customCardSets } = usePracticeCards();
    const { t } = useTranslation();

    const [activity, setActivity] = useState(null);
    const [recordings, setRecordings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [card, setCard] = useState(null);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [activityData, recordingIds] = await Promise.all([
                    getCardActivity(cardId),
                    getRecordingsForCard(cardId)
                ]);
                setActivity(activityData);
                setRecordings(recordingIds);

                const cardData = findCardById(cardId, customCardSets);
                setCard(cardData);
            } catch (err) {
                console.error('Error loading activity:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [cardId, getCardActivity, getRecordingsForCard, customCardSets]);

    // Format duration
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md max-h-[80vh] bg-slate-900 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{t('practiceCards.activity.title')}</h3>
                            <p className="text-xs text-slate-400">{t('practiceCards.activity.subtitle')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Card Preview */}
                            {card && (
                                <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-500 mb-1">{card.setName}</p>
                                    <p className="text-sm text-white line-clamp-2">{card.text}</p>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
                                    <Mic className="w-5 h-5 mx-auto mb-1 text-violet-400" />
                                    <div className="text-xl font-bold text-white">
                                        {activity?.totalPractices || 0}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                                        {t('practiceCards.activity.totalPractices')}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
                                    <ExternalLink className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                                    <div className="text-xl font-bold text-white">
                                        {activity?.savedRecordings || 0}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                                        {t('practiceCards.activity.savedRecordings')}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
                                    <Clock className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                                    <div className="text-xl font-bold text-white">
                                        {activity?.totalDurationMs
                                            ? formatDuration(activity.totalDurationMs)
                                            : '0s'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                                        {t('practiceCards.activity.totalTime')}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            {activity?.recentActivity?.length > 0 ? (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        {t('practiceCards.activity.recentActivity')}
                                    </h4>
                                    <div className="space-y-2">
                                        {activity.recentActivity.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm text-slate-300">
                                                        {formatDate(item.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500">
                                                        {item.durationMs ? formatDuration(item.durationMs) : '-'}
                                                    </span>
                                                    {item.saved && (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                                            Saved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Activity className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                                    <p className="text-sm text-slate-500">{t('practiceCards.activity.noHistory')}</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {t('practiceCards.activity.startPracticing')}
                                    </p>
                                </div>
                            )}

                            {/* Recordings Link */}
                            {recordings.length > 0 && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            // TODO: Navigate to HistoryView filtered by these recordings
                                            console.log('Navigate to recordings:', recordings);
                                            onClose();
                                        }}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/30 text-violet-300 font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {t('practiceCards.activity.exploreRecordings', { count: recordings.length })}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardActivityModal;
