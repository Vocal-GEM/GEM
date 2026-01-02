import { cloneElement, useState, useEffect } from 'react';
import { Activity, Play, Calendar, Trophy, ArrowRight, Mic, Dumbbell, BookOpen, Flame, Sparkles, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VocalHealthPanel from '../dashboard/VocalHealthPanel';
import SmartCoachWidget from '../dashboard/SmartCoachWidget';
import JourneyEntryCard from '../ui/JourneyEntryCard';
import SessionSummaryCard from '../ui/SessionSummaryCard';
import RecommendedExercises from '../ui/RecommendedExercises';
import DailyChallengeCard from '../ui/DailyChallengeCard';
import SmartPracticeSession from '../ui/SmartPracticeSession';
import QuickWarmupSession from '../ui/QuickWarmupSession';
import QuickVoiceCheck from '../ui/QuickVoiceCheck';
import { useGuidedJourney } from '../../context/GuidedJourneyContext';
import { useNavigation } from '../../context/NavigationContext';
import { checkStreakStatus, getStreakMessage } from '../../services/StreakService';
import RecommendedToolsWidget from '../ui/RecommendedToolsWidget';
import MoodCheckIn from '../ui/MoodCheckIn';
import PersonalMilestonesDisplay from '../ui/PersonalMilestonesDisplay';
import VoiceTwinDiscovery from '../ui/VoiceTwinDiscovery';

const StatCard = ({ label, value, subtext, icon, color }) => (
    <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start mb-2 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl ${color} bg-opacity-10`}>
                {cloneElement(icon, { className: `${color} w-5 h-5 sm:w-6 sm:h-6` })}
            </div>
            {subtext && <span className="text-[10px] sm:text-xs font-bold text-teal-500 bg-teal-500/10 px-2 py-1 rounded-full">{subtext}</span>}
        </div>
        <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>{value}</div>
        <div className="text-xs sm:text-sm text-slate-400">{label}</div>
    </div>
);

const ActionCard = ({ title, description, onClick, icon, color }) => (
    <button
        onClick={onClick}
        className="w-full bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800 transition-all group text-left"
    >
        <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                {cloneElement(icon, { className: `${color} w-5 h-5 sm:w-6 sm:h-6` })}
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-white transition-colors w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2" style={{ color: '#ffffff' }}>{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">{description}</p>
    </button>
);

const DashboardView = ({ onViewChange, onOpenAdaptiveSession }) => {
    const { t } = useTranslation();
    const {
        hasInProgressJourney,
        isJourneyComplete,
        getProgressPercentage,
        getCurrentStep,
        resumeJourney
    } = useGuidedJourney();
    const { openModal } = useNavigation();

    // Streak tracking
    const [streakData, setStreakData] = useState({ currentStreak: 0, needsPracticeToday: true });
    const [showSmartPractice, setShowSmartPractice] = useState(false);
    const [showQuickWarmup, setShowQuickWarmup] = useState(false);
    const [showVoiceCheck, setShowVoiceCheck] = useState(false);

    useEffect(() => {
        const status = checkStreakStatus();
        setStreakData(status);
    }, []);

    const handleStartJourney = () => {
        openModal('guidedJourney');
    };

    const handleResumeJourney = () => {
        resumeJourney();
        openModal('guidedJourney');
    };

    const currentStep = getCurrentStep();

    return (
        <div className="w-full min-h-screen bg-black p-4 sm:p-6 lg:p-12 text-white">
            {/* Guided Journey Entry - Featured prominently for first-time users */}
            <div className="mb-8">
                <JourneyEntryCard
                    onStart={handleStartJourney}
                    onResume={handleResumeJourney}
                    hasInProgress={hasInProgressJourney()}
                    progressPercentage={getProgressPercentage()}
                    currentStepTitle={currentStep?.title || ''}
                    isComplete={isJourneyComplete}
                />
            </div>

            {/* Mood Check In */}
            <div className="mb-8">
                <MoodCheckIn />
            </div>

            {/* Smart Coach Widget */}
            <SmartCoachWidget onStartSession={onOpenAdaptiveSession} />

            {/* Recommended Tools */}
            <div className="mb-8">
                <RecommendedToolsWidget />
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* 5-Min Warmup Button */}
                <button
                    onClick={() => setShowQuickWarmup(true)}
                    className="p-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-2xl text-left transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Timer className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">5-Min Warmup</h3>
                                <p className="text-white/80 text-sm">Quick routine to wake up your voice</p>
                            </div>
                        </div>
                        <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={24} />
                    </div>
                </button>

                {/* Smart Practice Button */}
                <button
                    onClick={() => setShowSmartPractice(true)}
                    className="p-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-2xl text-left transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Smart Practice</h3>
                                <p className="text-white/80 text-sm">Personalized session based on your weak areas</p>
                            </div>
                        </div>
                        <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={24} />
                    </div>
                </button>

                {/* Quick Voice Check Button */}
                <button
                    onClick={() => setShowVoiceCheck(true)}
                    className="p-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-2xl text-left transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Mic className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Voice Check</h3>
                                <p className="text-white/80 text-sm">How am I doing?</p>
                            </div>
                        </div>
                        <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={24} />
                    </div>
                </button>
            </div>

            {/* Quick Warmup Modal */}
            {showQuickWarmup && (
                <QuickWarmupSession onClose={() => setShowQuickWarmup(false)} />
            )}

            {/* Quick Voice Check Modal */}
            {showVoiceCheck && (
                <QuickVoiceCheck onClose={() => setShowVoiceCheck(false)} />
            )}

            {/* Smart Practice Modal */}
            {showSmartPractice && (
                <SmartPracticeSession onClose={() => setShowSmartPractice(false)} />
            )}

            {/* Vocal Health Panel */}
            <VocalHealthPanel />

            {/* Session Summary */}
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SessionSummaryCard />
                <PersonalMilestonesDisplay />
            </div>

            {/* Recommended Exercises */}
            <RecommendedExercises onViewCategory={(cat) => onViewChange('training', { category: cat })} />

            {/* Daily Challenges */}
            <div className="mb-8">
                <DailyChallengeCard />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
                <StatCard
                    label={t('dashboard.stats.dsi.label')}
                    value="1.2"
                    subtext={t('dashboard.stats.dsi.subtext')}
                    icon={<Activity size={24} />}
                    color="text-teal-400"
                />
                <StatCard
                    label={t('dashboard.stats.streak.label')}
                    value={streakData.currentStreak}
                    subtext={streakData.needsPracticeToday ? "Practice today!" : "✓ Done"}
                    icon={<Flame size={24} />}
                    color="text-orange-400"
                />
                <StatCard
                    label={t('dashboard.stats.practice.label')}
                    value="45m"
                    subtext={t('dashboard.stats.practice.subtext')}
                    icon={<Play size={24} />}
                    color="text-blue-400"
                />
                <StatCard
                    label={t('dashboard.stats.exercises.label')}
                    value="12"
                    icon={<Trophy size={24} />}
                    color="text-amber-400"
                />
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{t('dashboard.quickStart')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <ActionCard
                    title={t('dashboard.actions.training.title')}
                    description={t('dashboard.actions.training.description')}
                    icon={<Dumbbell size={24} />}
                    color="text-blue-400"
                    onClick={() => onViewChange('training')}
                />
                <ActionCard
                    title={t('dashboard.actions.assessment.title')}
                    description={t('dashboard.actions.assessment.description')}
                    icon={<BookOpen size={24} />}
                    color="text-purple-400"
                    onClick={() => onViewChange('assessment')}
                />
                <ActionCard
                    title={t('dashboard.actions.analysis.title')}
                    description={t('dashboard.actions.analysis.description')}
                    icon={<Mic size={24} />}
                    color="text-teal-400"
                    onClick={() => onViewChange('analysis')}
                />
            </div>

            {/* Community & Voice Twins */}
            <div className="mt-8 mb-8">
                <VoiceTwinDiscovery />
            </div>
        </div>
    );
};

export default DashboardView;
