import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, RefreshCw } from 'lucide-react';

// Daily motivational tips
const DAILY_TIPS = [
    {
        id: 1,
        category: 'mindset',
        tip: 'Your voice is uniquely yours. There\'s no "wrong" way to sound - only your authentic expression.',
        source: 'Voice Coach Wisdom'
    },
    {
        id: 2,
        category: 'technique',
        tip: 'Breathe from your diaphragm. Deep belly breaths give you better control and reduce tension.',
        source: 'Breathing Basics'
    },
    {
        id: 3,
        category: 'practice',
        tip: 'Consistency beats intensity. 10 minutes daily is more effective than 70 minutes once a week.',
        source: 'Training Science'
    },
    {
        id: 4,
        category: 'mindset',
        tip: 'Progress isn\'t always linear. Plateaus are normal and often precede breakthroughs.',
        source: 'Growth Mindset'
    },
    {
        id: 5,
        category: 'technique',
        tip: 'Forward resonance comes from thinking "bright" - imagine your voice bouncing off the front of your face.',
        source: 'Resonance Tips'
    },
    {
        id: 6,
        category: 'self-care',
        tip: 'Hydration matters! Drink water throughout the day, not just during practice.',
        source: 'Vocal Health'
    },
    {
        id: 7,
        category: 'mindset',
        tip: 'Be patient with yourself. Voice changes take time, and every practice session matters.',
        source: 'Gentle Reminder'
    },
    {
        id: 8,
        category: 'technique',
        tip: 'Pitch is just one part of voice. Resonance, inflection, and word choice matter too.',
        source: 'Holistic Approach'
    },
    {
        id: 9,
        category: 'practice',
        tip: 'Record yourself regularly. You\'ll hear changes you can\'t notice in real-time.',
        source: 'Progress Tracking'
    },
    {
        id: 10,
        category: 'self-care',
        tip: 'If your voice feels strained, take a break. Pushing through pain can cause harm.',
        source: 'Safety First'
    },
    {
        id: 11,
        category: 'technique',
        tip: 'SOVTE exercises (straws, lip trills) are great for warming up without strain.',
        source: 'Warm-Up Tips'
    },
    {
        id: 12,
        category: 'mindset',
        tip: 'Celebrate small wins. Every comfortable phrase in your new voice is a victory.',
        source: 'Positive Reinforcement'
    }
];

const DailyTipWidget = ({ onShowAll }) => {
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

export { DAILY_TIPS };
export default DailyTipWidget;
