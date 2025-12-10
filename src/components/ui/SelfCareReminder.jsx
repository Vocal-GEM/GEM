import React from 'react';
import { X, ExternalLink, Heart } from 'lucide-react';
import { SelfCareService } from '../../services/SelfCareService';

/**
 * SelfCareReminder - Contextual reminder showing user's own self-care plan
 * Displayed when user appears to be struggling (long session, stuck, fatigued)
 */
const SelfCareReminder = ({ context = 'fatigued', onDismiss, onViewPlan }) => {
    const reminder = SelfCareService.getSelfCareReminder(context);
    const plan = SelfCareService.getSelfCarePlan();

    if (!reminder && !plan) {
        // No plan set, show generic encouragement
        return (
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">💆</div>
                        <div>
                            <h4 className="font-bold text-pink-300 mb-1">Take Care of Yourself</h4>
                            <p className="text-sm text-slate-300">
                                Voice practice can be emotionally challenging. Consider setting up a self-care plan
                                in Settings to prepare for tough moments.
                            </p>
                        </div>
                    </div>
                    {onDismiss && (
                        <button onClick={onDismiss} className="text-slate-400 hover:text-white shrink-0">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">{reminder?.icon || '💭'}</div>
                    <div>
                        <h4 className="font-bold text-pink-300 mb-1">{reminder?.title || 'Self-Care Reminder'}</h4>
                        <p className="text-sm text-slate-400 mb-2">{reminder?.message}</p>
                        {reminder?.userAnswer && (
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <p className="text-sm text-white italic">"{reminder.userAnswer}"</p>
                            </div>
                        )}
                    </div>
                </div>
                {onDismiss && (
                    <button onClick={onDismiss} className="text-slate-400 hover:text-white shrink-0">
                        <X size={16} />
                    </button>
                )}
            </div>

            {onViewPlan && (
                <button
                    onClick={onViewPlan}
                    className="mt-3 flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                    <Heart size={14} />
                    View full self-care plan
                </button>
            )}
        </div>
    );
};

export default SelfCareReminder;
