import React, { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { Play, CheckCircle, ArrowRight, X } from 'lucide-react';

const TutorialWizard = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(0);
    const { switchProfile } = useProfile();
    const [selectedGoal, setSelectedGoal] = useState(null);

    const steps = [
        {
            id: 'intro',
            title: "Welcome to Vocal GEM",
            subtitle: "Your personal AI voice coach.",
            content: (
                <div className="flex flex-col items-center">
                    <div className="w-full aspect-video bg-slate-900 rounded-xl mb-6 flex items-center justify-center border border-white/10 relative overflow-hidden group cursor-pointer">
                        {/* Placeholder for Intro Video/GIF */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                        <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                        <span className="absolute bottom-4 text-xs text-slate-400 font-mono">INTRO VIDEO PLACEHOLDER</span>
                    </div>
                    <p className="text-slate-300 text-center max-w-sm">
                        Watch how Vocal GEM helps you visualize and master your voice in real-time.
                    </p>
                </div>
            )
        },
        {
            id: 'quickstart',
            title: "Quick Start Guide",
            subtitle: "Get up and running in 3 steps.",
            content: (
                <div className="space-y-4 w-full">
                    <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                            <h4 className="font-bold text-white">Allow Microphone</h4>
                            <p className="text-sm text-slate-400">We need access to analyze your voice locally.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                            <h4 className="font-bold text-white">Choose a Goal</h4>
                            <p className="text-sm text-slate-400">Select Feminization, Masculinization, or Androgyny.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0">3</div>
                        <div>
                            <h4 className="font-bold text-white">Start Practicing</h4>
                            <p className="text-sm text-slate-400">Speak into the mic and see real-time feedback.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'goal',
            title: "Choose Your Path",
            subtitle: "What is your primary voice goal?",
            isSelection: true,
            content: (
                <div className="grid grid-cols-1 gap-3 w-full">
                    {/* Goal selection buttons will be rendered by the main render logic if isSelection is true */}
                </div>
            )
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="glass-panel max-w-2xl w-full bg-slate-900 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Left Panel (Progress & Info) */}
                <div className="w-full md:w-1/3 bg-slate-800/50 p-8 flex flex-col justify-between border-r border-white/5">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold">💎</span>
                            </div>
                            <span className="font-bold text-white tracking-wider">Vocal GEM</span>
                        </div>

                        <div className="space-y-6">
                            {steps.map((s, i) => (
                                <div key={i} className={`flex items-center gap-3 transition-colors ${i === step ? 'text-white' : i < step ? 'text-blue-400' : 'text-slate-600'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${i === step ? 'border-blue-500 bg-blue-500/20' : i < step ? 'border-blue-500 bg-blue-500 text-slate-900' : 'border-slate-700'}`}>
                                        {i < step ? <CheckCircle size={16} /> : <span className="text-sm font-bold">{i + 1}</span>}
                                    </div>
                                    <span className={`text-sm font-medium ${i === step ? 'opacity-100' : 'opacity-60'}`}>{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 mt-8">
                        Step {step + 1} of {steps.length}
                    </div>
                </div>

                {/* Right Panel (Content) */}
                <div className="w-full md:w-2/3 p-8 flex flex-col relative">
                    <button onClick={onSkip} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>

                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-white mb-2">{steps[step].title}</h2>
                        <p className="text-slate-400 mb-8 text-lg">{steps[step].subtitle}</p>

                        {steps[step].isSelection ? (
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => handleGoalSelect('fem')}
                                    className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${selectedGoal === 'fem' ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg shadow-pink-500/10' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-white/20'}`}
                                >
                                    <span className="text-3xl">🌸</span>
                                    <div className="text-left">
                                        <div className="font-bold text-lg">Feminization</div>
                                        <div className="text-sm opacity-70">Brighter resonance, higher pitch</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleGoalSelect('masc')}
                                    className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${selectedGoal === 'masc' ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-white/20'}`}
                                >
                                    <span className="text-3xl">🦁</span>
                                    <div className="text-left">
                                        <div className="font-bold text-lg">Masculinization</div>
                                        <div className="text-sm opacity-70">Darker resonance, lower pitch</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleGoalSelect('neutral')}
                                    className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${selectedGoal === 'neutral' ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/10' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-white/20'}`}
                                >
                                    <span className="text-3xl">✨</span>
                                    <div className="text-left">
                                        <div className="font-bold text-lg">Androgyny</div>
                                        <div className="text-sm opacity-70">Balanced resonance and pitch</div>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            steps[step].content
                        )}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNext}
                            disabled={steps[step].isSelection && !selectedGoal}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {step === steps.length - 1 ? "Get Started" : "Next"} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialWizard;
