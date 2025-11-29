import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAudio } from './context/AudioContext';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';
import { useStats } from './context/StatsContext';
import { useJournal } from './context/JournalContext';

// Icons
import { Mic, Mic2, Camera, ArrowLeft, Wrench, Bot, BarChart2, Activity, BookOpen, ChevronRight, Sliders } from 'lucide-react';

// Components - UI
import OfflineIndicator from './components/ui/OfflineIndicator';
import FeedbackSettings from './components/ui/FeedbackSettings';
import MigrationModal from './components/ui/MigrationModal';
import TutorialWizard from './components/ui/TutorialWizard';
import CompassWizard from './components/ui/CompassWizard';
import CalibrationWizard from './components/ui/CalibrationWizard';
import JournalForm from './components/ui/JournalForm';
import Login from './components/ui/Login';
import Signup from './components/ui/Signup';
import UserProfile from './components/ui/UserProfile';
import VocalHealthTips from './components/ui/VocalHealthTips';
import AssessmentModule from './components/ui/AssessmentModule';
import WarmUpModule from './components/ui/WarmUpModule';
import ForwardFocusDrill from './components/ui/ForwardFocusDrill';
import IncognitoScreen from './components/ui/IncognitoScreen';
const SLPDashboard = lazy(() => import('./components/views/SLPDashboard'));
const PracticeMode = lazy(() => import('./components/views/PracticeMode'));
const MixingBoardView = lazy(() => import('./components/views/MixingBoardView'));
const AnalysisView = lazy(() => import('./components/views/AnalysisView'));
const ArticulationView = lazy(() => import('./components/views/ArticulationView'));
const VocalFoldsView = lazy(() => import('./components/views/VocalFoldsView'));
const FeminizationCourse = lazy(() => import('./components/ui/FeminizationCourse'));

// Lazy Loaded Components - Visualizations
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
const QualityVisualizer = lazy(() => import('./components/viz/QualityVisualizer'));
const SpectralTiltMeter = lazy(() => import('./components/viz/SpectralTiltMeter'));
const ToolExercises = lazy(() => import('./components/ui/ToolExercises'));
import DebugOverlay from './components/ui/DebugOverlay';





const App = () => {
    const {
        isAudioActive,
        toggleAudio,
        dataRef,
        audioEngineRef
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
    // Local state for UI only
    // userMode removed as per request

    // Other UI state
    const [showVocalHealthTips, setShowVocalHealthTips] = useState(false);
    const [showAssessment, setShowAssessment] = useState(false);
    const [showWarmUp, setShowWarmUp] = useState(false);
    const [showForwardFocus, setShowForwardFocus] = useState(false);
    const [showVocalFolds, setShowVocalFolds] = useState(false);
    const [showCourse, setShowCourse] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(true); // Simplified for now


    const [activeTab, setActiveTab] = useState('practice');
    // showSettings moved to SettingsContext
    const [showTutorial, setShowTutorial] = useState(false);
    const [showCompass, setShowCompass] = useState(false);
    // showCalibration moved to ProfileContext
    // showJournalForm moved to JournalContext
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showIncognito, setShowIncognito] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showPracticeMode, setShowPracticeMode] = useState(false);
    const [showMigration, setShowMigration] = useState(true);
    const [practiceView, setPracticeView] = useState('all'); // all, pitch, resonance, weight, vowel
    const [pitchViewMode, setPitchViewMode] = useState('graph'); // graph or orb
    const [showMixerInDashboard, setShowMixerInDashboard] = useState(false);




    // Onboarding flow
    useEffect(() => {
        if (!isDataLoaded) return;
        const hasSeenTutorial = localStorage.getItem('gem_tutorial_seen');
        const hasSeenCompass = localStorage.getItem('gem_compass_seen');
        const hasCalibrated = localStorage.getItem('gem_calibration_done');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        } else if (!hasSeenCompass) {
            setShowCompass(true);
        } else if (!hasCalibrated) {
            setShowCalibration(true);
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
    };

    // Settings events
    useEffect(() => {
        const handleOpenVocalHealth = () => setShowVocalHealthTips(true);
        const handleOpenAssessment = () => setShowAssessment(true);
        const handleOpenWarmUp = () => setShowWarmUp(true);
        const handleOpenForwardFocus = () => setShowForwardFocus(true);
        window.addEventListener('openVocalHealth', handleOpenVocalHealth);
        window.addEventListener('openAssessment', handleOpenAssessment);
        window.addEventListener('openWarmUp', handleOpenWarmUp);
        window.addEventListener('openForwardFocus', handleOpenForwardFocus);
        return () => {
            window.removeEventListener('openVocalHealth', handleOpenVocalHealth);
            window.removeEventListener('openAssessment', handleOpenAssessment);
            window.removeEventListener('openWarmUp', handleOpenWarmUp);
            window.removeEventListener('openForwardFocus', handleOpenForwardFocus);
        };
    }, []);

    // Profile switching
    useEffect(() => {
        const handleSwitchProfile = () => window.location.reload();
        window.addEventListener('switchProfile', handleSwitchProfile);
        return () => window.removeEventListener('switchProfile', handleSwitchProfile);
    }, []);



    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 pb-20">
            {/* Header */}
            <header className="p-4 pt-safe bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-white/5" role="banner">
                <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20" aria-hidden="true">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Vocal GEM</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <OfflineIndicator />
                        <button onClick={() => setShowSettings(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700" aria-label="Open settings">
                            <span className="text-sm font-bold text-white" aria-hidden="true">⚙️ Settings</span>
                        </button>
                        <button onClick={() => user ? setShowProfile(true) : setShowLogin(true)} className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label={user ? "Open profile" : "Login"}>
                            <span className="text-lg" aria-hidden="true">👤</span>
                        </button>
                        <button onClick={() => setShowCamera(!showCamera)} className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors ${showCamera ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} aria-label={showCamera ? "Close camera" : "Open camera"} aria-pressed={showCamera}>
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6 max-w-[1600px] mx-auto" role="main">
                <Suspense fallback={<LoadingSpinner />}>
                    {activeTab === 'practice' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Real-time Analysis</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowPracticeMode(true)} className="px-4 py-2.5 rounded-full text-sm font-bold bg-slate-800 hover:bg-slate-700 text-purple-400 border border-purple-500/30 transition-all flex items-center gap-2">
                                        <Mic2 className="w-4 h-4" /> Voice Mode
                                    </button>
                                    <button onClick={toggleAudio} className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${isAudioActive ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-400 hover:to-violet-400 text-white hover:shadow-xl hover:shadow-teal-500/30 animate-glow-pulse'}`} aria-label={isAudioActive ? "Stop listening" : "Start listening"} aria-pressed={isAudioActive}>
                                        {isAudioActive ? <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" /> LIVE</> : <><Mic className="w-4 h-4" aria-hidden="true" /> START LISTENING</>}
                                    </button>
                                </div>
                            </div>
                            {/* Filter Menu */}
                            <div className="glass-panel-dark rounded-xl p-2 mb-6 flex gap-2 overflow-x-auto">
                                {[{ id: 'all', label: 'Show All' }, { id: 'pitch', label: 'Pitch' }, { id: 'resonance', label: 'Resonance' }, { id: 'weight', label: 'Weight' }, { id: 'tilt', label: 'Tilt' }, { id: 'vowel', label: 'Vowel' }, { id: 'articulation', label: 'Articulation' }, { id: 'contour', label: 'Contour' }, { id: 'quality', label: 'Quality' }, { id: 'spectrogram', label: 'Spectrogram' }].map(view => (
                                    <button key={view.id} onClick={() => setPracticeView(view.id)} className={`px-5 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap min-w-[80px] flex-shrink-0 ${practiceView === view.id ? 'bg-gradient-to-r from-teal-500 to-violet-500 text-white shadow-md shadow-teal-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/70 hover:text-white border border-slate-700/50'}`}>
                                        {view.label}
                                    </button>
                                ))}
                                <button onClick={() => setShowCourse(true)} className="px-5 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap min-w-[80px] flex-shrink-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500 shadow-md shadow-pink-500/20 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Course
                                </button>
                            </div>

                            {/* Dashboard Grid - Simplified for Performance */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                                {/* 1. Left: Dynamic Orb or Mixer */}
                                {(practiceView === 'all' || practiceView === 'resonance') && (
                                    <div className="flex flex-col h-[500px] relative">
                                        {/* Toggle for 'all' view */}
                                        {practiceView === 'all' && (
                                            <div className="absolute top-4 left-4 z-30">
                                                <button
                                                    onClick={() => setShowMixerInDashboard(!showMixerInDashboard)}
                                                    className="p-2 bg-slate-800/80 backdrop-blur rounded-lg border border-white/10 text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                    title={showMixerInDashboard ? "Switch to Orb" : "Switch to Mixer"}
                                                >
                                                    {showMixerInDashboard ? <Activity size={16} /> : <Sliders size={16} />}
                                                    <span className="text-xs font-bold">{showMixerInDashboard ? "Orb" : "Mixer"}</span>
                                                </button>
                                            </div>
                                        )}

                                        <div key="dynamic-orb-container" className="h-full w-full relative z-20 rounded-3xl overflow-hidden bg-slate-900/30 border border-white/5">
                                            {practiceView === 'all' ? (
                                                showMixerInDashboard ? (
                                                    <div className="h-full w-full p-2 pt-12">
                                                        <MixingBoardView
                                                            dataRef={dataRef}
                                                            audioEngine={audioEngineRef.current}
                                                            calibration={calibration}
                                                            compact={true}
                                                        />
                                                    </div>
                                                ) : (
                                                    <DynamicOrb dataRef={dataRef} calibration={calibration} />
                                                )
                                            ) : (
                                                <ResonanceOrb
                                                    dataRef={dataRef}
                                                    calibration={calibration}
                                                    showDebug={false}
                                                    colorBlindMode={settings.colorBlindMode}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 2. Right: Dashboard or Pitch Tracking */}
                                <div className="flex flex-col h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                    {practiceView === 'all' && (
                                        <div className="h-full min-h-[400px]">
                                            <GenderPerceptionDashboard dataRef={dataRef} />
                                        </div>
                                    )}

                                    {practiceView === 'pitch' && (
                                        <div className="h-full min-h-[300px]">
                                            <PitchVisualizer dataRef={dataRef} />
                                        </div>
                                    )}

                                    {practiceView === 'weight' && (
                                        <div className="h-full min-h-[300px]">
                                            <VoiceQualityMeter dataRef={dataRef} userMode="user" />
                                        </div>
                                    )}

                                    {practiceView === 'tilt' && (
                                        <div className="h-full min-h-[300px]">
                                            <SpectralTiltMeter dataRef={dataRef} />
                                        </div>
                                    )}

                                    {practiceView === 'vowel' && (
                                        <div className="h-full min-h-[300px]">
                                            <VowelSpacePlot dataRef={dataRef} />
                                        </div>
                                    )}

                                    {practiceView === 'articulation' && (
                                        <div className="h-full min-h-[300px] overflow-y-auto custom-scrollbar rounded-3xl border border-white/5 bg-slate-900/30">
                                            <ArticulationView />
                                        </div>
                                    )}

                                    {practiceView === 'contour' && (
                                        <div className="h-full min-h-[300px]">
                                            <ContourVisualizer dataRef={dataRef} />
                                        </div>
                                    )}

                                    {practiceView === 'quality' && (
                                        <div className="h-full min-h-[300px]">
                                            <QualityVisualizer dataRef={dataRef} />
                                        </div>
                                    )}

                                    {practiceView === 'spectrogram' && (
                                        <div className="h-full min-h-[300px]">
                                            <Spectrogram dataRef={dataRef} />
                                        </div>
                                    )}

                                    {/* Resonance Metrics (Desktop 'Alongside' View) */}
                                    {practiceView === 'resonance' && (
                                        <div className="mb-6">
                                            <ResonanceMetrics dataRef={dataRef} />
                                        </div>
                                    )}

                                    {/* Exercises Section */}
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
                            </div>
                        </div>
                    )
                    }
                    {activeTab === 'history' && <HistoryView stats={stats} journals={journals} onLogClick={() => setShowJournalForm(true)} />}
                    {
                        activeTab === 'tools' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setActiveTab('practice')} className="text-slate-400 hover:text-white"><ArrowLeft /></button>
                                    <h2 className="text-xl font-bold">Tools</h2>
                                </div>
                                <AudioLibrary audioEngine={audioEngineRef} />
                                <ComparisonTool />
                                <PitchPipe audioEngine={audioEngineRef} />
                                <BreathPacer />
                                <div className="p-4 bg-slate-800 rounded-xl flex flex-row items-center justify-between gap-3 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => setShowVocalFolds(true)}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                            <Activity size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-white">Vocal Folds Simulation</h3>
                                            <p className="text-xs text-slate-400">Interactive physics model</p>
                                        </div>
                                    </div>
                                </div>
                                <MirrorComponent />
                            </div>
                        )
                    }
                    {activeTab === 'mixing' && <MixingBoardView dataRef={dataRef} audioEngine={audioEngineRef.current} calibration={calibration} />}

                    {activeTab === 'coach' && <CoachView />}

                    {activeTab === 'analysis' && <AnalysisView />}
                </Suspense >
            </main >

            {/* Navigation */}
            <nav className="fixed bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 pb-safe z-40" role="navigation" aria-label="Main navigation">
                <div className="flex justify-around items-center p-2 max-w-[1600px] mx-auto">
                    <button onClick={() => { setActiveTab('practice'); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all relative ${activeTab === 'practice' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Mic2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Practice</span>
                        {activeTab === 'practice' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-teal-500 to-violet-500 rounded-full" />}
                    </button>

                    <button onClick={() => { setActiveTab('mixing'); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'mixing' ? 'text-pink-400 bg-pink-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Wrench className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Mixer</span>
                    </button>
                    <button onClick={() => { setActiveTab('coach'); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'coach' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Bot className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Coach</span>
                    </button>
                    <button onClick={() => { setActiveTab('history'); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <BarChart2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Progress</span>
                    </button>
                    <button onClick={() => { setActiveTab('analysis'); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'analysis' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Activity className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Analysis</span>
                    </button>
                </div>
            </nav >

            {/* Modals */}
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

            {showTutorial && <TutorialWizard onComplete={handleTutorialComplete} onSkip={() => { setShowTutorial(false); setShowCompass(true); }} />}
            {!showTutorial && showCompass && <CompassWizard onComplete={handleCompassComplete} />}
            {showCalibration && <CalibrationWizard onComplete={handleCalibrationComplete} onSkip={handleCalibrationComplete} audioEngine={audioEngineRef} />}
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

            <DebugOverlay audioEngine={audioEngineRef.current} />
        </div >
    );
};

export default App;
