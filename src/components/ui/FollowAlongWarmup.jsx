import React, { useState } from 'react';
import { Play, Pause, SkipForward, ChevronRight, Activity, Smile, Music } from 'lucide-react';

const WARMUP_STEPS = [
    // PART 1: BODY
    {
        section: 'Body Stretch',
        icon: <Activity />,
        title: 'Arm Stretch',
        desc: 'Cross arm over chest. Pull gently. Breathe.',
        duration: 15
    },
    {
        section: 'Body Stretch',
        icon: <Activity />,
        title: 'Tricep Stretch',
        desc: 'Arm overhead, grab elbow. Pull back. Switch sides.',
        duration: 15
    },
    {
        section: 'Body Stretch',
        icon: <Activity />,
        title: 'Quad Stretch',
        desc: 'Hold one foot up behind you. Balance or lie down.',
        duration: 20
    },
    {
        section: 'Body Stretch',
        icon: <Activity />,
        title: 'Hamstring Stretch',
        desc: 'Heel on ground, lean forward. Switch feet.',
        duration: 20
    },
    {
        section: 'Body Stretch',
        icon: <Activity />,
        title: 'Side Lunge',
        desc: 'Spread legs, lean to one side (Groin stretch).',
        duration: 20
    },
    {
        section: 'Body Stretch',
        icon: <Activity />,
        title: 'Shoulders',
        desc: 'Roll back, shake out. Roll forward. Shrug (Tight!) then release.',
        duration: 30
    },
    {
        section: 'Body Stretch',
        icon: <Activity />,
        title: 'Rag Doll',
        desc: 'Fold forward, chest on thighs, relax neck. Slowly curl up.',
        duration: 30
    },

    // PART 2: FACE & NECK
    {
        section: 'Face & Neck',
        icon: <Smile />,
        title: 'Posture Check',
        desc: 'Foundations. Pelvis tilted, chest proud, head floating.',
        duration: 15
    },
    {
        section: 'Face & Neck',
        icon: <Smile />,
        title: 'Message: Shoulders & Neck',
        desc: 'Self-massage. Use the "Mama Cat" grip on back of neck.',
        duration: 30
    },
    {
        section: 'Face & Neck',
        icon: <Smile />,
        title: 'Laryngeal Massage',
        desc: 'Gently wiggle the larynx left/right. Relax jaw.',
        duration: 20
    },
    {
        section: 'Face & Neck',
        icon: <Smile />,
        title: 'Big Yawn',
        desc: 'Open back of throat. Avoid opening front too wide.',
        duration: 10
    },
    {
        section: 'Face & Neck',
        icon: <Smile />,
        title: 'Raisins & Grapes',
        desc: 'Face scrunch (Raisin) -> Face Wide (Grape). Repeat.',
        duration: 15
    },
    {
        section: 'Face & Neck',
        icon: <Smile />,
        title: 'Shake Weight',
        desc: 'Clasped hands, shake jaw. "La la la". Loose loose loose.',
        duration: 15
    },

    // PART 3: VOCALIZATIONS
    {
        section: 'Vocalizations',
        icon: <Music />,
        title: 'Activate Breath',
        desc: 'Long hiss "Sssss". Engage abdominals outward.',
        duration: 20
    },
    {
        section: 'Vocalizations',
        icon: <Music />,
        title: 'Descending Sigh',
        desc: '"Ah" from high to low. Keep air moving.',
        duration: 20
    },
    {
        section: 'Vocalizations',
        icon: <Music />,
        title: 'No-No-No Gliss',
        desc: 'Fish lips. "Nooooo" low-high-low.',
        duration: 20
    },
    {
        section: 'Vocalizations',
        icon: <Music />,
        title: 'Pitch Circles',
        desc: '"Ahhh". Low to high circles, getting bigger.',
        duration: 20
    },
    {
        section: 'Vocalizations',
        icon: <Music />,
        title: 'Lip Trills',
        desc: 'Brrrr. Explore range high and low.',
        duration: 30
    },
    {
        section: 'Vocalizations',
        icon: <Music />,
        title: 'Straw Phonation',
        desc: 'Hum into straw (or "Vvv"). 1-5-1 slides. "Um-Uh-Um".',
        duration: 60
    }
];

const FollowAlongWarmup = ({ onComplete }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    // In a real app, this would sync with the audio player. Here we just step through manually or auto-advance if we had audio.

    const currentStep = WARMUP_STEPS[stepIndex];
    const isLastStep = stepIndex === WARMUP_STEPS.length - 1;

    const nextStep = () => {
        if (isLastStep) {
            onComplete?.();
        } else {
            setStepIndex(prev => prev + 1);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-600 rounded-lg text-white">
                        {currentStep.icon}
                    </div>
                    <div>
                        <div className="text-xs text-pink-400 font-bold uppercase tracking-wider">
                            Part {Math.floor(stepIndex / 7) + 1}: {currentStep.section}
                        </div>
                        <h2 className="text-white font-bold text-lg">{currentStep.title}</h2>
                    </div>
                </div>
                <div className="text-slate-400 font-mono text-sm">
                    {stepIndex + 1} / {WARMUP_STEPS.length}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
                {/* Background visual or progress ring could go here */}

                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {currentStep.title}
                </h1>

                <p className="text-xl text-slate-300 max-w-lg mb-8 leading-relaxed">
                    {currentStep.desc}
                </p>

                {/* Progress Bar for the whole session */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                    <div
                        className="h-full bg-pink-500 transition-all duration-300"
                        style={{ width: `${((stepIndex) / (WARMUP_STEPS.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/50 p-6 flex justify-center gap-6 border-t border-slate-700 backdrop-blur-sm">
                <button
                    onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                    disabled={stepIndex === 0}
                    className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-all"
                >
                    Back
                </button>

                <button
                    onClick={nextStep}
                    className="px-12 py-4 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-500 hover:scale-105 transition-all shadow-lg shadow-pink-900/40 flex items-center gap-2"
                >
                    {isLastStep ? 'Finish Warm-Up' : 'Next Exercise'} <ChevronRight />
                </button>
            </div>
        </div>
    );
};

export default FollowAlongWarmup;
