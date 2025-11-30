import React, { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';

const TutorialWizard = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(0);
    const { switchProfile } = useProfile();
    const [selectedGoal, setSelectedGoal] = useState(null);

    const steps = [
        {
            title: "Welcome to Vocal GEM",
            content: "Your personal companion for gender-affirming voice training. We'll help you find a voice that feels authentic to you.",
            icon: "👋"
        },
        {
            title: "Choose Your Path",
            content: "What is your primary voice goal?",
            icon: "🎯",
            isSelection: true
        },
        {
            title: "How it Works",
            content: "We analyze your Pitch (high/low) and Resonance (bright/dark) in real-time to give you instant feedback.",
            icon: "🎙️"
        },
        {
            title: "Camera Mirror",
            content: "Use the floating camera mirror to monitor your posture and lip shape while you practice. Toggle it anytime from the top menu.",
            icon: "🪞"
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
        if (steps[step].isSelection && !selectedGoal) return;

        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const handleGoalSelect = (goal) => {
        setSelectedGoal(goal);
        switchProfile(goal);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>

                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800/50">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
                </div>

                <div className="text-center py-8 relative z-10">
                    <div className="text-7xl mb-6 animate-bounce drop-shadow-lg filter">{steps[step].icon}</div>
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{steps[step].title}</h2>
                    <p className="text-slate-300 leading-relaxed text-lg mb-6">{steps[step].content}</p>

                    {steps[step].isSelection && (
                        <div className="grid grid-cols-1 gap-3 mb-4">
                            <button
                                onClick={() => handleGoalSelect('fem')}
                                className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${selectedGoal === 'fem' ? 'bg-pink-500/20 border-pink-500 text-white' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <span className="text-2xl">🌸</span>
                                <div className="text-left">
                                    <div className="font-bold">Feminization</div>
                                    <div className="text-xs opacity-70">Brighter resonance, higher pitch</div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleGoalSelect('masc')}
                                className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${selectedGoal === 'masc' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <span className="text-2xl">🦁</span>
                                <div className="text-left">
                                    <div className="font-bold">Masculinization</div>
                                    <div className="text-xs opacity-70">Darker resonance, lower pitch</div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleGoalSelect('neutral')}
                                className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${selectedGoal === 'neutral' ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <span className="text-2xl">✨</span>
                                <div className="text-left">
                                    <div className="font-bold">Androgyny</div>
                                    <div className="text-xs opacity-70">Balanced resonance and pitch</div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-6 relative z-10">
                    <button onClick={onSkip} className="flex-1 py-4 rounded-xl text-slate-400 hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-wider">Skip</button>
                    <button
                        onClick={handleNext}
                        disabled={steps[step].isSelection && !selectedGoal}
                        className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === steps.length - 1 ? "Let's Go!" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialWizard;
