import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getRecommendations } from '../../services/RecommendationService';
import { TRAINING_CATEGORIES } from '../../data/trainingData';

const RecommendedExercises = ({ onViewCategory }) => {
    const recommendations = getRecommendations();

    const getCategoryColor = (categoryId) => {
        const category = TRAINING_CATEGORIES.find(c => c.id === categoryId);
        return category?.color || 'slate';
    };

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-400" size={20} />
                Recommended for You
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec, idx) => (
                    <div
                        key={idx}
                        className={`bg-slate-800/50 border border-${getCategoryColor(rec.category)}-500/30 rounded-xl p-4 hover:bg-slate-800 transition-colors cursor-pointer group`}
                        onClick={() => onViewCategory?.(rec.category)}
                    >
                        <div className="text-xs text-slate-400 mb-2">{rec.reason}</div>
                        {rec.exercise && (
                            <>
                                <div className={`font-bold text-${getCategoryColor(rec.category)}-400 mb-1`}>
                                    {rec.exercise.title}
                                </div>
                                <div className="text-xs text-slate-500 line-clamp-2">
                                    {rec.exercise.content?.substring(0, 60)}...
                                </div>
                            </>
                        )}
                        <div className="flex justify-end mt-2">
                            <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedExercises;
