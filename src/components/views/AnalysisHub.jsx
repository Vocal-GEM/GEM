import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Mic, BarChart2, BookOpen, Waves, FlaskConical } from 'lucide-react';

// Import existing analysis views
import AnalysisView from './AnalysisView';
import AcousticAnalysisView from './AcousticAnalysisView';
import VowelTuningView from './VowelTuningView';
import PhonetogramView from './PhonetogramView';
import ClinicalAssessmentView from './ClinicalAssessmentView';

/**
 * AnalysisHub - Consolidated Analysis Center
 * 
 * Combines all analysis tools into a single navigable hub:
 * - Voice Analysis (live recording & analysis)
 * - Voice Assessment (comprehensive testing)
 * - Acoustic Analysis (advanced tools)
 * - Resonance Lab (vowel/formant visualization)
 * - Voice Range (phonetogram/VRP)
 */
const AnalysisHub = ({ dataRef, targetRange }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState(null);

    const sections = [
        {
            id: 'analysis',
            title: t('analysisHub.sections.analysis.title', 'Voice Analysis'),
            description: t('analysisHub.sections.analysis.description', 'Record and analyze your voice with detailed metrics and visualizations.'),
            icon: Activity,
            color: 'cyan',
            component: <AnalysisView targetRange={targetRange} onClose={() => setActiveSection(null)} />
        },
        {
            id: 'assessment',
            title: t('analysisHub.sections.assessment.title', 'Voice Assessment'),
            description: t('analysisHub.sections.assessment.description', 'Comprehensive voice assessment with detailed scoring and recommendations.'),
            icon: BookOpen,
            color: 'purple',
            component: <ClinicalAssessmentView dataRef={dataRef} onClose={() => setActiveSection(null)} />
        },
        {
            id: 'acoustics',
            title: t('analysisHub.sections.acoustics.title', 'Acoustic Analysis'),
            description: t('analysisHub.sections.acoustics.description', 'Advanced acoustic tools for in-depth voice analysis.'),
            icon: FlaskConical,
            color: 'blue',
            component: <AcousticAnalysisView dataRef={dataRef} onClose={() => setActiveSection(null)} />
        },
        {
            id: 'vowels',
            title: t('analysisHub.sections.vowels.title', 'Resonance Lab'),
            description: t('analysisHub.sections.vowels.description', 'Explore vowel formants and resonance characteristics.'),
            icon: Mic,
            color: 'amber',
            component: <VowelTuningView dataRef={dataRef} onClose={() => setActiveSection(null)} />
        },
        {
            id: 'phonetogram',
            title: t('analysisHub.sections.phonetogram.title', 'Voice Range'),
            description: t('analysisHub.sections.phonetogram.description', 'Map your vocal range with a phonetogram (Voice Range Profile).'),
            icon: BarChart2,
            color: 'green',
            component: <PhonetogramView dataRef={dataRef} onClose={() => setActiveSection(null)} />
        }
    ];

    const colorStyles = {
        cyan: {
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            hoverBorder: 'hover:border-cyan-500/50',
            text: 'text-cyan-400',
            iconBg: 'bg-cyan-500/20',
            gradient: 'from-cyan-600 to-blue-600'
        },
        purple: {
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            hoverBorder: 'hover:border-purple-500/50',
            text: 'text-purple-400',
            iconBg: 'bg-purple-500/20',
            gradient: 'from-purple-600 to-pink-600'
        },
        blue: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            hoverBorder: 'hover:border-blue-500/50',
            text: 'text-blue-400',
            iconBg: 'bg-blue-500/20',
            gradient: 'from-blue-600 to-indigo-600'
        },
        amber: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            hoverBorder: 'hover:border-amber-500/50',
            text: 'text-amber-400',
            iconBg: 'bg-amber-500/20',
            gradient: 'from-amber-600 to-orange-600'
        },
        green: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            hoverBorder: 'hover:border-green-500/50',
            text: 'text-green-400',
            iconBg: 'bg-green-500/20',
            gradient: 'from-green-600 to-emerald-600'
        }
    };

    // If a section is active, render it full-screen
    if (activeSection) {
        const section = sections.find(s => s.id === activeSection);
        if (section) {
            return (
                <div className="h-full w-full">
                    {section.component}
                </div>
            );
        }
    }

    return (
        <div className="w-full min-h-screen bg-slate-950 p-4 sm:p-6 text-white">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-6 sm:mb-8 pt-4 sm:pt-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-2">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <Waves className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-white">
                            {t('analysisHub.title', 'Analysis Center')}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400">
                            {t('analysisHub.subtitle', 'In-depth voice analysis and assessment tools')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Section Cards Grid */}
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {sections.map(section => {
                        const style = colorStyles[section.color];
                        const Icon = section.icon;

                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`
                                    ${style.bg} ${style.border} ${style.hoverBorder}
                                    border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left 
                                    hover:bg-opacity-20 transition-all duration-300
                                    group cursor-pointer
                                    hover:shadow-lg hover:scale-[1.02]
                                `}
                            >
                                <div className={`
                                    ${style.iconBg} 
                                    p-2 sm:p-3 rounded-xl w-fit mb-2 sm:mb-4 
                                    group-hover:scale-110 transition-transform
                                `}>
                                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${style.text}`} />
                                </div>
                                <h3 className="text-sm sm:text-xl font-bold text-white mb-1 sm:mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
                                    {section.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalysisHub;
