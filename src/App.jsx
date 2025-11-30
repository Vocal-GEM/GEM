import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAudio } from './context/AudioContext';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';
import { useStats } from './context/StatsContext';
import { useJournal } from './context/JournalContext';
import { useNavigation } from './context/NavigationContext';
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
import { Mic, Mic2, Bot, BarChart2, Activity, ArrowLeft, ChevronRight, Wrench, BookOpen, MessageSquare, AlertTriangle } from 'lucide-react';





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

    const showPracticeMode = modals.practiceMode;
    const setShowPracticeMode = (v) => v ? openModal('practiceMode') : closeModal('practiceMode');

    const showMigration = modals.migration;
    const setShowMigration = (v) => v ? openModal('migration') : closeModal('migration');

    const showVocalHealthTips = modals.vocalHealth;
    const setShowVocalHealthTips = (v) => v ? openModal('vocalHealth') : closeModal('vocalHealth');

    const showAssessment = modals.assessment;
    const setShowAssessment = (v) => v ? openModal('assessment') : closeModal('assessment');

    const showWarmUp = modals.warmup;
    const setShowWarmUp = (v) => v ? openModal('warmup') : closeModal('warmup');

    const showForwardFocus = modals.forwardFocus;
    const setShowForwardFocus = (v) => v ? openModal('forwardFocus') : closeModal('forwardFocus');

    const showVocalFolds = modals.vocalFolds;
    const setShowVocalFolds = (v) => v ? openModal('vocalFolds') : closeModal('vocalFolds');

    const showVoiceQuality = modals.voiceQuality;
    const setShowVoiceQuality = (v) => v ? openModal('voiceQuality') : closeModal('voiceQuality');

    const showCourse = modals.course;
    const setShowCourse = (v) => v ? openModal('course') : closeModal('course');

    const showTutorial = modals.tutorial;
    const setShowTutorial = (v) => v ? openModal('tutorial') : closeModal('tutorial');

    const showCompass = modals.compass;
    const setShowCompass = (v) => v ? openModal('compass') : closeModal('compass');

    const [isDataLoaded, setIsDataLoaded] = useState(true);
    const [dismissedError, setDismissedError] = useState(false);

    // Onboarding Steps
    const onboardingSteps = [
        { target: '[data-tour="mic-button"]', title: 'Start Practicing', content: 'Tap here to start real-time voice analysis.' },
        { target: '[data-tour="filter-menu"]', title: 'Change Views', content: 'Switch between different visualizations like Pitch, Resonance, and more.' },
        { target: '[data-tour="settings-button"]', title: 'Customize', content: 'Adjust your target pitch range and other settings here.' },
    ];

    const {
        isActive: isTourActive,
        currentStep,
        nextStep,
        prevStep,
        skipOnboarding,
        startOnboarding,
        isFirstStep,
        isLastStep
    } = useOnboarding(onboardingSteps);

    const { unlockedAchievement, closeAchievement } = useAchievements(stats);





    // Onboarding flow
    useEffect(() => {
        if (!isDataLoaded) return;
        const hasSeenTutorial = localStorage.getItem('gem_tutorial_seen');
        const hasSeenCompass = localStorage.getItem('gem_compass_seen');
        const hasCalibrated = localStorage.getItem('gem_calibration_done');
        const hasSeenOnboarding = localStorage.getItem('gem_onboarding_seen');

        if (!hasSeenTutorial) {
            setShowTutorial(true);
        } else if (!hasSeenCompass) {
            setShowCompass(true);
        } else if (!hasCalibrated) {
            setShowCalibration(true);
        } else if (!hasSeenOnboarding) {
            startOnboarding();
        }
    }, [isDataLoaded]);

    const handleTutorialComplete = () => {
        setShowTutorial(false);
        localStorage.setItem('gem_tutorial_seen', 'true');
        setShowCompass(true);
    };

    const handleCompassComplete = () => {
        setShowCompass(false);
        localStorage.setItem('gem_compass_seen', 'true');
        setShowCalibration(true);
    };

    const handleCalibrationComplete = () => {
        setShowCalibration(false);
        localStorage.setItem('gem_calibration_done', 'true');
        startOnboarding();
    };

    // Settings events - moved to NavigationContext

    // Profile switching
    useEffect(() => {
        const handleSwitchProfile = () => window.location.reload();
        window.addEventListener('switchProfile', handleSwitchProfile);
        return () => window.removeEventListener('switchProfile', handleSwitchProfile);
    }, []);



    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 pb-20">
            {/* Skip to Content */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-white text-slate-900 font-bold rounded-lg shadow-xl">
                Skip to Content
            </a>

            {/* Header */}
            <header className="p-4 pt-safe bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-white/5" role="banner">
                <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
                    <button
                        className="flex items-center gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl p-1"
                        onClick={() => { setActiveTab('practice'); setPracticeView('all'); }}
                        aria-label="Go to Home"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0" aria-hidden="true">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">Vocal GEM</h1>
                    </button>
                    <div className="flex items-center gap-2">
                        <OfflineIndicator />
                        <button onClick={() => openModal('feedback')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700" aria-label="Send feedback">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">Feedback</span>
                            </span>
                        </button>
                        <button onClick={() => setShowSettings(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700" aria-label="Open settings" data-tour="settings-button">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                <span aria-hidden="true">⚙️</span>
                                <span className="hidden sm:inline">Settings</span>
                            </span>
                        </button>
                        <button onClick={() => user ? setShowProfile(true) : setShowLogin(true)} className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors flex-shrink-0" aria-label={user ? "Open profile" : "Login"}>
                            <span className="text-lg" aria-hidden="true">👤</span>
                        </button>
                        {user && (
                            <button
                                onClick={() => setShowProfile(true)}
                                className="text-sm font-bold text-slate-300 hover:text-white cursor-pointer hidden md:block focus:outline-none focus-visible:underline"
                                aria-label="View Profile"
                            >
                                {user.username}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Audio Error Alert */}
            <ErrorRecovery
                error={!dismissedError ? audioError : null}
                onRetry={() => window.location.reload()}
                onDismiss={() => setDismissedError(true)}
            />

            <main id="main-content" className="flex-1 max-w-[1600px] mx-auto w-full p-4 pb-24">
                {activeTab === 'practice' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Real-time Analysis</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setShowPracticeMode(true)} className="px-4 py-2.5 rounded-full text-sm font-bold bg-slate-800 hover:bg-slate-700 text-purple-400 border border-purple-500/30 transition-all flex items-center gap-2">
                                    <Mic2 className="w-4 h-4" /> Voice Mode
                                </button>
                                <button onClick={toggleAudio} className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${isAudioActive ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-400 hover:to-violet-400 text-white hover:shadow-xl hover:shadow-teal-500/30 animate-glow-pulse'}`} aria-label={isAudioActive ? "Stop listening" : "Start listening"} aria-pressed={isAudioActive} data-tour="mic-button">
                                    {isAudioActive ? <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" /> LIVE</> : <><Mic className="w-4 h-4" aria-hidden="true" /> START LISTENING</>}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Visualizer */}
                            <ErrorBoundary
                                FallbackComponent={() => (
                                    <div className="w-full h-full flex items-center justify-center text-red-400 p-4 text-center">
                                        <div>
                                            <p className="font-bold mb-2">Visualization Error</p>
                                            <p className="text-xs">The view crashed. Try refreshing.</p>
                                        </div>
                                    </div>
                                )}>
                                <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}>
                                    {practiceView === 'all' ? (
                                        <DynamicOrb
                                            dataRef={dataRef}
                                            calibration={{ ...calibration, disable3D: settings.liteMode || settings.disable3D }}
                                            audioEngine={audioEngineRef.current}
                                        />
                                    ) : practiceView === 'resonance' ? (
                                        <ResonanceOrb
                                            dataRef={dataRef}
                                            calibration={calibration}
                                            showDebug={false}
                                            colorBlindMode={settings.colorBlindMode}
                                        />
                                    ) : practiceView === 'pitch' ? (
                                        <PitchVisualizer dataRef={dataRef} />
                                    ) : practiceView === 'weight' ? (
                                        <VoiceQualityMeter dataRef={dataRef} userMode="user" showAnalysis={false} />
                                    ) : practiceView === 'tilt' ? (
                                        <SpectralTiltMeter dataRef={dataRef} />
                                    ) : practiceView === 'vowel' ? (
                                        <VowelSpacePlot dataRef={dataRef} showAnalysis={false} />
                                    ) : practiceView === 'articulation' ? (
                                        <div className="h-full overflow-y-auto custom-scrollbar">
                                            <ArticulationView />
                                        </div>
                                    ) : practiceView === 'contour' ? (
                                        <ContourVisualizer dataRef={dataRef} />
                                    ) : practiceView === 'quality' ? (
                                        <VoiceQualityView />
                                    ) : practiceView === 'spectrogram' ? (
                                        settings.liteMode ? (
                                            <Spectrogram dataRef={dataRef} />
                                        ) : (
                                            <HighResSpectrogram dataRef={dataRef} />
                                        )
                                    ) : null}

                                </Suspense>
                            </ErrorBoundary>
                        </div>

                        {/* Comparison Tool */}
                        {(practiceView !== 'all' && practiceView !== 'resonance') && (
                            <div className="mt-6">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <ComparisonTool />
                                </Suspense>
                            </div>
                        )}
                    </div>
                )}

                {/* Right: Dashboard & Advice */}
                <div className="flex flex-col h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    <div className="h-full min-h-[400px] mb-6">
                        <GenderPerceptionDashboard dataRef={dataRef} view={practiceView} />
                    </div>

                    {practiceView === 'pitch' && (
                        <div className="mb-6">
                            <PitchTargets audioEngine={audioEngineRef} />
                            <PitchPipe audioEngine={audioEngineRef} />
                        </div>
                    )}

                    {practiceView === 'weight' && (
                        <div className="mb-6">
                            <VoiceQualityAnalysis dataRef={dataRef} colorBlindMode={settings.colorBlindMode} />
                        </div>
                    )}

                    {practiceView === 'vowel' && (
                        <div className="mb-6">
                            <VowelAnalysis dataRef={dataRef} colorBlindMode={settings.colorBlindMode} />
                        </div>
                    )}

                    <ToolExercises tool={practiceView} audioEngine={audioEngineRef.current} />

                    <div className="mt-4 flex-shrink-0">
                        <button onClick={() => setActiveTab('tools')} className="w-full p-4 rounded-xl flex flex-row items-center justify-center gap-3 transition-colors group bg-slate-800 hover:bg-slate-700">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Wrench size={20} />
                            </div>
                            <span className="text-sm font-bold">All Tools</span>
                        </button>
                    </div>
                </div>
            </main>

            {activeTab === 'history' && (
                <Suspense fallback={<LoadingSpinner />}>
                    <HistoryView stats={stats} journals={journals} onLogClick={() => setShowJournalForm(true)} />
                </Suspense>
            )}

            {activeTab === 'coach' && (
                <Suspense fallback={<LoadingSpinner />}>
                    <CoachView />
                </Suspense>
            )}

            {activeTab === 'analysis' && (
                <Suspense fallback={<LoadingSpinner />}>
                    <AnalysisView />
                </Suspense>
            )}

            {activeTab === 'tools' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setActiveTab('practice')} className="text-slate-400 hover:text-white"><ArrowLeft /></button>
                        <h2 className="text-xl font-bold">Tools</h2>
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                        <AudioLibrary audioEngine={audioEngineRef} />
                    </Suspense>
                    <BreathPacer />
                    <div className="p-4 bg-slate-800 rounded-xl flex flex-row items-center justify-between gap-3 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => setShowVocalFolds(true)}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                <Activity size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-white">Vocal Folds Simulation</h3>
                                <p className="text-xs text-slate-400">Visualize vocal fold vibration patterns</p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-500" />
                    </div>
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
            {showForwardFocus && <ForwardFocusDrill onClose={() => setShowForwardFocus(false)} />}
            {showIncognito && <IncognitoScreen onClose={() => setShowIncognito(false)} />}
            {showCamera && <FloatingCamera onClose={() => setShowCamera(false)} />}

            {
                showVocalFolds && (
                    <Suspense fallback={<LoadingSpinner />}>
                        <VocalFoldsView onClose={() => setShowVocalFolds(false)} />
                    </Suspense>
                )
            }

            {
                showVoiceQuality && (
                    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
                        <div className="max-w-[1600px] mx-auto p-4 min-h-screen">
                            <button
                                onClick={() => setShowVoiceQuality(false)}
                                className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white"
                            >
                                <ArrowLeft size={20} /> Back to Tools
                            </button>
                            <Suspense fallback={<LoadingSpinner />}>
                                <VoiceQualityView />
                            </Suspense>
                        </div>
                    </div>
                )
            }

            {
                showCourse && (
                    <Suspense fallback={<LoadingSpinner />}>
                        <FeminizationCourse onClose={() => setShowCourse(false)} />
                    </Suspense>
                )
            }

            {
                showPracticeMode && (
                    <Suspense fallback={<LoadingSpinner />}>
                        <PracticeMode
                            onClose={() => setShowPracticeMode(false)}
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
                )
            }

            <DebugOverlay audioEngine={audioEngineRef.current} dataRef={dataRef} />

            <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />

            <QuickActions onAction={(id) => {
                if (id === 'practice') { setActiveTab('practice'); toggleAudio(); }
                if (id === 'journal') { setActiveTab('history'); setShowJournalForm(true); }
                if (id === 'coach') setActiveTab('coach');
                if (id === 'warmup') setShowWarmUp(true);
            }} />

            <TooltipOverlay
                step={currentStep}
                isActive={isTourActive}
                onNext={nextStep}
                onPrev={prevStep}
                onSkip={skipOnboarding}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
            />

            <CelebrationModal
                achievement={unlockedAchievement}
                onClose={closeAchievement}
            />
        </div>
    );
};

export default App;
