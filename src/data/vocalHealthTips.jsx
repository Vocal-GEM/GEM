import { Droplets, HeartPulse, Moon, AlertTriangle, Music, Stethoscope, Utensils, Zap, Wind } from 'lucide-react';
import React from 'react';

export const vocalHealthTips = [
    {
        id: 1,
        icon: <Droplets className="text-blue-400" />,
        title: 'Hydration is Key',
        desc: 'Your vocal cords need moisture to vibrate efficiently. Drink water throughout the day, and eat water-rich foods like cucumber and watermelon.',
        color: 'blue'
    },
    {
        id: 2,
        icon: <Zap className="text-yellow-400" />,
        title: 'Avoid Irritants',
        desc: 'Smoke (including vaping), excessive caffeine, and alcohol can dry out or irritate your vocal cords. Moderation is your friend.',
        color: 'yellow'
    },
    {
        id: 3,
        icon: <Moon className="text-indigo-400" />,
        title: 'Rest Your Voice',
        desc: 'Vocal naps are powerful. If you’ve been talking all day, take 15 minutes of complete silence to let inflammation subside.',
        color: 'indigo'
    },
    {
        id: 4,
        icon: <AlertTriangle className="text-red-400" />,
        title: 'Stop If It Hurts',
        desc: 'Pain is a warning sign. If practicing feels scratchy or painful, stop immediately. Pushing through can cause damage.',
        color: 'red'
    },
    {
        id: 5,
        icon: <Music className="text-pink-400" />,
        title: 'Warm Up Gently',
        desc: 'Start every day with gentle humming or lip trills. It wakes up the muscles without strain, like stretching before a run.',
        color: 'pink'
    },
    {
        id: 6,
        icon: <Stethoscope className="text-emerald-400" />,
        title: 'Check With a Pro',
        desc: 'Persistent hoarseness lasting more than 2 weeks should be checked by an ENT or laryngologist.',
        color: 'emerald'
    },
    {
        id: 7,
        icon: <Utensils className="text-orange-400" />,
        title: 'Reflux Management',
        desc: 'Acid reflux can burn vocal cords while you sleep. Avoid heavy meals before bed and sleep with your head slightly elevated.',
        color: 'orange'
    },
    {
        id: 8,
        icon: <Wind className="text-cyan-400" />,
        title: 'Monitor Environment',
        desc: 'Dry air is tough on voices. Use a humidifier in your bedroom, especially during winter or in dry climates.',
        color: 'cyan'
    }
];
