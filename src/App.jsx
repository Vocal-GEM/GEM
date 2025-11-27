import React, { useState, useEffect } from 'react';
import { useAudio } from './context/AudioContext';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';
import { useStats } from './context/StatsContext';
import { useJournal } from './context/JournalContext';

// Icons
import { Mic, Mic2, Camera, ArrowLeft, Wrench, Bot, BarChart2, Activity, Gamepad2 } from 'lucide-react';

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
import FloatingCamera from './components/ui/FloatingCamera';
import AchievementPopup from './components/ui/AchievementPopup';
import AudioLibrary from './components/ui/AudioLibrary';
import IntonationExercise from './components/ui/IntonationExercise';
import ComparisonTool from './components/ui/ComparisonTool';
import PitchPipe from './components/ui/PitchPipe';
import BreathPacer from './components/ui/BreathPacer';
import MirrorComponent from './components/ui/MirrorComponent';
import CoachView from './components/ui/CoachView';
import HistoryView from './components/ui/HistoryView';

// Components - Views
import SLPDashboard from './components/views/SLPDashboard';
import PracticeMode from './components/views/PracticeMode';
import MixingBoardView from './components/views/MixingBoardView';
import AnalysisView from './components/views/AnalysisView';
import ArticulationView from './components/views/ArticulationView';

// Components - Visualizations
import DynamicOrb from './components/viz/DynamicOrb';
import ResonanceOrb from './components/viz/ResonanceOrb';
import LiveMetricsBar from './components/viz/LiveMetricsBar';
import PitchVisualizer from './components/viz/PitchVisualizer';
import PitchOrb from './components/viz/PitchOrb';
import VoiceQualityMeter from './components/viz/VoiceQualityMeter';
import VowelSpacePlot from './components/viz/VowelSpacePlot';
import HighResSpectrogram from './components/viz/HighResSpectrogram';
import Spectrogram from './components/viz/Spectrogram';
import ContourVisualizer from './components/viz/ContourVisualizer';
import QualityVisualizer from './components/viz/QualityVisualizer';

// Components - Games
import GameHub from './components/games/GameHub';
import FlappyVoiceGame from './components/games/FlappyVoiceGame';
import ResonanceRiverGame from './components/games/ResonanceRiverGame';
import CloudHopperGame from './components/games/CloudHopperGame';
import StaircaseGame from './components/games/StaircaseGame';
import PitchMatchGame from './components/games/PitchMatchGame';

// Services
import { gamificationService } from './services/GamificationService';

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
        goals,
        submitGameResult
    } = useStats();

    const {
        journals,
        addJournalEntry,
        showJournalForm,
        setShowJournalForm
    } = useJournal();

    // Local state for UI only
    const [userMode, setUserMode] = useState('user'); // Moved to local or SettingsContext if global?
    // Let's keep userMode local or in Settings for now. It was in GemContext.
    // I'll add it to local state here for now, but ideally it should be in SettingsContext.
    // Actually, let's assume it's in SettingsContext or handled locally if it's just a view toggle.
    // The original GemContext had it. Let's add it to local state for now to minimize breakage.

    // Other UI state
    const [showVocalHealthTips, setShowVocalHealthTips] = useState(false);
    const [showAssessment, setShowAssessment] = useState(false);
    const [showWarmUp, setShowWarmUp] = useState(false);
    const [showForwardFocus, setShowForwardFocus] = useState(false);
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

    // Helper function for updating user mode
    const updateUserMode = (newMode) => {
        setUserMode(newMode);
    };

    // Initialize Gamification
    useEffect(() => {
        if (isDataLoaded) {
            gamificationService.updateStreak();
            gamificationService.checkTimeBasedAchievements();
        }
    }, [isDataLoaded]);

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

    // Clear active game if gamification is disabled
    useEffect(() => {
        if (settings.gamificationEnabled === false) {
            setActiveGame(null);
        }
    }, [settings.gamificationEnabled]);

    const [activeGame, setActiveGame] = useState(null);
    const [logoTapCount, setLogoTapCount] = useState(0);
    const [logoTapTimeout, setLogoTapTimeout] = useState(null);

    const handleLogoClick = () => {
        const newCount = logoTapCount + 1;
        setLogoTapCount(newCount);
        if (logoTapTimeout) clearTimeout(logoTapTimeout);
        if (newCount === 3) {
            setShowIncognito(true);
            setLogoTapCount(0);
        } else {
            const timeout = setTimeout(() => setLogoTapCount(0), 1000);
            setLogoTapTimeout(timeout);
        }
    };

    const handleSelectGame = (gameId) => {
        setActiveGame(gameId);
        setActiveTab('practice');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 pb-20">
            {/* Header */}
            <header className="p-4 pt-safe bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
                <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Vocal GEM</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <OfflineIndicator />
                        <button onClick={() => setShowSettings(true)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
                            <span className="text-sm font-bold text-white">⚙️ Settings</span>
                        </button>
                        <button onClick={() => user ? setShowProfile(true) : setShowLogin(true)} className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors">
                            <span className="text-lg">👤</span>
                        </button>
                        <button onClick={() => setShowCamera(!showCamera)} className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors ${showCamera ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={userMode === 'slp' ? "h-[calc(100vh-80px)]" : "p-6 max-w-[1600px] mx-auto"}>
                {activeTab === 'practice' && (
                    userMode === 'slp' ? (
                        <SLPDashboard dataRef={dataRef} audioEngine={audioEngineRef.current} />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Real-time Analysis</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowPracticeMode(true)} className="px-4 py-2.5 rounded-full text-sm font-bold bg-slate-800 hover:bg-slate-700 text-purple-400 border border-purple-500/30 transition-all flex items-center gap-2">
                                        <Mic2 className="w-4 h-4" /> Voice Mode
                                    </button>
                                    <button onClick={toggleAudio} className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${isAudioActive ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-400 hover:to-violet-400 text-white hover:shadow-xl hover:shadow-teal-500/30 animate-glow-pulse'}`}>
                                        {isAudioActive ? <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE</> : <><Mic className="w-4 h-4" /> START LISTENING</>}
                                    </button>
                                </div>
                            </div>
                            {/* Filter Menu */}
                            <div className="glass-panel-dark rounded-xl p-2 mb-6 flex gap-2 overflow-x-auto">
                                {[{ id: 'all', label: 'Show All' }, { id: 'pitch', label: 'Pitch' }, { id: 'resonance', label: 'Resonance' }, { id: 'weight', label: 'Weight' }, { id: 'vowel', label: 'Vowel' }, { id: 'articulation', label: 'Articulation' }, { id: 'contour', label: 'Contour' }, { id: 'quality', label: 'Quality' }, { id: 'spectrogram', label: 'Spectrogram' }].map(view => (
                                    <button key={view.id} onClick={() => setPracticeView(view.id)} className={`px-5 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap min-w-[80px] flex-shrink-0 ${practiceView === view.id ? 'bg-gradient-to-r from-teal-500 to-violet-500 text-white shadow-md shadow-teal-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/70 hover:text-white border border-slate-700/50'}`}>
                                        {view.label}
                                    </button>
                                ))}
                            </div>

                            {/* Dashboard Grid - 2x2 Layout for Top Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                                {/* 1. Top Left: Visualization (Orb) */}
                                <div className="flex flex-col">
                                    {/* Dynamic Orb (Show All) or Legacy Resonance Orb (Resonance Tab) */}
                                    {practiceView === 'all' ? (
                                        <div key="dynamic-orb-container" className="h-80 lg:h-[500px] w-full mb-6 relative z-20 rounded-3xl overflow-hidden bg-slate-900/30 border border-white/5">
                                            <DynamicOrb dataRef={dataRef} calibration={calibration} />
                                        </div>
                                    ) : (
                                        practiceView === 'resonance' && (
                                            <div key="resonance-orb-container" className="w-full mb-6 relative z-20">
                                                <ResonanceOrb dataRef={dataRef} calibration={calibration} showDebug={true} />
                                            </div>
                                        )
                                    )}
                                    {/* Live Metrics Bar */}
                                    {practiceView === 'all' && <LiveMetricsBar dataRef={dataRef} />}
                                </div>

                                {/* 2. Top Right: Pitch Tracking */}
                                <div className="flex flex-col">
                                    {(practiceView === 'all' || practiceView === 'pitch') && (
                                        <div className="h-80 lg:h-[500px] flex flex-col">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pitch Tracking</h3>
                                                <div className="glass-panel-dark rounded-lg p-1 flex gap-1">
                                                    <button onClick={() => setPitchViewMode('graph')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${pitchViewMode === 'graph' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>Graph</button>
                                                    <button onClick={() => setPitchViewMode('orb')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${pitchViewMode === 'orb' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>Orb</button>
                                                </div>
                                            </div>
                                            <div className="flex-grow relative rounded-3xl overflow-hidden bg-slate-900/30 border border-white/5">
                                                {pitchViewMode === 'graph' ? (
                                                    <PitchVisualizer dataRef={dataRef} targetRange={targetRange} userMode={userMode} exercise={activeGame} onScore={score => submitGameResult(activeGame, score)} settings={settings} />
                                                ) : (
                                                    <PitchOrb dataRef={dataRef} settings={settings} />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Bottom Left: Voice Quality */}
                                <div className="space-y-4 h-full min-h-[400px]">
                                    {(practiceView === 'all' || practiceView === 'weight') && <VoiceQualityMeter dataRef={dataRef} userMode={userMode} />}
                                </div>

                                {/* 4. Bottom Right: Vowel Space */}
                                <div className="space-y-4 h-full min-h-[400px]">
                                    {(practiceView === 'all' || practiceView === 'vowel') && <VowelSpacePlot dataRef={dataRef} userMode={userMode} />}
                                </div>

                                {/* 5. Full Width: Spectrogram */}
                                {(practiceView === 'all' || practiceView === 'spectrogram') && (
                                    <div className="col-span-1 lg:col-span-2 space-y-4 h-full min-h-[300px]">
                                        <div className="h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
                                            <HighResSpectrogram dataRef={dataRef} />
                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-blue-400 border border-blue-500/30">
                                                Spectrogram
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 6. Full Width: Articulation */}
                                {(practiceView === 'articulation') && (
                                    <div className="col-span-1 lg:col-span-2 space-y-4 h-full min-h-[500px]">
                                        <div className="h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative p-4">
                                            <ArticulationView />
                                        </div>
                                    </div>
                                )}

                                {/* 7. Full Width: Contour */}
                                {(practiceView === 'contour') && (
                                    <div className="col-span-1 lg:col-span-2 space-y-4 h-full min-h-[500px]">
                                        <div className="h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
                                            <ContourVisualizer dataRef={dataRef} />
                                        </div>
                                    </div>
                                )}

                                {/* 8. Full Width: Quality */}
                                {(practiceView === 'quality') && (
                                    <div className="col-span-1 lg:col-span-2 space-y-4 h-full min-h-[500px]">
                                        <div className="h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
                                            <QualityVisualizer dataRef={dataRef} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Full Width Tools Section */}
                            <div className="w-full">
                                <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Tools</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button onClick={() => setActiveTab('tools')} className="p-4 bg-slate-800 rounded-xl flex flex-row items-center gap-3 hover:bg-slate-700 transition-colors group">
                                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                                <Wrench size={20} />
                                            </div>
                                            <span className="text-sm font-bold">All Tools</span>
                                        </button>
                                        <button onClick={() => setShowCamera(!showCamera)} className={`p-4 rounded-xl flex flex-row items-center gap-3 transition-colors group ${showCamera ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                            <div className={`p-2 rounded-lg transition-all ${showCamera ? 'bg-white/20 text-white' : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                                                <Camera size={20} />
                                            </div>
                                            <span className="text-sm font-bold">Mirror</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Game Overlay */}
                            {activeGame && (
                                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                                    <div className="w-full max-w-md">
                                        {activeGame === 'flappy' && <FlappyVoiceGame dataRef={dataRef} targetRange={targetRange} onScore={s => submitGameResult('flappy', s)} onClose={() => setActiveGame(null)} />}
                                        {activeGame === 'river' && <ResonanceRiverGame dataRef={dataRef} targetRange={targetRange} onScore={s => submitGameResult('river', s)} onClose={() => setActiveGame(null)} />}
                                        {activeGame === 'hopper' && <CloudHopperGame dataRef={dataRef} targetRange={targetRange} onScore={s => submitGameResult('hopper', s)} onClose={() => setActiveGame(null)} />}
                                        {activeGame === 'stairs' && <StaircaseGame dataRef={dataRef} targetRange={targetRange} onScore={s => submitGameResult('stairs', s)} onClose={() => setActiveGame(null)} />}
                                        {activeGame === 'pitchmatch' && <PitchMatchGame dataRef={dataRef} targetRange={targetRange} onScore={s => submitGameResult('pitchmatch', s)} onClose={() => setActiveGame(null)} />}
                                    </div>
                                </div>
                            )}
                            {/* Spectrogram for SLP mode */}
                            {userMode === 'slp' && <Spectrogram dataRef={dataRef} />}
                        </div>
                    )
                )}
                {activeTab === 'games' && <GameHub onSelectGame={handleSelectGame} />}
                {activeTab === 'coach' && <CoachView />}
                {activeTab === 'history' && <HistoryView stats={stats} journals={journals} userMode={userMode} onLogClick={() => setShowJournalForm(true)} />}
                {
                    activeTab === 'tools' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setActiveTab('practice')} className="text-slate-400 hover:text-white"><ArrowLeft /></button>
                                <h2 className="text-xl font-bold">Tools</h2>
                            </div>
                            <AudioLibrary audioEngine={audioEngineRef} />
                            <IntonationExercise />
                            <ComparisonTool />
                            <PitchPipe audioEngine={audioEngineRef} />
                            <BreathPacer />
                            <MirrorComponent />
                        </div>
                    )
                }
                {activeTab === 'mixing' && <MixingBoardView dataRef={dataRef} audioEngine={audioEngineRef.current} calibration={calibration} />}

                {activeTab === 'analysis' && <AnalysisView />}

            </main >

            {/* Navigation */}
            < nav className="fixed bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 pb-safe z-40" >
                <div className="flex justify-around items-center p-2 max-w-[1600px] mx-auto">
                    <button onClick={() => { setActiveTab('practice'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all relative ${activeTab === 'practice' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Mic2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Practice</span>
                        {activeTab === 'practice' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-teal-500 to-violet-500 rounded-full" />}
                    </button>
                    {settings.gamificationEnabled !== false && (
                        <button onClick={() => { setActiveTab('games'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all relative ${activeTab === 'games' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Gamepad2 className="w-6 h-6" />
                            <span className="text-[10px] font-bold">Arcade</span>
                            {activeTab === 'games' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-teal-500 to-violet-500 rounded-full" />}
                        </button>
                    )}
                    <button onClick={() => { setActiveTab('mixing'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'mixing' ? 'text-pink-400 bg-pink-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Wrench className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Mixer</span>
                    </button>
                    <button onClick={() => { setActiveTab('coach'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'coach' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Bot className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Coach</span>
                    </button>
                    <button onClick={() => { setActiveTab('history'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <BarChart2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Progress</span>
                    </button>
                    <button onClick={() => { setActiveTab('analysis'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'analysis' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Activity className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Analysis</span>
                    </button>
                </div>
            </nav >

            {/* Modals */}
            < FeedbackSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                settings={settings}
                setSettings={updateSettings}
                targetRange={targetRange}
                userMode={userMode}
                setUserMode={updateUserMode}
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
            {(showTutorial || showCompass || showCalibration) && (
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
            )}

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
            {showPracticeMode && (
                <PracticeMode
                    onClose={() => setShowPracticeMode(false)}
                    dataRef={dataRef}
                    calibration={calibration}
                    targetRange={targetRange}
                    goals={goals}
                    onSelectGame={handleSelectGame}
                    activeTab={activeTab}
                    userMode={userMode}
                    onOpenSettings={() => setShowSettings(true)}
                    onOpenJournal={() => { setActiveTab('history'); setShowJournalForm(true); }}
                    onOpenStats={() => setActiveTab('history')}
                    onNavigate={setActiveTab}
                    onUpdateRange={updateTargetRange}
                    onSwitchProfile={switchProfile}
                    onUpdateUserMode={updateUserMode}
                    settings={settings}
                />
            )}
            <AchievementPopup />
        </div >
    );
};

export default App;
