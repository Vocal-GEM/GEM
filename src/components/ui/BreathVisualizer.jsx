import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

const PATTERNS = {
    square: {
        name: 'Square Breathing',
        description: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s',
        phases: [
            { label: 'Inhale', duration: 4000, scale: 1.5, color: 'bg-blue-500' },
            { label: 'Hold', duration: 4000, scale: 1.5, color: 'bg-blue-400' },
            { label: 'Exhale', duration: 4000, scale: 1.0, color: 'bg-emerald-500' },
            { label: 'Hold', duration: 4000, scale: 1.0, color: 'bg-emerald-400' }
        ]
    },
    snake: {
        name: 'Snake Breath',
        description: 'Deep Inhale, Long Hissing Exhale with Puffs',
        phases: [
            { label: 'Inhale Deeply', duration: 3000, scale: 1.5, color: 'bg-blue-500' },
            { label: 'Hiss (sssss-SS-ssss)', duration: 8000, scale: 1.0, color: 'bg-yellow-500', pulse: true }
        ]
    },
    doggy: {
        name: 'Doggy Breath',
        description: 'Fast panting to activate abdominal wall',
        phases: [
            { label: 'Pant', duration: 500, scale: 1.1, color: 'bg-pink-500' },
            { label: 'Pant', duration: 500, scale: 1.0, color: 'bg-pink-500' }
        ],
        loops: 10
    },
    conscious: {
        name: 'Conscious Breathing',
        description: 'Breathe into your "beach ball" (butt/lower back)',
        phases: [
            { label: 'Inhale Low', duration: 5000, scale: 1.5, color: 'bg-purple-500' },
            { label: 'Exhale Relax', duration: 5000, scale: 1.0, color: 'bg-slate-500' }
        ]
    }
};

const BreathVisualizer = ({ type = 'square' }) => {
    const pattern = PATTERNS[type];
    const [isActive, setIsActive] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);

    useEffect(() => {
        let timeout;
        if (isActive) {
            const currentPhase = pattern.phases[phaseIndex];
            timeout = setTimeout(() => {
                setPhaseIndex((prev) => (prev + 1) % pattern.phases.length);
            }, currentPhase.duration);
        }
        return () => clearTimeout(timeout);
    }, [isActive, phaseIndex, pattern]);

    const handleToggle = () => {
        setIsActive(!isActive);
        if (!isActive) setPhaseIndex(0); // Reset on start
    };

    const handleReset = () => {
        setIsActive(false);
        setPhaseIndex(0);
    };

    const currentPhase = pattern.phases[phaseIndex];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-inner">
            <div className="mb-6">
                <h4 className="text-white font-bold text-lg mb-1">{pattern.name}</h4>
                <p className="text-slate-400 text-sm">{pattern.description}</p>
            </div>

            {/* Visualizer Container */}
            <div className="h-64 flex items-center justify-center relative mb-6">
                {/* Breathing Circle */}
                <div
                    className={`rounded-full shadow-lg shadow-black/50 transition-all ease-in-out flex items-center justify-center ${currentPhase.color} ${currentPhase.pulse && isActive ? 'animate-pulse' : ''}`}
                    style={{
                        width: '100px',
                        height: '100px',
                        transform: `scale(${isActive ? currentPhase.scale : 1})`,
                        transitionDuration: `${isActive ? currentPhase.duration : 500}ms`
                    }}
                >
                    <span className="font-bold text-white drop-shadow-md text-lg">
                        {isActive ? currentPhase.label : 'Ready?'}
                    </span>
                </div>

                {/* Tracks/Guides (for Square only maybe? No keep it simple) */}
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={handleToggle}
                    className={`px-6 py-2 rounded-full font-bold text-white flex items-center gap-2 transition-colors ${isActive ? 'bg-slate-700 hover:bg-slate-600' : 'bg-pink-600 hover:bg-pink-500'
                        }`}
                >
                    {isActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
                </button>
                <button
                    onClick={handleReset}
                    className="p-2 text-slate-500 hover:text-white rounded-full hover:bg-slate-800"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
        </div>
    );
};

export default BreathVisualizer;
