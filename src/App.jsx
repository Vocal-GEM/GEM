import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Mic, MessageSquare, ArrowLeft, Activity, ChevronRight, Camera } from 'lucide-react';
import { useAudio } from './context/AudioContext';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';
import { useStats } from './context/StatsContext';
import { useJournal } from './context/JournalContext';
import { useNavigation } from './context/NavigationContext';
import { LanguageProvider } from './context/LanguageContext';
import MigrationModal from './components/ui/MigrationModal';
import JournalForm from './components/ui/JournalForm';
import Login from './components/ui/Login';
import Signup from './components/ui/Signup';
import UserProfile from './components/ui/UserProfile';
import VocalHealthTips from './components/ui/VocalHealthTips';
import AssessmentModule from './components/ui/AssessmentModule';
import WarmUpModule from './components/ui/WarmUpModule';
import ForwardFocusDrill from './components/ui/ForwardFocusDrill';
import IncognitoScreen from './components/ui/IncognitoScreen';
import LoadingSpinner from './components/ui/LoadingSpinner';
import PitchPipe from './components/ui/PitchPipe';
import BreathPacer from './components/ui/BreathPacer';
import MirrorComponent from './components/ui/MirrorComponent';
import FloatingCamera from './components/ui/FloatingCamera';
import PitchTargets from './components/ui/PitchTargets';

// Lazy Loaded Components - UI
const Sidebar = lazy(() => import('./components/layout/Sidebar'));
const DashboardView = lazy(() => import('./components/views/DashboardView'));
const TrainingView = lazy(() => import('./components/views/TrainingView'));
const ClinicalAssessmentView = lazy(() => import('./components/views/ClinicalAssessmentView'));
const AcousticAnalysisView = lazy(() => import('./components/views/AcousticAnalysisView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));
const PhonetogramView = lazy(() => import('./components/views/PhonetogramView'));

const TutorialWizard = lazy(() => import('./components/ui/TutorialWizard'));
const CompassWizard = lazy(() => import('./components/ui/CompassWizard'));
const CalibrationWizard = lazy(() => import('./components/ui/CalibrationWizard'));
const HistoryView = lazy(() => import('./components/ui/HistoryView'));
const CoachView = lazy(() => import('./components/ui/CoachView'));
const AudioLibrary = lazy(() => import('./components/ui/AudioLibrary'));
const ComparisonTool = lazy(() => import('./components/ui/ComparisonTool'));
const ProgressView = lazy(() => import('./components/views/ProgressView'));
const PracticeMode = lazy(() => import('./components/views/PracticeMode'));
const AnalysisView = lazy(() => import('./components/views/AnalysisView'));
const ArticulationView = lazy(() => import('./components/views/ArticulationView'));
const VocalFoldsView = lazy(() => import('./components/views/VocalFoldsView'));
const VoiceQualityView = lazy(() => import('./components/views/VoiceQualityView'));
const FeminizationCourse = lazy(() => import('./components/ui/FeminizationCourse'));
const AdaptivePracticeSession = lazy(() => import('./components/views/AdaptivePracticeSession'));

// Lazy Loaded Components - Visualizations
const VoiceQualityAnalysis = lazy(() => import('./components/viz/VoiceQualityAnalysis'));
const VowelAnalysis = lazy(() => import('./components/viz/VowelAnalysis'));
const DynamicOrb = lazy(() => import('./components/viz/DynamicOrb'));
const ResonanceOrb = lazy(() => import('./components/viz/ResonanceOrb'));
const LiveMetricsBar = lazy(() => import('./components/viz/LiveMetricsBar'));
const GenderPerceptionDashboard = lazy(() => import('./components/ui/GenderPerceptionDashboard'));
const PitchVisualizer = lazy(() => import('./components/viz/PitchVisualizer'));
const PitchOrb = lazy(() => import('./components/viz/PitchOrb'));
const VoiceQualityMeter = lazy(() => import('./components/viz/VoiceQualityMeter'));
const VowelSpacePlot = lazy(() => import('./components/viz/VowelSpacePlot'));
const HighResSpectrogram = lazy(() => import('./components/viz/HighResSpectrogram'));
const Spectrogram = lazy(() => import('./components/viz/Spectrogram'));
const ContourVisualizer = lazy(() => import('./components/viz/ContourVisualizer'));

const SpectralTiltMeter = lazy(() => import('./components/viz/SpectralTiltMeter'));
const ResonanceMetrics = lazy(() => import('./components/viz/ResonanceMetrics'));
const VowelTuningView = lazy(() => import('./components/views/VowelTuningView'));
const ToolExercises = lazy(() => import('./components/ui/ToolExercises'));
import DebugOverlay from './components/ui/DebugOverlay';
import FeedbackSettings from './components/ui/FeedbackSettings';
import OfflineIndicator from './components/ui/OfflineIndicator';
import ErrorBoundary from './components/ui/ErrorBoundary';
import FeedbackModal from './components/ui/FeedbackModal';
import CourseCard from './components/ui/CourseCard';
import BottomNav from './components/ui/BottomNav';
import PracticeFilterMenu from './components/ui/PracticeFilterMenu';
import TooltipOverlay from './components/ui/TooltipOverlay';
import QuickActions from './components/ui/QuickActions';
import CelebrationModal from './components/ui/CelebrationModal';
import ErrorRecovery from './components/ui/ErrorRecovery';
import { useOnboarding } from './hooks/useOnboarding';
import { useAchievements } from './hooks/useAchievements';



import { TourProvider } from './context/TourContext';
import TourOverlay from './components/ui/TourOverlay';

import CommandPalette from './components/ui/CommandPalette';
import Breadcrumbs from './components/ui/Breadcrumbs';
import AnalyticsDashboard from './components/ui/AnalyticsDashboard';
import QuickSettings from './components/ui/QuickSettings';
import { analyticsService } from './services/AnalyticsService';




const App = () => {
    const {
        audioEngineRef,
        dataRef,
        isAudioActive,
        toggleAudio,
        audioError
    } = useAudio();

    const {
        settings,
        updateSettings,
        showSettings,
        setShowSettings
    } = useSettings();

    const {
        user,
        logout
    } = useAuth();

    const {
        calibration,
        updateCalibration,
        targetRange,
        updateTargetRange,
        switchProfile,
        showCalibration,
        setShowCalibration
    } = useProfile();

    const {
        stats,
        goals
    } = useStats();

    const {
        journals,
        addJournalEntry,
        showJournalForm,
        setShowJournalForm
    } = useJournal();

    // Local state for UI only
    // userMode removed as per request

    const {
        activeView: activeTab,
        navigate: setActiveTab,
        practiceTab: practiceView,
        switchPracticeTab: setPracticeView,
        modals,
        openModal,
        closeModal
    } = useNavigation();

    const [showQuickSettings, setShowQuickSettings] = useState(false);
    const [dismissedError, setDismissedError] = useState(false);

    // Initialize Analytics
    useEffect(() => {
        analyticsService.init(settings.analyticsEnabled);
    }, [settings.analyticsEnabled]);

    // Derived state for backward compatibility
    // Derived state for backward compatibility - using modals state directly where possible
    // or ensuring no shadowing if variables are already declared above


    const showLogin = modals.login;
    const setShowLogin = (v) => v ? openModal('login') : closeModal('login');

    const showSignup = modals.signup;
    const setShowSignup = (v) => v ? openModal('signup') : closeModal('signup');

    const showProfile = modals.profile;
    const setShowProfile = (v) => v ? openModal('profile') : closeModal('profile');

    const showIncognito = modals.incognito;
    const setShowIncognito = (v) => v ? openModal('incognito') : closeModal('incognito');

    const showCamera = modals.camera;
    const setShowCamera = (v) => v ? openModal('camera') : closeModal('camera');



    const showMigration = modals.migration;
    const setShowMigration = (v) => v ? openModal('migration') : closeModal('migration');

    const showVocalHealthTips = modals.vocalHealth;
    const setShowVocalHealthTips = (v) => v ? openModal('vocalHealth') : closeModal('vocalHealth');

    const showAssessment = modals.assessment;
    const setShowAssessment = (v) => v ? openModal('assessment') : closeModal('assessment');

    const showTutorial = modals.tutorial;
    const setShowTutorial = (v) => v ? openModal('tutorial') : closeModal('tutorial');

    const showCompass = modals.compass;
    const setShowCompass = (v) => v ? openModal('compass') : closeModal('compass');

    const showWarmUp = modals.warmup;
    const setShowWarmUp = (v) => v ? openModal('warmup') : closeModal('warmup');

    const showVocalFolds = modals.vocalFolds;
    const setShowVocalFolds = (v) => v ? openModal('vocalFolds') : closeModal('vocalFolds');

    // Onboarding hooks
    const { unlockedAchievement, closeAchievement } = useAchievements();
    const { handleTutorialComplete, handleCompassComplete, handleCalibrationComplete } = useOnboarding();

    // Sync Listen Mode
    useEffect(() => {
        if (audioEngineRef.current) {
            audioEngineRef.current.setListenMode(settings.listenMode);
        }
    }, [settings.listenMode, audioEngineRef.current]);

    // Handle QuickSettings -> Advanced Settings transition
    useEffect(() => {
        const handleOpenSettings = () => setShowSettings(true);
        window.addEventListener('openSettings', handleOpenSettings);
        return () => window.removeEventListener('openSettings', handleOpenSettings);
    }, [setShowSettings]);

    return (
        <TourProvider>
            <LanguageProvider>
                {/* Skip Navigation for Accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Skip to main content
                </a>

                <div className="flex min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
                    <Suspense fallback={null}>
                        <Sidebar activeView={activeTab} onViewChange={setActiveTab} />
                    </Suspense>

                    {/* Audio Error Alert */}
                    <ErrorRecovery
                        error={!dismissedError ? audioError : null}
                        onRetry={() => window.location.reload()}
                        onDismiss={() => setDismissedError(true)}
                    />

                    <main id="main-content" className="flex-1 w-full lg:ml-64 p-0">
                        {activeTab === 'dashboard' && (
                            <Suspense fallback={<LoadingSpinner />}>
                                <DashboardView
                                    onViewChange={setActiveTab}
                                    onOpenAdaptiveSession={() => openModal('adaptiveSession')}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'practice' && (
                            <div className="p-4 lg:p-8">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <PracticeMode
                                        dataRef={dataRef}
                                        calibration={calibration}
                                        targetRange={targetRange}
                                        goals={goals}
                                        activeTab={activeTab}
                                        onOpenSettings={() => setShowSettings(true)}
                                        onOpenJournal={() => { setActiveTab('history'); setShowJournalForm(true); }}
                                        onOpenStats={() => setActiveTab('history')}
                                        onNavigate={setActiveTab}
                                        onUpdateRange={updateTargetRange}
                                        onSwitchProfile={switchProfile}
                                        settings={settings}
                                    />
                                </Suspense>
                            </div>
                        )}

                        {activeTab === 'analysis' && (
                            <div className="p-4 lg:p-8">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <AnalysisView />
                                </Suspense>
                            </div>
                        )}

                        {activeTab === 'assessment' && (
                            <Suspense fallback={<LoadingSpinner />}>
                                <ClinicalAssessmentView />
                            </Suspense>
                        )}

                        {activeTab === 'acoustics' && (
                            <Suspense fallback={<LoadingSpinner />}>
                                <AcousticAnalysisView />
                            </Suspense>
                        )}

                        {activeTab === 'vowels' && (
                            <Suspense fallback={<LoadingSpinner />}>
                                <VowelTuningView />
                            </Suspense>
                        )}

                        {activeTab === 'phonetogram' && (
                            <Suspense fallback={<LoadingSpinner />}>
                                <PhonetogramView />
                            </Suspense>
                        )}

                        {activeTab === 'training' && (
                            <Suspense fallback={<LoadingSpinner />}>
                                <TrainingView />
                            </Suspense>
                        )}

                        {activeTab === 'settings' && (
                            <Suspense fallback={<LoadingSpinner />}>
                                <SettingsView />
                            </Suspense>
                        )}

                        {activeTab === 'history' && (
                            <div className="p-4 lg:p-8">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <HistoryView stats={stats} journals={journals} onLogClick={() => setShowJournalForm(true)} />
                                </Suspense>
                            </div>
                        )}

                        {activeTab === 'coach' && (
                            <div className="p-4 lg:p-8">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <CoachView />
                                </Suspense>
                            </div>
                        )}

                        {/* Modals & Overlays */}
                        <FeedbackSettings
                            isOpen={showSettings}
                            onClose={() => setShowSettings(false)}
                            settings={settings}
                            setSettings={updateSettings}
                            targetRange={targetRange}
                            onSetGoal={(type) => {
                                let r = { min: 170, max: 220 };
                                if (type === 'fem') r = { min: 165, max: 255 };
                                if (type === 'masc') r = { min: 85, max: 145 };
                                if (type === 'androg') r = { min: 145, max: 175 };
                                updateTargetRange(r);
                            }}
                            onUpdateRange={(min, max) => updateTargetRange({ min, max })}
                            calibration={calibration}
                            onUpdateCalibration={updateCalibration}
                            onOpenTutorial={() => { setShowSettings(false); setShowTutorial(true); }}
                            onExportData={() => {
                                const data = { journals, stats, goals, settings, targetRange, calibration };
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = 'vocal-gem-data.json'; a.click();
                            }}
                            user={user}
                        />

                        <FeedbackModal
                            isOpen={modals.feedback}
                            onClose={() => closeModal('feedback')}
                        />

                        {showMigration && <MigrationModal onComplete={() => setShowMigration(false)} />}

                        {/* Onboarding Wizards */}
                        {
                            (showTutorial || showCompass || showCalibration) && (
                                <button
                                    onClick={() => {
                                        localStorage.setItem('gem_tutorial_seen', 'true');
                                        localStorage.setItem('gem_compass_seen', 'true');
                                        localStorage.setItem('gem_calibration_done', 'true');
                                        setShowTutorial(false);
                                        setShowCompass(false);
                                        setShowCalibration(false);
                                    }}
                                    className="fixed top-4 right-4 z-[60] px-4 py-2 bg-slate-800/80 backdrop-blur-md text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/10 hover:bg-slate-700 transition-all"
                                >
                                    Skip Setup
                                </button>
                            )
                        }

                        {
                            showTutorial && (
                                <Suspense fallback={<LoadingSpinner />}>
                                    <TutorialWizard onComplete={handleTutorialComplete} onSkip={() => { setShowTutorial(false); setShowCompass(true); }} />
                                </Suspense>
                            )
                        }
                        {
                            !showTutorial && showCompass && (
                                <Suspense fallback={<LoadingSpinner />}>
                                    <CompassWizard onComplete={handleCompassComplete} />
                                </Suspense>
                            )
                        }
                        {
                            showCalibration && (
                                <Suspense fallback={<LoadingSpinner />}>
                                    <CalibrationWizard onComplete={handleCalibrationComplete} onSkip={handleCalibrationComplete} audioEngine={audioEngineRef} />
                                </Suspense>
                            )
                        }

                        {
                            showJournalForm && (
                                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                    <div className="w-full max-w-md">
                                        <JournalForm onSubmit={addJournalEntry} onCancel={() => setShowJournalForm(false)} />
                                    </div>
                                </div>
                            )
                        }

                        {showLogin && <Login onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} onClose={() => setShowLogin(false)} />}
                        {showSignup && <Signup onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} onClose={() => setShowSignup(false)} />}
                        {showProfile && <UserProfile user={user} onClose={() => setShowProfile(false)} onLogout={() => { logout(); setShowProfile(false); }} />}
                        {showVocalHealthTips && <VocalHealthTips onClose={() => setShowVocalHealthTips(false)} />}
                        {showAssessment && <AssessmentModule onClose={() => setShowAssessment(false)} />}
                        {showWarmUp && <WarmUpModule onComplete={() => setShowWarmUp(false)} onSkip={() => setShowWarmUp(false)} />}

                        <TourOverlay />
                        <CommandPalette />
                        <QuickSettings isOpen={showQuickSettings} onClose={() => setShowQuickSettings(false)} />
                        {showCamera && <FloatingCamera onClose={() => setShowCamera(false)} />}
                        {modals.analytics && <AnalyticsDashboard onClose={() => closeModal('analytics')} />}
                        {modals.adaptiveSession && (
                            <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <AdaptivePracticeSession onClose={() => closeModal('adaptiveSession')} />
                                </Suspense>
                            </div>
                        )}

                        <CelebrationModal
                            achievement={unlockedAchievement}
                            onClose={closeAchievement}
                        />
                    </main>
                </div>
            </LanguageProvider>
        </TourProvider >
    );
};

export default App;
