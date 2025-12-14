import { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { DAILY_TIPS } from '../../data/DailyTips';

const DailyTipWidget = () => {
    const [tip, setTip] = useState(null);

    useEffect(() => {
        selectDailyTip();
    }, []);

    const selectDailyTip = () => {
        // Use date-based seed for consistent daily tip
        const today = new Date().toISOString().split('T')[0];
        const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
        const index = seed % DAILY_TIPS.length;
        setTip(DAILY_TIPS[index]);
    };

    const getRandomTip = () => {
        const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
        setTip(DAILY_TIPS[randomIndex]);
    };

    if (!tip) return null;

    const categoryColors = {
        mindset: 'from-purple-500 to-pink-500',
        technique: 'from-blue-500 to-cyan-500',
        practice: 'from-emerald-500 to-teal-500',
        'self-care': 'from-amber-500 to-orange-500'
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[tip.category] || 'from-slate-500 to-slate-600'}`}>
                    <Lightbulb className="text-white" size={24} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Daily Tip</span>
                        <button
                            onClick={getRandomTip}
                            className="p-1 text-slate-500 hover:text-white transition-colors"
                            title="Get another tip"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <p className="text-white leading-relaxed mb-2">{tip.tip}</p>
                    <p className="text-xs text-slate-500">— {tip.source}</p>
                </div>
            </div>
        </div>
    );
};

export default DailyTipWidget;
