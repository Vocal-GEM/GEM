import { useState } from 'react';
import { Heart, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { SelfCareService, SELF_CARE_PROMPTS, SELF_CARE_RESOURCES } from '../../services/SelfCareService';

/**
 * SelfCareOnboarding - Guided wizard for creating a self-care plan
 * Walks users through the 5 reflection questions before starting voice work.
 * When embedded=true, renders inline (for GuidedJourney). Otherwise renders as modal.
 */
const SelfCareOnboarding = ({ onComplete, onSkip, embedded = false }) => {
    const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-5 = prompts, 6 = summary
    const [answers, setAnswers] = useState(() => {
        // Load existing answers if any
        const existing = SelfCareService.getSelfCarePlan();
        if (existing) {
            return SELF_CARE_PROMPTS.reduce((acc, p) => {
                acc[p.id] = existing[p.id] || '';
                return acc;
            }, {});
        }
        return SELF_CARE_PROMPTS.reduce((acc, p) => {
            acc[p.id] = '';
            return acc;
        }, {});
    });

    const totalSteps = SELF_CARE_PROMPTS.length + 2; // intro + 5 prompts + summary

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleAnswerChange = (promptId, value) => {
        setAnswers(prev => ({ ...prev, [promptId]: value }));
    };

    const handleComplete = () => {
        SelfCareService.saveSelfCarePlan(answers);
        onComplete?.(answers);
    };

    const currentPrompt = currentStep > 0 && currentStep <= SELF_CARE_PROMPTS.length
        ? SELF_CARE_PROMPTS[currentStep - 1]
        : null;

    const isOnSummary = currentStep === totalSteps - 1;

    // Container classes: modal vs inline embedded
    const containerClass = embedded
        ? "w-full" // Inline mode for GuidedJourney
        : "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto";

    const innerClass = embedded
        ? "bg-slate-900/50 border border-slate-700 rounded-2xl w-full shadow-xl"
        : "bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8";

    return (
        <div className={containerClass}>
            <div className={innerClass}>
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Heart className="text-pink-400" size={24} />
                            Self-Care Foundation
                        </h2>
                        <div className="text-sm text-slate-400">
                            {currentStep + 1} / {totalSteps}
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Intro Step */}
                    {currentStep === 0 && (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles size={40} className="text-pink-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                The Foundation of Your Practice
                            </h3>
                            <div className="text-slate-300 space-y-4 text-left max-w-lg mx-auto">
                                <p>
                                    Voice feminization work can be <strong>emotionally challenging</strong>.
                                    When we work on our voice, we&apos;re confronting dysphoria around core elements of our being.
                                </p>
                                <p>
                                    Unlike learning to sing, where failing to hit a note is just frustrating—failing at
                                    voice feminization can feel like it threatens <em>who we are</em>.
                                </p>
                                <p className="text-pink-300 font-medium">
                                    That&apos;s why we start with self-care. Not as an afterthought, but as the foundation.
                                </p>
                                <p>
                                    The next few questions will help you create a personal self-care plan—so when
                                    challenges come up (not <em>if</em>, but <em>when</em>), you&apos;re prepared.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Prompt Steps */}
                    {currentPrompt && (
                        <div className="py-4">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                    {currentPrompt.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {currentPrompt.question}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        {currentPrompt.hint}
                                    </p>
                                </div>
                            </div>

                            <textarea
                                value={answers[currentPrompt.id]}
                                onChange={(e) => handleAnswerChange(currentPrompt.id, e.target.value)}
                                placeholder={currentPrompt.placeholder}
                                className="w-full h-32 bg-slate-800 border border-slate-600 rounded-xl p-4 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
                            />
                        </div>
                    )}

                    {/* Summary Step */}
                    {isOnSummary && (
                        <div className="py-4">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Your Self-Care Plan
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Review your answers. You can always update these later in Settings.
                                </p>
                            </div>

                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                {SELF_CARE_PROMPTS.map((prompt) => (
                                    <div key={prompt.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                            <span>{prompt.icon}</span>
                                            <span className="truncate">{prompt.question}</span>
                                        </div>
                                        <p className="text-white text-sm">
                                            {answers[prompt.id] || <span className="text-slate-500 italic">Not answered</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Resources */}
                            {SELF_CARE_RESOURCES.length > 0 && (
                                <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                    <h4 className="text-sm font-bold text-purple-300 mb-2">Recommended Resources</h4>
                                    {SELF_CARE_RESOURCES.map((r, i) => (
                                        <a
                                            key={i}
                                            href={r.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-sm text-purple-400 hover:text-purple-300 underline"
                                        >
                                            {r.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex justify-between">
                    <div>
                        {currentStep === 0 && onSkip && (
                            <button
                                onClick={onSkip}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Skip for now
                            </button>
                        )}
                        {currentStep > 0 && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                    </div>

                    <div>
                        {isOnSummary ? (
                            <button
                                onClick={handleComplete}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all"
                            >
                                <Check size={18} /> Save & Continue
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-colors"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelfCareOnboarding;
