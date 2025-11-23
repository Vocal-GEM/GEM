import React, { useState } from 'react';

const WarmUpModule = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const exercises = [
        {
            title: 'Lip Trills',
            icon: '💋',
            instructions: 'Blow air through your lips to make them vibrate (like a motorboat). Do this for 30 seconds.',
            duration: 30,
            demo: 'Brrrrrrr...'
        },
        {
            title: 'Humming',
            icon: '🎵',
            instructions: 'Hum gently on "mmm" at a comfortable pitch. Feel the vibration in your lips and face.',
            duration: 30,
            demo: 'Mmmmmm...'
        },
        {
            title: 'Sirens',
            icon: '🚨',
            instructions: 'Glide smoothly from your lowest note to your highest and back down. Keep it gentle.',
            duration: 30,
            demo: 'Wooooo...'
        }
    ];

    const handleNext = () => {
        if (currentStep < exercises.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const exercise = exercises[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="text-center mb-6">
                        <div className="text-7xl mb-4 animate-bounce">{exercise.icon}</div>
                        <h2 className="text-2xl font-bold text-white mb-2">{exercise.title}</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">{exercise.instructions}</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 mb-6 text-center">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Example</div>
                        <div className="text-2xl font-serif text-blue-300">{exercise.demo}</div>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {exercises.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-orange-500 w-8' : i < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                                    }`}
                            ></div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onSkip}
                            className="flex-1 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-wider"
                        >
                            Skip Warm-Up
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 text-sm uppercase tracking-wider"
                        >
                            {currentStep === exercises.length - 1 ? "I'm Warmed Up!" : 'Next Exercise'}
                        </button>
                    </div>

                    <div className="mt-4 text-center text-[10px] text-slate-500">
                        💡 Warm-ups protect your voice and improve performance
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarmUpModule;
