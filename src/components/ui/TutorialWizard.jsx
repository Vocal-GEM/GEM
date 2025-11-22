import React, { useState } from 'react';

const TutorialWizard = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Vocal GEM",
            content: "Your AI-powered companion for gender-affirming voice training. We'll help you find a voice that feels authentic to you.",
            icon: "👋"
        },
        {
            title: "How it Works",
            content: "We analyze your Pitch (high/low) and Resonance (bright/dark) in real-time to give you instant feedback.",
            icon: "🎙️"
        },
        {
            title: "Privacy First",
            content: "All audio processing happens right here on your device. Your voice data never leaves your browser.",
            icon: "🔒"
        },
        {
            title: "Ready to Start?",
            content: "Let's set up your profile and calibrate the app for your unique voice.",
            icon: "🚀"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
                </div>

                <div className="text-center py-8">
                    <div className="text-6xl mb-6 animate-bounce">{steps[step].icon}</div>
                    <h2 className="text-2xl font-bold text-white mb-4">{steps[step].title}</h2>
                    <p className="text-slate-300 leading-relaxed">{steps[step].content}</p>
                </div>

                <div className="flex gap-3 mt-4">
                    <button onClick={onSkip} className="flex-1 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors font-bold">Skip</button>
                    <button onClick={handleNext} className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all">
                        {step === steps.length - 1 ? "Let's Go!" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialWizard;
