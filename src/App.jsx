import React, { useState, useEffect } from 'react';
import { useGem } from './context/GemContext';
import ResonanceOrb from './components/viz/ResonanceOrb';
import LiveMetricsBar from './components/viz/LiveMetricsBar';
import PitchVisualizer from './components/viz/PitchVisualizer';
import PitchOrb from './components/viz/PitchOrb';
import Spectrogram from './components/viz/Spectrogram';
import VoiceQualityMeter from './components/viz/VoiceQualityMeter';
import VowelSpacePlot from './components/viz/VowelSpacePlot';
import GameHub from './components/games/GameHub';
import CoachView from './components/ui/CoachView';
import DailyGoalsWidget from './components/ui/DailyGoalsWidget';
import MixingBoardView from './components/views/MixingBoardView';
import HistoryView from './components/ui/HistoryView';
import AudioLibrary from './components/ui/AudioLibrary';
import PitchPipe from './components/ui/PitchPipe';
import FeedbackSettings from './components/ui/FeedbackSettings';
import TutorialWizard from './components/ui/TutorialWizard';
import CompassWizard from './components/ui/CompassWizard';
import CalibrationWizard from './components/ui/CalibrationWizard';
import BreathPacer from './components/ui/BreathPacer';
import MirrorComponent from './components/ui/MirrorComponent';
import JournalForm from './components/ui/JournalForm';
import Login from './components/ui/Login';
import Signup from './components/ui/Signup';
import ComparisonTool from './components/ui/ComparisonTool';
import IntonationExercise from './components/ui/IntonationExercise';
import VocalHealthTips from './components/ui/VocalHealthTips';
import AssessmentModule from './components/ui/AssessmentModule';
import WarmUpModule from './components/ui/WarmUpModule';
import ForwardFocusDrill from './components/ui/ForwardFocusDrill';
import IncognitoScreen from './components/ui/IncognitoScreen';
import FloatingCamera from './components/ui/FloatingCamera';
import OfflineIndicator from './components/ui/OfflineIndicator';
import MigrationModal from './components/ui/MigrationModal';
import AnalysisView from './components/views/AnalysisView';

// Games
import ResonanceRiverGame from './components/games/ResonanceRiverGame';
import CloudHopperGame from './components/games/CloudHopperGame';
import StaircaseGame from './components/games/StaircaseGame';
import FlappyVoiceGame from './components/games/FlappyVoiceGame';
import PitchMatchGame from './components/games/PitchMatchGame';

import { Mic, Camera, Book, Wrench, ArrowLeft, Mic2, Gamepad2, Bot, BarChart2, Activity } from 'lucide-react';

const App = () => {
    const {
        isAudioActive,
        toggleAudio,
        dataRef,
        calibration,
        updateCalibration,
        targetRange,
        updateTargetRange,
        userMode,
        goals,
        settings,
        updateSettings,
        journals,
        addJournalEntry,
        stats,
        audioEngineRef,
        showVocalHealthTips,
        setShowVocalHealthTips,
        showAssessment,
        setShowAssessment,
        showWarmUp,
        setShowWarmUp,
        showForwardFocus,
        setShowForwardFocus,
        submitGameResult,
        isDataLoaded,
    } = useGem();

    const [activeTab, setActiveTab] = useState('practice');
    const [showSettings, setShowSettings] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showCompass, setShowCompass] = useState(false);
    const [showCalibration, setShowCalibration] = useState(false);
    const [showJournalForm, setShowJournalForm] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [showIncognito, setShowIncognito] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showMigration, setShowMigration] = useState(true);
    const [practiceView, setPracticeView] = useState('all'); // all, pitch, resonance, weight, vowel
    const [pitchViewMode, setPitchViewMode] = useState('graph'); // graph or orb

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
            <header className="p-4 pt-safe flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
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
                    <button onClick={() => setShowLogin(true)} className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors">
                        <span className="text-lg">👤</span>
                    </button>
                    <button onClick={() => setShowCamera(!showCamera)} className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors ${showCamera ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <Camera className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 max-w-md mx-auto">
                {activeTab === 'practice' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DailyGoalsWidget goals={goals} />
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Real-time Analysis</h2>
                            <button onClick={toggleAudio} className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${isAudioActive ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-600 text-white'}`}>
                                {isAudioActive ? <><span className="w-2 h-2 bg-red-500 rounded-full" /> LIVE</> : <><Mic className="w-3 h-3" /> START</>}
                            </button>
                        </div>
                        {/* Filter Menu */}
                        <div className="glass-panel-dark rounded-xl p-2 mb-4 flex gap-2 overflow-x-auto">
                            {[{ id: 'all', label: 'Show All' }, { id: 'pitch', label: 'Pitch' }, { id: 'resonance', label: 'Resonance' }, { id: 'weight', label: 'Weight' }, { id: 'vowel', label: 'Vowel' }].map(view => (
                                <button key={view.id} onClick={() => setPracticeView(view.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${practiceView === view.id ? 'bg-blue-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                                    {view.label}
                                </button>
                            ))}
                        </div>
                        {/* Resonance Orb */}
                        {(practiceView === 'all' || practiceView === 'resonance') && <ResonanceOrb dataRef={dataRef} calibration={calibration} />}
                        {/* Live Metrics Bar */}
                        {practiceView === 'all' && <LiveMetricsBar dataRef={dataRef} />}
                        <div className="space-y-4">
                            {/* Pitch Visualizer */}
                            {(practiceView === 'all' || practiceView === 'pitch') && (
                                <div>
                                    <div className="flex justify-end mb-2">
                                        <div className="glass-panel-dark rounded-lg p-1 flex gap-1">
                                            <button onClick={() => setPitchViewMode('graph')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${pitchViewMode === 'graph' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>Graph</button>
                                            <button onClick={() => setPitchViewMode('orb')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${pitchViewMode === 'orb' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>Orb</button>
                                        </div>
                                    </div>
                                    {pitchViewMode === 'graph' ? (
                                        <PitchVisualizer dataRef={dataRef} targetRange={targetRange} userMode={userMode} exercise={activeGame} onScore={score => submitGameResult(activeGame, score)} settings={settings} />
                                    ) : (
                                        <PitchOrb dataRef={dataRef} settings={settings} />
                                    )}
                                </div>
                            )}
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
                            {/* Voice Quality & Vowel Space */}
                            {(practiceView === 'all' || practiceView === 'weight' || practiceView === 'vowel') && (
                                <div className="grid grid-cols-2 gap-4">
                                    {(practiceView === 'all' || practiceView === 'weight') && <VoiceQualityMeter dataRef={dataRef} userMode={userMode} />}
                                    {(practiceView === 'all' || practiceView === 'vowel') && <VowelSpacePlot dataRef={dataRef} userMode={userMode} />}
                                </div>
                            )}
                        </div>
                        {/* Bottom Buttons */}
                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <button onClick={() => setActiveTab('tools')} className="p-4 bg-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors">
                                <Wrench className="text-purple-400" />
                                <span className="text-xs font-bold">Tools</span>
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'games' && <GameHub onSelectGame={handleSelectGame} />}
                {activeTab === 'coach' && <CoachView />}
                {activeTab === 'history' && <HistoryView stats={stats} journals={journals} onLogClick={() => setShowJournalForm(true)} />}
                {activeTab === 'tools' && (
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
                )}
                {activeTab === 'mixing' && <MixingBoardView dataRef={dataRef} audioEngine={audioEngineRef.current} />}
                {activeTab === 'analysis' && <AnalysisView />}
            </main>

            {/* Navigation */}
            <nav className="fixed bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 pb-safe z-40">
                <div className="flex justify-around items-center p-2 max-w-md mx-auto">
                    <button onClick={() => { setActiveTab('practice'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'practice' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Mic2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Practice</span>
                    </button>
                    <button onClick={() => { setActiveTab('games'); setActiveGame(null); }} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === 'games' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Gamepad2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Arcade</span>
                    </button>
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
            </nav>

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
            {showTutorial && <TutorialWizard onComplete={handleTutorialComplete} onSkip={() => { setShowTutorial(false); setShowCompass(true); }} />}
            {!showTutorial && showCompass && <CompassWizard onComplete={handleCompassComplete} />}
            {showCalibration && <CalibrationWizard onComplete={handleCalibrationComplete} audioEngine={audioEngineRef} />}
            {showJournalForm && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <JournalForm onSubmit={addJournalEntry} onCancel={() => setShowJournalForm(false)} />
                    </div>
                </div>
            )}
            {showLogin && <Login onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} onClose={() => setShowLogin(false)} />}
            {showSignup && <Signup onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} onClose={() => setShowSignup(false)} />}
            {showVocalHealthTips && <VocalHealthTips onClose={() => setShowVocalHealthTips(false)} />}
            {showAssessment && <AssessmentModule onClose={() => setShowAssessment(false)} />}
            {showWarmUp && <WarmUpModule onComplete={() => setShowWarmUp(false)} onSkip={() => setShowWarmUp(false)} />}
            {showForwardFocus && <ForwardFocusDrill onClose={() => setShowForwardFocus(false)} />}
            {showIncognito && <IncognitoScreen onClose={() => setShowIncognito(false)} />}
            {showCamera && <FloatingCamera onClose={() => setShowCamera(false)} />}
        </div>
    );
};

export default App;
