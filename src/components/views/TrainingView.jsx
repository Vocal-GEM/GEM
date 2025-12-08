import React, { useState } from 'react';
import IntonationTrainingModule from '../training/IntonationTrainingModule';
import PitchTrainingModule from '../training/PitchTrainingModule';
import ResonanceTrainingModule from '../training/ResonanceTrainingModule';
import ShadowingExercise from '../exercises/ShadowingExercise';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Music, Activity, ArrowLeft, Mic2, TrendingUp, TrendingDown, Waves, MessageSquare } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

const TrainingView = () => {
    const { t } = useTranslation();
    const { navigationParams } = useNavigation();
    const [activeModule, setActiveModule] = useState(null);

    const modules = React.useMemo(() => [
        {
            id: 'shadowing',
            title: t('training.modules.shadowing.title', 'Mimicry & Shadowing'),
            description: t('training.modules.shadowing.desc', 'Listen to target phrases and practice matching their intonation and rhythm.'),
            icon: <MessageSquare size={24} className="text-blue-400" />,
            component: <ShadowingExercise embedded={true} onClose={() => setActiveModule(null)} />
        },
        {
            id: 'pitch-a3',
            title: t('training.modules.pitchA3.title'),
            description: t('training.modules.pitchA3.desc'),
            icon: <Music size={24} className="text-teal-400" />,
            component: <PitchTrainingModule targetNote="A3" targetFreq={220} tolerance={5} />
        },
        {
            id: 'pitch-c4',
            title: t('training.modules.pitchC4.title'),
            description: t('training.modules.pitchC4.desc'),
            icon: <Music size={24} className="text-purple-400" />,
            component: <PitchTrainingModule targetNote="C4" targetFreq={261.6} tolerance={5} />
        },
        {
            id: 'resonance-i',
            title: t('training.modules.resonanceI.title'),
            description: t('training.modules.resonanceI.desc'),
            icon: <Mic2 size={24} className="text-amber-400" />,
            component: <ResonanceTrainingModule targetVowel="i" />
        },
        {
            id: 'intonation-rising',
            title: t('training.modules.intonationRising.title'),
            description: t('training.modules.intonationRising.desc'),
            icon: <TrendingUp size={24} className="text-teal-400" />,
            component: <IntonationTrainingModule patternType="rising" />
        },
        {
            id: 'intonation-falling',
            title: t('training.modules.intonationFalling.title'),
            description: t('training.modules.intonationFalling.desc'),
            icon: <TrendingDown size={24} className="text-rose-400" />,
            component: <IntonationTrainingModule patternType="falling" />
        },
        {
            id: 'intonation-hill',
            title: t('training.modules.intonationHill.title'),
            description: t('training.modules.intonationHill.desc'),
            icon: <Waves size={24} className="text-blue-400" />,
            component: <IntonationTrainingModule patternType="hill" />
        }
    ], [t]);

    // Deep Linking Handler
    React.useEffect(() => {
        if (navigationParams?.module) {
            const target = modules.find(m => m.id === navigationParams.module);
            if (target) setActiveModule(target);
        }
    }, [navigationParams, modules]);

    return (
        <div className="w-full min-h-screen bg-slate-950 p-4 sm:p-6 text-white">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6 sm:mb-8 pt-4 sm:pt-12">
                {activeModule ? (
                    <button
                        onClick={() => setActiveModule(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} /> {t('training.back', 'Back to Training')}
                    </button>
                ) : (
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="p-2 sm:p-3 bg-teal-500/20 rounded-xl">
                            <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-white">{t('training.title')}</h1>
                            <p className="text-sm sm:text-base text-slate-400">{t('training.subtitle')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
                {activeModule ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                        {activeModule.component}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {modules.map(module => (
                            <button
                                key={module.id}
                                onClick={() => setActiveModule(module)}
                                className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl text-left hover:border-teal-500/50 hover:bg-slate-800 transition-all group"
                            >
                                <div className="mb-3 sm:mb-4 p-3 bg-slate-950 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                    {module.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{module.title}</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                    {module.description}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingView;
