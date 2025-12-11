import { useState, useEffect } from 'react';
import { Play, Activity, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FOCUS_AREAS } from '../../data/PracticeCardsData';
import { usePracticeCards } from '../../context/PracticeCardsContext';

const PracticeCardItem = ({ card, index, onSelect, onViewActivity }) => {
    const { getCardActivity, cardActivities } = usePracticeCards();
    const { t } = useTranslation();
    const [activity, setActivity] = useState(null);

    // Load activity on mount
    useEffect(() => {
        const loadActivity = async () => {
            if (cardActivities[card.id]) {
                setActivity(cardActivities[card.id]);
            } else {
                const data = await getCardActivity(card.id);
                setActivity(data);
            }
        };
        loadActivity();
    }, [card.id, getCardActivity, cardActivities]);

    const focusInfo = FOCUS_AREAS[card.focus] || FOCUS_AREAS.general;

    return (
        <div className="group bg-slate-800/40 hover:bg-slate-800/70 rounded-xl border border-white/5 hover:border-violet-500/30 p-4 transition-all">
            <div className="flex items-start gap-3">
                {/* Index Number */}
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-400">{index}</span>
                </div>

                {/* Card Content */}
                <div className="flex-1 min-w-0">
                    {/* Focus Badge */}
                    <div
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-2"
                        style={{
                            backgroundColor: `${focusInfo.color}20`,
                            color: focusInfo.color
                        }}
                    >
                        {focusInfo.label}
                    </div>

                    {/* Text */}
                    <p className="text-sm text-white leading-relaxed line-clamp-2">
                        {card.text}
                    </p>

                    {/* Activity Stats */}
                    {activity && activity.totalPractices > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                                <Mic className="w-3 h-3" />
                                {activity.totalPractices} {t('practiceCards.practices')}
                            </span>
                            {activity.savedRecordings > 0 && (
                                <span>• {activity.savedRecordings} {t('practiceCards.activity.savedRecordings')}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onSelect(); }}
                        className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-violet-500/20"
                        title="Practice this card"
                    >
                        <Play className="w-4 h-4" fill="currentColor" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewActivity(); }}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                        title="View activity"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PracticeCardItem;
