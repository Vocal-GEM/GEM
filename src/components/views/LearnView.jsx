import { useState, useEffect, lazy, Suspense } from 'react';
import {
    BookOpen,
    Music2,
    Waves,
    Speaker,
    MessageSquare,
    Languages,
    Heart,
    Users,
    ArrowLeft,
    Clock,
    ChevronRight,
    Brain,
    Sparkles
} from 'lucide-react';

// Lazy load individual modules


const PitchInfoView = lazy(() => import('./learn/PitchInfoView'));
const FormantsInfoView = lazy(() => import('./learn/FormantsInfoView'));
const ResonanceInfoView = lazy(() => import('./learn/ResonanceInfoView'));
const VoiceQualityInfoView = lazy(() => import('./learn/VoiceQualityInfoView'));
const IntonationInfoView = lazy(() => import('./learn/IntonationInfoView'));
const ArticulationInfoView = lazy(() => import('./learn/ArticulationInfoView'));
const VocalAnatomyInfoView = lazy(() => import('./learn/VocalAnatomyInfoView'));
const GenderPerceptionInfoView = lazy(() => import('./learn/GenderPerceptionInfoView'));

import ModuleNotes from '../ui/ModuleNotes';
import QuizView from '../ui/QuizView';
import { quizService } from '../../services/QuizService';


/**
 * LearnView - Educational hub for Gender Affirming Voice Training
 * 
 * Displays module cards that users can click to access in-depth
 * articles about each voice training concept.
 */
const LearnView = () => {
    const [activeModule, setActiveModule] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizProgress, setQuizProgress] = useState(null);

    // Load quiz progress on mount
    useEffect(() => {
        const summary = quizService.getProgressSummary();
        setQuizProgress(summary);
    }, [showQuiz]);

    const modules = [
        {
            id: 'pitch',
            title: 'Pitch & Fundamental Frequency',
            icon: Music2,
            description: 'Understanding F0, gender-typical pitch ranges, and how to safely develop your target pitch.',
            color: 'cyan',
            readTime: '8 min',
            component: PitchInfoView
        },
        {
            id: 'formants',
            title: 'Vocal Formants',
            icon: Waves,
            description: 'Learn about F1, F2, and F3 frequencies, how they\'re measured, and their impact on voice perception.',
            color: 'purple',
            readTime: '10 min',
            component: FormantsInfoView
        },
        {
            id: 'resonance',
            title: 'Resonance & Brightness',
            icon: Speaker,
            description: 'Explore vocal tract resonance, larynx position, and techniques for forward resonance.',
            color: 'blue',
            readTime: '8 min',
            component: ResonanceInfoView
        },
        {
            id: 'voice-quality',
            title: 'Voice Quality & Timbre',
            icon: Waves,
            description: 'Understand breathiness vs clarity, spectral tilt, and indicators of vocal health.',
            color: 'emerald',
            readTime: '7 min',
            component: VoiceQualityInfoView
        },
        {
            id: 'intonation',
            title: 'Intonation & Prosody',
            icon: MessageSquare,
            description: 'Discover pitch variability, melodic speech patterns, and expressive communication.',
            color: 'pink',
            readTime: '6 min',
            component: IntonationInfoView
        },
        {
            id: 'articulation',
            title: 'Articulation & Speech',
            icon: Languages,
            description: 'Vowel space, consonant clarity, and how articulation patterns affect perception.',
            color: 'amber',
            readTime: '6 min',
            component: ArticulationInfoView
        },
        {
            id: 'anatomy',
            title: 'Vocal Anatomy',
            icon: Heart,
            description: 'The vocal folds, larynx, and vocal tract - understanding your instrument.',
            color: 'rose',
            readTime: '9 min',
            component: VocalAnatomyInfoView
        },
        {
            id: 'perception',
            title: 'Gender Perception',
            icon: Users,
            description: 'How listeners perceive voice gender, the role of multiple cues, and setting realistic goals.',
            color: 'violet',
            readTime: '8 min',
            component: GenderPerceptionInfoView
        }
    ];

    // Color classes - must be explicit for Tailwind's JIT compiler to detect them
    const colorClassMap = {
        cyan: {
            bg: 'bg-cyan-500/20',
            border: 'border-cyan-500/30',
            hoverBorder: 'hover:border-cyan-500/60',
            text: 'text-cyan-400',
            gradient: 'from-cyan-900/40 to-transparent'
        },
        purple: {
            bg: 'bg-purple-500/20',
            border: 'border-purple-500/30',
            hoverBorder: 'hover:border-purple-500/60',
            text: 'text-purple-400',
            gradient: 'from-purple-900/40 to-transparent'
        },
        blue: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            hoverBorder: 'hover:border-blue-500/60',
            text: 'text-blue-400',
            gradient: 'from-blue-900/40 to-transparent'
        },
        emerald: {
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/30',
            hoverBorder: 'hover:border-emerald-500/60',
            text: 'text-emerald-400',
            gradient: 'from-emerald-900/40 to-transparent'
        },
        pink: {
            bg: 'bg-pink-500/20',
            border: 'border-pink-500/30',
            hoverBorder: 'hover:border-pink-500/60',
            text: 'text-pink-400',
            gradient: 'from-pink-900/40 to-transparent'
        },
        amber: {
            bg: 'bg-amber-500/20',
            border: 'border-amber-500/30',
            hoverBorder: 'hover:border-amber-500/60',
            text: 'text-amber-400',
            gradient: 'from-amber-900/40 to-transparent'
        },
        rose: {
            bg: 'bg-rose-500/20',
            border: 'border-rose-500/30',
            hoverBorder: 'hover:border-rose-500/60',
            text: 'text-rose-400',
            gradient: 'from-rose-900/40 to-transparent'
        },
        violet: {
            bg: 'bg-violet-500/20',
            border: 'border-violet-500/30',
            hoverBorder: 'hover:border-violet-500/60',
            text: 'text-violet-400',
            gradient: 'from-violet-900/40 to-transparent'
        }
    };

    const getColorClasses = (color) => colorClassMap[color] || colorClassMap.purple;

    // Loading spinner for lazy loaded modules
    const LoadingSpinner = () => (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    // Render quiz view if active
    if (showQuiz) {
        return <QuizView onBack={() => setShowQuiz(false)} />;
    }

    // Render active module if selected
    if (activeModule) {
        const module = modules.find(m => m.id === activeModule);
        const ModuleComponent = module?.component;

        return (
            <div className="min-h-screen pb-20">
                {/* Back Navigation */}
                <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50 px-4 lg:px-8 py-4">
                    <button
                        onClick={() => setActiveModule(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Learn</span>
                    </button>
                </div>

                {/* Module Content */}
                <Suspense fallback={<LoadingSpinner />}>
                    {ModuleComponent && <ModuleComponent />}
                </Suspense>

                {/* Module Notes Section */}
                <div className="px-4 lg:px-8 max-w-4xl mx-auto">
                    <ModuleNotes moduleId={activeModule} moduleTitle={module?.title} />
                </div>
            </div>
        );
    }

    // Main hub view
    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                        <BookOpen className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                            Learn
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Educational resources for Gender Affirming Voice Training
                        </p>
                    </div>
                </div>

                <p className="text-slate-300 max-w-2xl leading-relaxed">
                    Explore the science behind voice training. Each module covers a key concept
                    that contributes to how your voice is perceived. Understanding these concepts
                    will help you practice more effectively and achieve your voice goals.
                </p>
            </div>

            {/* Quiz Yourself Card */}
            <button
                onClick={() => setShowQuiz(true)}
                className="w-full mb-6 group relative p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-purple-900/40 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-[1.01] overflow-hidden"
            >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Quiz Yourself
                                <Sparkles className="w-5 h-5 text-pink-400" />
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Test your knowledge with spaced repetition
                            </p>
                        </div>
                    </div>

                    {/* Progress Badge */}
                    {quizProgress && (
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                    {quizProgress.totalMastered}
                                </div>
                                <div className="text-xs text-slate-500">
                                    of {quizProgress.totalQuestions} mastered
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </div>
            </button>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {modules.map((module) => {
                    const colors = getColorClasses(module.color);
                    const Icon = module.icon;

                    return (
                        <button
                            key={module.id}
                            onClick={() => setActiveModule(module.id)}
                            className={`group relative text-left p-6 rounded-2xl bg-gradient-to-br ${colors.gradient} border ${colors.border} ${colors.hoverBorder} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden`}
                        >
                            {/* Background glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
                                        <Icon className={`w-6 h-6 ${colors.text}`} />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{module.readTime}</span>
                                    </div>
                                </div>

                                <h3
                                    className="text-lg font-bold mb-2 transition-all"
                                    style={{ color: '#ffffff' }}
                                >
                                    {module.title}
                                </h3>

                                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                    {module.description}
                                </p>

                                <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                                    <span>Read article</span>
                                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer info */}
            <div className="mt-12 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 text-center">
                <p className="text-slate-400 text-sm">
                    All content is based on current speech-language pathology research and evidence-based
                    practices for gender-affirming voice training.
                </p>
            </div>
        </div>
    );
};

export default LearnView;
