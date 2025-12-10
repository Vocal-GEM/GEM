import React, { useState } from 'react';
import IntonationTrainingModule from '../training/IntonationTrainingModule';
import PitchTrainingModule from '../training/PitchTrainingModule';
import ResonanceTrainingModule from '../training/ResonanceTrainingModule';
import ShadowingExercise from '../exercises/ShadowingExercise';
import GabLibs from '../ui/GabLibs';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Music, Activity, ArrowLeft, Mic2, TrendingUp, TrendingDown, MessageSquare, BookOpen, Wind, Coffee, Orbit, Zap } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { TRAINING_CATEGORIES } from '../../data/trainingData';

const ExerciseList = ({ category, onBack }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className={`text-2xl font-bold text-${category.color}-400`}>{category.title}</h2>
                    <p className="text-slate-400">{category.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                {category.exercises.map(ex => (
                    <div key={ex.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${category.color}-500`} />
                            {ex.title}
                        </h3>
                        <div className="text-slate-300 whitespace-pre-line text-sm leading-relaxed">
                            {ex.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TrainingView = () => {
    const { t } = useTranslation();
    const { navigationParams } = useNavigation();
    const [activeModule, setActiveModule] = useState(null); // 'gab-libs', category object, or module object

    // Existing Technical Modules
    const techModules = [
        {
            id: 'shadowing',
            title: t('training.modules.shadowing.title', 'Mimicry & Shadowing'),
            description: 'Listen and repeat to match intonation.',
            icon: <MessageSquare size={24} className="text-blue-400" />,
            component: <ShadowingExercise embedded={true} onClose={() => setActiveModule(null)} />
        },
        {
            id: 'gab-libs',
            title: 'Gab Libs',
            description: 'Interactive stories with recorded sound effects.',
            icon: <BookOpen size={24} className="text-purple-400" />,
            component: <GabLibs onClose={() => setActiveModule(null)} />
        },
        {
            id: 'pitch-a3',
            title: 'Pitch Target: A3',
            description: 'Sustain A3 (220Hz) with stability.',
            icon: <Music size={24} className="text-teal-400" />,
            component: <PitchTrainingModule targetNote="A3" targetFreq={220} tolerance={5} />
        },
        {
            id: 'pitch-c4',
            title: 'Pitch Target: C4',
            description: 'Sustain C4 (261Hz) with stability.',
            icon: <Music size={24} className="text-purple-400" />,
            component: <PitchTrainingModule targetNote="C4" targetFreq={261.6} tolerance={5} />
        },
        {
            id: 'intonation-rising',
            title: 'Rising Intonation',
            description: 'Practice asking questions (Upward inflection).',
            icon: <TrendingUp size={24} className="text-teal-400" />,
            component: <IntonationTrainingModule patternType="rising" />
        },
        {
            id: 'intonation-falling',
            title: 'Falling Intonation',
            description: 'Practice making statements (Downward inflection).',
            icon: <TrendingDown size={24} className="text-rose-400" />,
            component: <IntonationTrainingModule patternType="falling" />
        }
    ];

    // Map categories to icons
    const getCategoryIcon = (id) => {
        switch (id) {
            case 'breathing': return <Wind size={24} className="text-teal-400" />;
            case 'sovte': return <Orbit size={24} className="text-indigo-400" />;
            case 'relaxation': return <Coffee size={24} className="text-pink-400" />;
            case 'tonal': return <Zap size={24} className="text-amber-400" />;
            default: return <Activity size={24} className="text-slate-400" />;
        }
    };

    // Deep Linking
    React.useEffect(() => {
        if (navigationParams?.module) {
            const tech = techModules.find(m => m.id === navigationParams.module);
            if (tech) setActiveModule(tech);
            // Could also check categories if needed, but usually we link to tools
        }
    }, [navigationParams]);

    return (
        <div className="w-full min-h-screen bg-slate-950 p-4 sm:p-6 text-white">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6 sm:mb-8 pt-4 sm:pt-12">
                {activeModule ? (
                    // If it's a component-based module, let the component handle back button or show generic one
                    (!activeModule.component || activeModule.id.startsWith('pitch') || activeModule.id.startsWith('intonation')) && (
                        <button
                            onClick={() => setActiveModule(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft size={20} /> Back to Gym
                        </button>
                    )
                ) : (
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="p-2 sm:p-3 bg-teal-500/20 rounded-xl">
                            <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-white">The Vocal Gym</h1>
                            <p className="text-sm sm:text-base text-slate-400">Select a workout to strengthen your instrument.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
                {activeModule ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                        {activeModule.component ? (
                            activeModule.component
                        ) : (
                            /* Render Category List */
                            <ExerciseList category={activeModule} onBack={() => setActiveModule(null)} />
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 pb-12">
                        {/* 1. Interactive Tools */}
                        <div className="space-y-4">
                            <h2 className="text-slate-400 font-bold uppercase tracking-wider text-sm ml-1">Interactive Tools</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {techModules.map(module => (
                                    <button
                                        key={module.id}
                                        onClick={() => setActiveModule(module)}
                                        className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-left hover:border-teal-500/50 hover:bg-slate-800 transition-all group relative overflow-hidden"
                                    >
                                        <div className="mb-3 p-3 bg-slate-950 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                            {module.icon}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">{module.title}</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed">
                                            {module.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Exercise Library */}
                        <div className="space-y-4">
                            <h2 className="text-slate-400 font-bold uppercase tracking-wider text-sm ml-1">Exercise Compendium</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                {TRAINING_CATEGORIES.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveModule(category)}
                                        className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left hover:border-${category.color}-500/50 hover:bg-slate-800 transition-all group`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 bg-${category.color}-500/10 rounded-xl text-${category.color}-400 group-hover:scale-110 transition-transform`}>
                                                {getCategoryIcon(category.id)}
                                            </div>
                                            <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">
                                                {category.exercises.length} Exercises
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-teal-200 transition-colors">{category.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            {category.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingView;
