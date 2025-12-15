import React, { useState } from 'react';
import { X, Heart, ChevronRight, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import {
    MOOD_OPTIONS,
    GROUNDING_EXERCISES,
    getRandomAffirmation,
    getSupportMessage,
    CRISIS_RESOURCES
} from '../../data/DysphoriaSupport';

const MoodCheck = ({ onComplete, onClose }) => {
    const [step, setStep] = useState('mood'); // mood, support, grounding, affirmation, crisis
    const [selectedMood, setSelectedMood] = useState(null);
    const [currentAffirmation, setCurrentAffirmation] = useState(getRandomAffirmation());
    const [selectedGrounding, setSelectedGrounding] = useState(null);
    const [groundingStep, setGroundingStep] = useState(0);

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);

        // If struggling, offer more support
        if (mood.id === 'struggling') {
            setStep('support');
        } else if (mood.id === 'low') {
            setStep('support');
        } else {
            // For neutral/good/great moods, show brief affirmation then continue
            setStep('affirmation');
        }
    };

    const handleContinue = () => {
        // Save mood to localStorage for tracking
        const moodLog = JSON.parse(localStorage.getItem('gem_mood_log') || '[]');
        moodLog.push({
            mood: selectedMood.id,
            timestamp: new Date().toISOString()
        });
        // Keep last 30 entries
        if (moodLog.length > 30) moodLog.shift();
        localStorage.setItem('gem_mood_log', JSON.stringify(moodLog));

        onComplete(selectedMood);
    };

    const startGrounding = (exercise) => {
        setSelectedGrounding(exercise);
        setGroundingStep(0);
        setStep('grounding');
    };

    const nextGroundingStep = () => {
        if (groundingStep < selectedGrounding.steps.length - 1) {
            setGroundingStep(prev => prev + 1);
        } else {
            setStep('affirmation');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        <h2 className="font-bold text-white">How are you feeling?</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Mood Selection */}
                    {step === 'mood' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-300 text-sm text-center mb-6">
                                Check in with yourself before we begin. There's no wrong answer.
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                                {MOOD_OPTIONS.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => handleMoodSelect(mood)}
                                        className={`
                                            flex flex-col items-center gap-1 p-3 rounded-xl
                                            border border-white/10 hover:border-white/30
                                            transition-all duration-200 hover:scale-105
                                            ${selectedMood?.id === mood.id ? 'ring-2 ring-purple-500 bg-white/10' : 'bg-white/5'}
                                        `}
                                    >
                                        <span className="text-2xl">{mood.emoji}</span>
                                        <span className="text-[10px] text-slate-400 text-center leading-tight">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Support Options (for low/struggling moods) */}
                    {step === 'support' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-300 text-center">
                                {getSupportMessage(selectedMood.id)}
                            </p>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setStep('affirmation')}
                                    className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl flex items-center justify-between transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-xl">💜</span>
                                        <span className="text-white font-medium">Show me an affirmation</span>
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </button>

                                <button
                                    onClick={() => startGrounding(GROUNDING_EXERCISES[0])}
                                    className="w-full p-4 bg-teal-500/20 hover:bg-teal-500/30 rounded-xl flex items-center justify-between transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-xl">🌱</span>
                                        <span className="text-white font-medium">Do a grounding exercise</span>
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </button>

                                {selectedMood.id === 'struggling' && (
                                    <button
                                        onClick={() => setStep('crisis')}
                                        className="w-full p-4 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl flex items-center justify-between transition-colors"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="text-xl">🫂</span>
                                            <span className="text-white font-medium">I need more support</span>
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full mt-4 py-3 text-slate-400 hover:text-white transition-colors text-sm"
                            >
                                Continue to practice anyway →
                            </button>
                        </div>
                    )}

                    {/* Grounding Exercise */}
                    {step === 'grounding' && selectedGrounding && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center mb-4">
                                <span className="text-3xl">{selectedGrounding.emoji}</span>
                                <h3 className="text-lg font-bold text-white mt-2">{selectedGrounding.name}</h3>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl min-h-[100px] flex items-center justify-center">
                                <p className="text-lg text-white text-center">
                                    {selectedGrounding.steps[groundingStep]}
                                </p>
                            </div>

                            <div className="flex justify-center gap-1">
                                {selectedGrounding.steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i === groundingStep ? 'bg-purple-500' : 'bg-white/20'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextGroundingStep}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                            >
                                {groundingStep < selectedGrounding.steps.length - 1 ? 'Next' : 'Done'}
                            </button>
                        </div>
                    )}

                    {/* Affirmation */}
                    {step === 'affirmation' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10">
                                <p className="text-lg text-white text-center font-medium italic">
                                    "{currentAffirmation.text}"
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentAffirmation(getRandomAffirmation())}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 transition-colors"
                                >
                                    Another ↻
                                </button>
                                <button
                                    onClick={handleContinue}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Crisis Resources */}
                    {step === 'crisis' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-slate-300 text-center text-sm mb-4">
                                You're not alone. Here are some resources that can help:
                            </p>

                            <div className="space-y-3">
                                {CRISIS_RESOURCES.slice(0, 3).map((resource) => (
                                    <div
                                        key={resource.id}
                                        className="p-4 bg-white/5 rounded-xl border border-white/10"
                                    >
                                        <h4 className="font-bold text-white">{resource.name}</h4>
                                        <p className="text-sm text-slate-400 mb-2">{resource.description}</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {resource.phone && (
                                                <a
                                                    href={`tel:${resource.phone}`}
                                                    className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm hover:bg-green-500/30 transition-colors"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    {resource.phone}
                                                </a>
                                            )}
                                            {resource.text && (
                                                <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {resource.text}
                                                </span>
                                            )}
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm hover:bg-purple-500/30 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Website
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep('affirmation')}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoodCheck;
