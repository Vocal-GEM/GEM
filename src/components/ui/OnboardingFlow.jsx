import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Mic, Target, LineChart, Sparkles, Check } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Vocal GEM',
        description: 'Your personal AI-powered voice coach. Let\'s get you set up in just a few steps.',
        icon: <Sparkles className="text-purple-400" size={48} />,
        image: null
    },
    {
        id: 'practice',
        title: 'Practice Mode',
        description: 'Access guided exercises for pitch, resonance, and more. Start with warm-ups and progress at your own pace.',
        icon: <Mic className="text-teal-400" size={48} />,
        tip: 'Pro tip: Use the Smart Practice feature for personalized sessions!'
    },
    {
        id: 'analysis',
        title: 'Voice Analysis',
        description: 'Get real-time feedback on your voice. See pitch, resonance, and more visualized as you speak.',
        icon: <LineChart className="text-blue-400" size={48} />,
        tip: 'Your microphone will be used only when you start recording.'
    },
    {
        id: 'goals',
        title: 'Set Your Goals',
        description: 'Track your progress over time. Daily challenges and streaks keep you motivated.',
        icon: <Target className="text-amber-400" size={48} />,
        tip: 'Consistency beats intensity - aim for daily practice!'
    },
    {
        id: 'ready',
        title: 'You\'re All Set!',
        description: 'Start your voice journey today. Remember: every voice is valid, and progress takes time.',
        icon: <Check className="text-emerald-400" size={48} />,
        cta: 'Start Practicing'
    }
];

const OnboardingFlow = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { navigate } = useNavigation();

    const step = ONBOARDING_STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === ONBOARDING_STEPS.length - 1;

    const handleNext = () => {
        if (isLast) {
            localStorage.setItem('gem_onboarding_complete', 'true');
            onComplete?.();
            navigate('dashboard');
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('gem_onboarding_complete', 'true');
        onComplete?.();
        navigate('dashboard');
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Progress */}
            <div className="p-4">
                <div className="flex gap-1 max-w-md mx-auto">
                    {ONBOARDING_STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`flex-1 h-1 rounded-full transition-colors ${idx <= currentStep ? 'bg-blue-500' : 'bg-slate-800'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-8">
                    {step.icon}
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">{step.title}</h1>
                <p className="text-slate-400 max-w-md mb-6 leading-relaxed">{step.description}</p>

                {step.tip && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 max-w-md">
                        <p className="text-blue-300 text-sm">💡 {step.tip}</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="p-6 border-t border-slate-800">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    {!isFirst ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="px-4 py-2 text-slate-400 hover:text-white flex items-center gap-1"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    ) : (
                        <button
                            onClick={handleSkip}
                            className="px-4 py-2 text-slate-500 hover:text-slate-400"
                        >
                            Skip
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2"
                    >
                        {isLast ? step.cta : 'Next'}
                        {!isLast && <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Hook to check if onboarding is needed
 */
export const useOnboarding = () => {
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('gem_onboarding_complete');
        setNeedsOnboarding(!completed);
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem('gem_onboarding_complete', 'true');
        setNeedsOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem('gem_onboarding_complete');
        setNeedsOnboarding(true);
    };

    return { needsOnboarding, completeOnboarding, resetOnboarding };
};

export default OnboardingFlow;
