import { useState, useEffect } from 'react';
import { X, Sparkles, Mic, Target, BookOpen, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'gem_welcome_dismissed';

const WelcomeBanner = ({ onStartTutorial, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if banner was previously dismissed
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
        onDismiss?.();
    };

    const features = [
        {
            icon: Mic,
            title: 'Real-time Voice Analysis',
            description: 'See your pitch, resonance, and voice quality as you speak',
            color: 'text-pink-400',
            bgColor: 'bg-pink-500/10',
        },
        {
            icon: Target,
            title: 'Personalized Goals',
            description: 'Set practice goals and track your progress over time',
            color: 'text-teal-400',
            bgColor: 'bg-teal-500/10',
        },
        {
            icon: BookOpen,
            title: 'Guided Exercises',
            description: 'Follow structured exercises designed by voice professionals',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
    ];

    if (!isVisible) return null;

    return (
        <div className="relative mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/50 rounded-2xl border border-indigo-500/20 overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                <div className="relative p-6 md:p-8">
                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                        aria-label="Dismiss welcome banner"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-gradient-to-br from-teal-500 to-indigo-500 rounded-xl">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Welcome to Vocal GEM</h2>
                            <p className="text-slate-400 text-sm">Your journey to voice confidence starts here</p>
                        </div>
                    </div>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl ${feature.bgColor} border border-white/5 transition-all hover:scale-[1.02]`}
                            >
                                <feature.icon className={`${feature.color} mb-2`} size={24} />
                                <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                                <p className="text-slate-400 text-xs">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Start Tips */}
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
                        <h3 className="font-bold text-white text-sm mb-3">Quick Start</h3>
                        <ol className="space-y-2 text-sm">
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="flex-shrink-0 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <span>Click <strong className="text-teal-400">Enable Microphone</strong> in Practice mode to start</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="flex-shrink-0 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <span>Try the <strong className="text-teal-400">5-Min Warmup</strong> to prepare your voice</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="flex-shrink-0 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                <span>Record voice samples in the <strong className="text-teal-400">Journal</strong> to track progress</span>
                            </li>
                        </ol>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                handleDismiss();
                                onStartTutorial?.();
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-teal-500/20"
                        >
                            Start Tutorial
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Function to reset welcome banner (for testing)
export const resetWelcomeBanner = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export default WelcomeBanner;
