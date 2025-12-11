import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, X, Home, RotateCcw, CheckCircle } from 'lucide-react';
import { useGuidedJourney } from '../../context/GuidedJourneyContext';
import JourneyStep from './JourneyStep';
import JourneyProgressBar from './JourneyProgressBar';

/**
 * GuidedJourney - Main container for the guided voice training experience
 * A full-screen, immersive coaching journey that takes users step-by-step
 */
const GuidedJourney = ({ onClose }) => {
    const {
        currentJourneyId,
        currentStepIndex,
        completedSteps,
        isJourneyComplete,
        getCurrentStep,
        getJourneyData,

        startJourney,
        advanceStep,
        goToPreviousStep,
        goToStep,
        completeStep,
        exitJourney,
        resetJourney
    } = useGuidedJourney();

    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showCompletionScreen, setShowCompletionScreen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const journeyData = getJourneyData(currentJourneyId || 'fem-journey');
    const currentStep = getCurrentStep();

    // Start journey if not already started
    useEffect(() => {
        if (!currentJourneyId) {
            startJourney('fem-journey');
        }
    }, [currentJourneyId, startJourney]);

    // Handle step completion and advancement
    const handleNext = useCallback(() => {
        if (!currentStep) return;

        setIsTransitioning(true);

        // Mark current step as complete
        completeStep(currentStep.id);

        // Advance to next step
        const result = advanceStep();

        if (result === 'complete') {
            // Journey complete!
            setShowCompletionScreen(true);
        }

        // Reset transition after animation
        setTimeout(() => setIsTransitioning(false), 300);
    }, [currentStep, completeStep, advanceStep]);

    // Handle going back
    const handlePrevious = useCallback(() => {
        setIsTransitioning(true);
        goToPreviousStep();
        setTimeout(() => setIsTransitioning(false), 300);
    }, [goToPreviousStep]);



    // Handle exit
    const handleExit = useCallback(() => {
        exitJourney();
        onClose();
    }, [exitJourney, onClose]);

    // Handle restart
    const handleRestart = useCallback(() => {
        resetJourney();
        startJourney('fem-journey');
        setShowCompletionScreen(false);
    }, [resetJourney, startJourney]);

    // Determine navigation state
    const canGoBack = currentStepIndex > 0;
    const isLastStep = currentStep?.final === true;

    // Completion screen
    if (showCompletionScreen || isJourneyComplete) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500">
                {/* Celebration background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-lg text-center relative z-10">
                        {/* Celebration emoji */}
                        <div className="text-8xl mb-6 animate-bounce">🎉</div>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            Journey Complete!
                        </h1>

                        <p className="text-xl text-slate-300 mb-8">
                            You&apos;ve completed all 12 steps of the Voice Feminization Journey.
                            This is just the beginning of your transformation!
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                <div className="text-3xl font-bold text-pink-400">12</div>
                                <div className="text-sm text-slate-400">Steps Completed</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                <div className="text-3xl font-bold text-purple-400">100%</div>
                                <div className="text-sm text-slate-400">Progress</div>
                            </div>
                        </div>

                        {/* Next steps */}
                        <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10 mb-8 text-left">
                            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                What&apos;s Next?
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>• Practice daily with the Voice Analysis tools</li>
                                <li>• Use Training Gym for targeted exercises</li>
                                <li>• Track your progress over time</li>
                                <li>• Revisit the journey anytime to refresh</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleRestart}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold transition-colors"
                            >
                                <RotateCcw size={18} />
                                Start Over
                            </button>
                            <button
                                onClick={handleExit}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-xl text-white font-bold shadow-lg shadow-pink-500/20 transition-all"
                            >
                                <Home size={18} />
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Exit confirmation overlay
    const renderExitConfirm = () => (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-white mb-2">Exit Journey?</h3>
                <p className="text-slate-400 text-sm mb-6">
                    Your progress will be saved. You can continue where you left off anytime.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowExitConfirm(false)}
                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold transition-colors"
                    >
                        Stay
                    </button>
                    <button
                        onClick={handleExit}
                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 font-bold transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );

    if (!journeyData || !currentStep) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-400">Loading journey...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex-shrink-0 p-4 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    {/* Exit button */}
                    <button
                        onClick={() => setShowExitConfirm(true)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                        title="Exit Journey"
                    >
                        <X size={20} />
                    </button>

                    {/* Journey title */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-bold text-pink-400 uppercase tracking-wider truncate">
                            {journeyData.title}
                        </h1>
                        <p className="text-white font-bold truncate">{currentStep.title}</p>
                    </div>

                    {/* Progress indicator */}
                    <JourneyProgressBar
                        steps={journeyData.steps}
                        currentStepIndex={currentStepIndex}
                        completedSteps={completedSteps}
                        compact={true}
                    />
                </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full max-w-4xl mx-auto p-6 lg:p-8">
                    <div
                        className={`h-full transition-all duration-300 ${isTransitioning ? 'opacity-50 translate-x-4' : 'opacity-100 translate-x-0'
                            }`}
                    >
                        <JourneyStep
                            step={currentStep}
                            onComplete={() => completeStep(currentStep.id)}
                            isCompleted={completedSteps.includes(currentStep.id)}
                        />
                    </div>
                </div>
            </main>

            {/* Footer navigation */}
            <footer className="flex-shrink-0 p-4 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    {/* Back button */}
                    <button
                        onClick={handlePrevious}
                        disabled={!canGoBack}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${canGoBack
                            ? 'text-slate-300 hover:text-white hover:bg-white/10'
                            : 'text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        <ArrowLeft size={18} />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Step counter */}
                    <div className="text-center">
                        <span className="text-slate-400 text-sm">
                            Step <span className="text-white font-bold">{currentStepIndex + 1}</span> of{' '}
                            <span className="text-white">{journeyData.steps.length}</span>
                        </span>
                    </div>

                    {/* Next button */}
                    <button
                        onClick={handleNext}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${isLastStep
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-500/20'
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-500/20'
                            }`}
                    >
                        <span>{isLastStep ? 'Complete Journey' : 'Continue'}</span>
                        {isLastStep ? (
                            <CheckCircle size={18} />
                        ) : (
                            <ArrowRight size={18} />
                        )}
                    </button>
                </div>
            </footer>

            {/* Exit confirmation modal */}
            {showExitConfirm && renderExitConfirm()}
        </div>
    );
};

export default GuidedJourney;
