import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, ChevronRight, Play, CheckCircle, ArrowLeft, Dumbbell } from 'lucide-react';
import { generateSmartSession, getSessionOptions } from '../../services/SmartPracticeService';
import { addXP } from '../../services/DailyChallengeService';
import { recordPractice } from '../../services/StreakService';

const SmartPracticeSession = ({ onClose }) => {
    const [phase, setPhase] = useState('select'); // select, practice, complete
    const [session, setSession] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [startTime, setStartTime] = useState(null);

    const sessionOptions = getSessionOptions();

    const handleStartSession = (durationMinutes) => {
        const newSession = generateSmartSession(durationMinutes);
        setSession(newSession);
        setStartTime(Date.now());
        setPhase('practice');
    };

    const handleCompleteStep = () => {
        setCompletedSteps(prev => [...prev, currentStepIndex]);

        if (currentStepIndex < session.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // Session complete
            const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);
            recordPractice();
            addXP(session.steps.length * 10, 'Smart Practice Session');
            setPhase('complete');
        }
    };

    const currentStep = session?.steps[currentStepIndex];

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-amber-400" size={20} />
                        <span className="font-bold text-white">Smart Practice</span>
                    </div>
                    <div className="w-8" />
                </div>

                {/* Select Duration Phase */}
                {phase === 'select' && (
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-white text-center mb-2">
                            How much time do you have?
                        </h1>
                        <p className="text-slate-400 text-center mb-8">
                            We'll create a personalized session based on your progress
                        </p>

                        <div className="space-y-4">
                            {sessionOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => handleStartSession(option.duration)}
                                    className="w-full p-6 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{option.title}</h3>
                                            <p className="text-slate-400 text-sm">{option.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-amber-400">
                                            <Clock size={18} />
                                            <span className="font-bold">{option.duration} min</span>
                                            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Practice Phase */}
                {phase === 'practice' && currentStep && (
                    <div className="flex-1 flex flex-col">
                        {/* Progress */}
                        <div className="flex gap-1 mb-8">
                            {session.steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1 rounded-full transition-colors ${completedSteps.includes(idx)
                                            ? 'bg-emerald-500'
                                            : idx === currentStepIndex
                                                ? 'bg-amber-500'
                                                : 'bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Current Step */}
                        <div className="flex-1">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-4 ${currentStep.type === 'warmup' ? 'bg-blue-500/20 text-blue-400' :
                                    currentStep.type === 'cooldown' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-amber-500/20 text-amber-400'
                                }`}>
                                <Dumbbell size={14} />
                                {currentStep.type === 'warmup' ? 'Warm Up' :
                                    currentStep.type === 'cooldown' ? 'Cool Down' :
                                        `Focus: ${currentStep.priority}`}
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">{currentStep.title}</h2>
                            <p className="text-slate-400 mb-6">{currentStep.description}</p>

                            {/* Exercises */}
                            <div className="space-y-4 mb-8">
                                {currentStep.exercises.map((exercise, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                                    >
                                        <h3 className="font-bold text-white mb-2">{exercise.title}</h3>
                                        <p className="text-sm text-slate-400 whitespace-pre-line">
                                            {exercise.content?.substring(0, 150)}
                                            {exercise.content?.length > 150 ? '...' : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Complete Step Button */}
                        <button
                            onClick={handleCompleteStep}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={20} />
                            {currentStepIndex < session.steps.length - 1 ? 'Complete & Continue' : 'Finish Session'}
                        </button>
                    </div>
                )}

                {/* Complete Phase */}
                {phase === 'complete' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle className="text-white" size={48} />
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">Session Complete! 🎉</h1>
                        <p className="text-slate-400 mb-8">Great work on your practice session</p>

                        <div className="flex gap-4 text-center mb-8">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[100px]">
                                <div className="text-2xl font-bold text-emerald-400">{session.steps.length}</div>
                                <div className="text-xs text-slate-400">Steps Done</div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[100px]">
                                <div className="text-2xl font-bold text-amber-400">+{session.steps.length * 10}</div>
                                <div className="text-xs text-slate-400">XP Earned</div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartPracticeSession;
