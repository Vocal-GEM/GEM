import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Play, Square, Mic, Volume2, Activity, BarChart2, RefreshCw, X, Mic2, Layers, BookOpen, Dumbbell, ClipboardCheck, Timer, Sparkles, MessageCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../../context/NavigationContext';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { useTour } from '../../context/TourContext';

// Components
import DynamicOrb from '../viz/DynamicOrb';
import PitchVisualizer from '../viz/PitchVisualizer';
import ResonanceOrb from '../viz/ResonanceOrb';
import VoiceQualityMeter from '../viz/VoiceQualityMeter';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import Spectrogram from '../viz/Spectrogram';
import PracticeCardsPanel from '../ui/PracticeCardsPanel';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';
import WarmupRoutine from '../ui/WarmupRoutine';
import VocalStatsSummary from '../ui/VocalStatsSummary';

import CoachPanel from '../ui/CoachPanel';
import ProgressCharts from '../viz/ProgressCharts';
import SelfAssessmentModal from '../ui/SelfAssessmentModal';
import InstantPlayback from '../ui/InstantPlayback';
import PracticeTimer from '../ui/PracticeTimer';
import PracticeSessionTimer from '../ui/PracticeSessionTimer';
import ComparisonTool from '../ui/ComparisonTool';

// Embeddable Views
import TrainingView from './TrainingView';
import ProgressiveStackingSession from './ProgressiveStackingSession';
import AssessmentModule from '../ui/AssessmentModule';

// Tools
import PitchTargets from '../ui/PitchTargets';
import ToneGenerator from '../ui/ToneGenerator';
import PitchPipe from '../ui/PitchPipe';
import StrainIndicator from '../viz/StrainIndicator';
import VoiceQualityAnalysis from '../viz/VoiceQualityAnalysis';
import VowelAnalysis from '../viz/VowelAnalysis';
import GenderPerceptionBadge from '../ui/GenderPerceptionBadge';
import PitchResonanceQuadrant from '../viz/PitchResonanceQuadrant'; // New visualization
import DAFMode from '../ui/DAFMode';
import EnvironmentCheck from '../ui/EnvironmentCheck';
import ToolExercises from '../ui/ToolExercises';
import PracticeWellnessCheck from '../ui/PracticeWellnessCheck';
import ConversationPractice from '../ui/ConversationPractice';


import { CoachingEngine } from '../../utils/CoachingEngine';


const PracticeMode = ({
    dataRef,
    calibration,
    targetRange,
    settings
}) => {
    const {
        practiceTab,
        switchPracticeTab,
        openModal,
        navigationParams
    } = useNavigation();
    const { t } = useTranslation();

    const {
        audioEngineRef,
        isAudioActive,
        toggleAudio
    } = useAudio();

    const { startTour } = useTour();

    // Deep Linking Handler
    useEffect(() => {
        if (navigationParams?.tool) {
            switchPracticeTab(navigationParams.tool);
        }
    }, [navigationParams, switchPracticeTab]);

    useEffect(() => {
        startTour('practice_mode');
    }, [startTour]);

    useEffect(() => {
        if (practiceTab === 'spectrogram') {
            startTour('spectrogram');
        }
    }, [practiceTab, startTour]);

    const { saveSession } = useProfile();
    const [showTimer, setShowTimer] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [showSelfAssessmentModal, setShowSelfAssessmentModal] = useState(false);
    const [selfAssessmentSessionData, setSelfAssessmentSessionData] = useState(null);
    const [showWarmup, setShowWarmup] = useState(false);
    const [showDAF, setShowDAF] = useState(false);
    const [showEnvironmentCheck, setShowEnvironmentCheck] = useState(false);
    const [showWellnessCheck, setShowWellnessCheck] = useState(false);
    const [showProgressiveStacking, setShowProgressiveStacking] = useState(false);
    const [showConversationPractice, setShowConversationPractice] = useState(false);
    const [lastSessionDuration, setLastSessionDuration] = useState(0);
    const [focusMode, setFocusMode] = useState(false);
    const [coachPanelCollapsed, setCoachPanelCollapsed] = useState(false);

    // Tour for DAF mode - placed after showDAF is declared
    useEffect(() => {
        if (showDAF) {
            setTimeout(() => startTour('daf_mode'), 300);
        }
    }, [showDAF, startTour]);

    // Session Tracking
    const sessionRef = useRef({
        startTime: null,
        accumulatedPitch: 0,
        accumulatedResonance: 0,
        accumulatedVolume: 0,
        sampleCount: 0,
        stabilityScore: 0,
        pitchMin: Infinity,
        pitchMax: -Infinity,
        volumeMin: Infinity,
        volumeMax: -Infinity
    });
    const [sessionSummary, setSessionSummary] = useState(null);

    const saveCurrentSession = useCallback(async () => {
        const session = sessionRef.current;
        if (!session.startTime || session.sampleCount < 10) return; // Ignore short/empty sessions (< 1s)

        const duration = (Date.now() - session.startTime) / 1000;
        const avgPitch = session.accumulatedPitch / session.sampleCount;
        const avgResonance = session.accumulatedResonance / session.sampleCount;
        const avgStability = session.stabilityScore / session.sampleCount;

        try {
            await saveSession({
                timestamp: Date.now(),
                duration,
                pitch: avgPitch,
                resonance: avgResonance,
                stability: avgStability,
                notes: 'Practice Session'
            });
        } catch (e) {
            console.error("Failed to save session:", e);
        }

        // Reset
        sessionRef.current = {
            startTime: null,
            accumulatedPitch: 0,
            accumulatedResonance: 0,
            accumulatedVolume: 0,
            sampleCount: 0,
            stabilityScore: 0,
            pitchMin: Infinity,
            pitchMax: -Infinity,
            volumeMin: Infinity,
            volumeMax: -Infinity
        };
    }, [saveSession]);

    // Handle Audio Toggle (Start/Stop Session)
    useEffect(() => {
        if (isAudioActive) {
            // Start new session
            sessionRef.current = {
                startTime: Date.now(),
                accumulatedPitch: 0,
                accumulatedResonance: 0,
                accumulatedVolume: 0,
                sampleCount: 0,
                stabilityScore: 0,
                pitchMin: Infinity,
                pitchMax: -Infinity,
                volumeMin: Infinity,
                volumeMax: -Infinity
            };
        } else {
            // Stop and save - show summary if we have data
            const session = sessionRef.current;
            if (session.startTime && session.sampleCount >= 10) {
                const duration = (Date.now() - session.startTime) / 1000;

                // Show wellness check if session was longer than 5 minutes (300 seconds)
                // or randomly with 20% probability for shorter sessions to build habit
                if (duration > 300 || Math.random() < 0.2) {
                    setLastSessionDuration(duration);
                    // Slight delay so it appears nicely after summary potentially
                    setTimeout(() => setShowWellnessCheck(true), 500);
                }

                setSessionSummary({
                    pitchMin: session.pitchMin === Infinity ? 0 : session.pitchMin,
                    pitchMax: session.pitchMax === -Infinity ? 0 : session.pitchMax,
                    pitchAvg: session.accumulatedPitch / session.sampleCount,
                    volumeMin: session.volumeMin === Infinity ? 0 : session.volumeMin,
                    volumeMax: session.volumeMax === -Infinity ? 0 : session.volumeMax,
                    volumeAvg: session.accumulatedVolume / session.sampleCount,
                    duration,
                    sampleCount: session.sampleCount
                });

                // Prepare data for self-assessment modal
                setSelfAssessmentSessionData({
                    duration,
                    averagePitch: session.accumulatedPitch / session.sampleCount,
                    metrics: { ...dataRef.current } // Capture current metrics at session end
                });
                setShowSelfAssessmentModal(true);
            }
            saveCurrentSession();
        }
    }, [isAudioActive, saveCurrentSession, dataRef]);

    // Accumulate Metrics
    useEffect(() => {
        if (!isAudioActive) return;

        const interval = setInterval(() => {
            if (dataRef.current && dataRef.current.pitch > 0) {
                const pitch = dataRef.current.pitch;
                const volume = dataRef.current.volume || dataRef.current.rms || 0;

                sessionRef.current.accumulatedPitch += pitch;
                sessionRef.current.accumulatedResonance += dataRef.current.resonance;
                sessionRef.current.accumulatedVolume += volume;

                // Track min/max
                if (pitch < sessionRef.current.pitchMin) sessionRef.current.pitchMin = pitch;
                if (pitch > sessionRef.current.pitchMax) sessionRef.current.pitchMax = pitch;
                if (volume < sessionRef.current.volumeMin) sessionRef.current.volumeMin = volume;
                if (volume > sessionRef.current.volumeMax) sessionRef.current.volumeMax = volume;

                // Simple stability metric (inverse of variance, simplified here)
                sessionRef.current.stabilityScore += (100 - Math.min(dataRef.current.clarity || 0, 100));
                sessionRef.current.sampleCount++;
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isAudioActive, dataRef]);

    // Save on unmount if active
    useEffect(() => {
        return () => {
            if (isAudioActive) {
                saveCurrentSession();
            }
        };
    }, [isAudioActive, saveCurrentSession]);

    // Coaching State
    const [coachingPrompt, setCoachingPrompt] = useState(null);
    const coachingEngineRef = useRef(new CoachingEngine());

    useEffect(() => {
        if (!isAudioActive) {
            setCoachingPrompt(null);
            return;
        }

        const interval = setInterval(() => {
            if (dataRef.current) {
                const prompt = coachingEngineRef.current.process(dataRef.current);
                if (prompt) {
                    setCoachingPrompt(prompt);
                    // Auto-clear after 3 seconds
                    setTimeout(() => setCoachingPrompt(null), 3000);
                }
            }
        }, 100); // Check every 100ms

        return () => clearInterval(interval);
    }, [isAudioActive, dataRef]);

    // Tab Categories for streamlined navigation
    const TAB_CATEGORIES = {
        basics: {
            label: 'Basics',
            tabs: [
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'pitch', label: 'Pitch', icon: Mic2 },
                { id: 'resonance', label: 'Resonance', icon: Volume2 },
            ]
        },
        advanced: {
            label: 'Advanced',
            tabs: [
                { id: 'perception', label: 'Perception', icon: Layers },
                { id: 'weight', label: 'Weight', icon: BarChart2 },
                { id: 'vowel', label: 'Vowels', icon: BookOpen },
                { id: 'spectrogram', label: 'Spectrogram', icon: Activity },
            ]
        },
        practice: {
            label: 'Practice',
            tabs: [
                { id: 'training', label: 'Training', icon: Dumbbell },
                { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
            ]
        }
    };

    // Get current category based on active tab
    const getCurrentCategory = () => {
        for (const [categoryKey, category] of Object.entries(TAB_CATEGORIES)) {
            if (category.tabs.find(tab => tab.id === practiceTab)) {
                return categoryKey;
            }
        }
        return 'basics';
    };

    const [activeCategory, setActiveCategory] = useState(getCurrentCategory());

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Coaching Prompt Overlay */}
            {coachingPrompt && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className={`px-6 py-3 rounded-full shadow-2xl border backdrop-blur-md flex items-center gap-3 ${coachingPrompt.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-100' :
                        coachingPrompt.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100' :
                            coachingPrompt.type === 'info' ? 'bg-blue-500/20 border-blue-500/50 text-blue-100' :
                                'bg-slate-800/80 border-slate-700 text-slate-200'
                        }`}>
                        {coachingPrompt.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
                        {coachingPrompt.type === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
                        <span className="font-medium text-sm">{coachingPrompt.message}</span>
                    </div>
                </div>
            )}

            {/* Header / Tabs - Grouped by Category */}
            <div className="flex flex-col mb-4 gap-3">
                {/* Category Selector */}
                <div className="flex items-center justify-center gap-2 mx-auto">
                    {Object.entries(TAB_CATEGORIES).map(([categoryKey, category]) => (
                        <button
                            key={categoryKey}
                            onClick={() => {
                                setActiveCategory(categoryKey);
                                switchPracticeTab(category.tabs[0].id);
                            }}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === categoryKey
                                ? 'bg-gradient-to-r from-teal-500 to-violet-600 text-white shadow-lg'
                                : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Sub-tabs within Category */}
                <div id="practice-tabs" className="flex items-center justify-center gap-1 p-1 bg-slate-900/50 rounded-full border border-white/5 w-fit mx-auto">
                    {TAB_CATEGORIES[activeCategory].tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => switchPracticeTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${practiceTab === tab.id
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            aria-label={`Switch to ${tab.label}`}
                        >
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden"><tab.icon size={16} /></span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Grid - Rebalanced */}
            <div className={`grid grid-cols-1 gap-6 w-full transition-all ${focusMode ? '' : 'lg:grid-cols-12'}`}>

                {/* Center Stage: Visualization (Spans 8 cols, or full width in focus mode) */}
                <div className={`flex flex-col gap-6 ${focusMode ? '' : 'lg:col-span-8'}`}>
                    <div className="relative w-full aspect-video lg:aspect-auto lg:h-[500px] bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative group">

                        {/* Visualization Layer */}
                        <div className="flex-1 relative z-10">
                            <ErrorBoundary>
                                <Suspense fallback={<LoadingSpinner />}>
                                    {practiceTab === 'overview' && (
                                        <DynamicOrb
                                            dataRef={dataRef}
                                            calibration={calibration}
                                            showDebug={false}
                                            colorBlindMode={settings.colorBlindMode}
                                        />
                                    )}
                                    {practiceTab === 'pitch' && <PitchVisualizer dataRef={dataRef} targetRange={targetRange} />}
                                    {practiceTab === 'resonance' && <ResonanceOrb dataRef={dataRef} />}
                                    {practiceTab === 'perception' && (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
                                            <GenderPerceptionBadge dataRef={dataRef} showDetails={true} />
                                            <PitchResonanceQuadrant dataRef={dataRef} size={Math.min(400, window.innerWidth - 80)} />
                                        </div>
                                    )}
                                    {practiceTab === 'weight' && <VoiceQualityMeter dataRef={dataRef} userMode="user" showAnalysis={false} />}
                                    {practiceTab === 'vowel' && <VowelSpacePlot dataRef={dataRef} showAnalysis={false} />}
                                    {practiceTab === 'spectrogram' && <Spectrogram dataRef={dataRef} />}
                                    {practiceTab === 'training' && <TrainingView />}
                                    {practiceTab === 'assessment' && <AssessmentModule embedded={true} />}
                                </Suspense>
                            </ErrorBoundary>
                        </div>

                        {/* Top Right Tools Overlay */}
                        <div className="absolute top-4 right-4 z-50 flex gap-2 items-center">
                            {/* Focus Mode Toggle */}
                            <button
                                onClick={() => setFocusMode(!focusMode)}
                                className={`p-2.5 rounded-full transition-all backdrop-blur-sm border ${
                                    focusMode
                                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
                                        : 'bg-black/50 hover:bg-slate-800 text-slate-400 hover:text-white border-white/10'
                                }`}
                                title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                            >
                                {focusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            {/* Session Timer with Wellness Reminders */}
                            {isAudioActive && (
                                <PracticeSessionTimer
                                    isActive={isAudioActive}
                                    onPause={toggleAudio}
                                />
                            )}
                            <InstantPlayback />
                            {timerActive ? (
                                <PracticeTimer compact onClose={() => setTimerActive(false)} />
                            ) : (
                                <button
                                    onClick={() => setShowTimer(true)}
                                    className="p-2.5 rounded-full bg-black/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all backdrop-blur-sm border border-white/10"
                                    title="Practice Timer"
                                >
                                    <Timer size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Primary Control - Centralized */}
                    <div className="flex justify-center -mt-2">
                        <button
                            id="mic-button"
                            onClick={toggleAudio}
                            className={`px-8 py-4 rounded-full text-lg font-bold flex items-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 ${isAudioActive
                                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20'
                                : 'bg-gradient-to-r from-teal-500 to-violet-600 text-white hover:shadow-teal-500/40 ring-4 ring-slate-900 border border-white/20'
                                }`}
                        >
                            {isAudioActive ? (
                                <><Square size={20} fill="currentColor" /> {t('practiceMode.session.stop', 'Stop Microphone')}</>
                            ) : (
                                <><Mic size={24} /> {t('practiceMode.session.start', 'Enable Microphone')}</>
                            )}
                        </button>
                    </div>

                    {/* Quick Access Tools (Horizontal Strip) - Hidden in Focus Mode */}
                    {!focusMode && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
                        <button onClick={() => openModal('warmup')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <Play size={20} className="text-orange-400" />
                            <span className="text-xs font-bold">Warm-Up</span>
                        </button>
                        <button onClick={() => setShowDAF(true)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <Mic size={20} className="text-purple-400" />
                            <span className="text-xs font-bold">DAF Loop</span>
                        </button>
                        <button onClick={() => setShowProgressiveStacking(true)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <Sparkles size={20} className="text-pink-400" />
                            <span className="text-xs font-bold">Stacking</span>
                        </button>
                        <button onClick={() => openModal('calibration')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <RefreshCw size={20} className="text-green-400" />
                            <span className="text-xs font-bold">Recalibrate</span>
                        </button>
                        <button onClick={() => setShowConversationPractice(true)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <MessageCircle size={20} className="text-violet-400" />
                            <span className="text-xs font-bold">AI Convo</span>
                        </button>
                    </div>
                    )}

                    {/* Comparison Tool (if needed) - Hidden in Focus Mode */}
                    {!focusMode && practiceTab !== 'overview' && practiceTab !== 'resonance' && (
                        <div className="mt-2">
                            <ComparisonTool />
                        </div>
                    )}
                </div>

                {/* Right Column: Dashboard & Metrics (Spans 4 cols) - Hidden in Focus Mode */}
                {!focusMode && (
                <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                    {/* Coach Panel - Actionable Feedback */}
                    <div className={`flex-1 transition-all ${coachPanelCollapsed ? 'h-auto' : ''}`}>
                        {!coachPanelCollapsed ? (
                            <CoachPanel
                                dataRef={dataRef}
                                onNavigate={(tab) => switchPracticeTab(tab)}
                                onCollapse={() => setCoachPanelCollapsed(true)}
                            />
                        ) : (
                            <button
                                onClick={() => setCoachPanelCollapsed(false)}
                                className="w-full p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2"
                            >
                                <Activity size={18} />
                                <span className="text-sm font-bold">Show Coach Panel</span>
                            </button>
                        )}
                    </div>

                    {/* Context-Specific Tools - Only show if specifically needed */}
                    {practiceTab === 'pitch' && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300">
                            <PitchTargets audioEngine={audioEngineRef} />
                            <ToneGenerator compact />
                            <PitchPipe audioEngine={audioEngineRef} />
                        </div>
                    )}

                    {practiceTab === 'weight' && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300">
                            <StrainIndicator tilt={dataRef.current?.tilt} isSilent={dataRef.current?.isSilent} />
                            <VoiceQualityAnalysis
                                dataRef={dataRef}
                                colorBlindMode={settings.colorBlindMode}
                                toggleAudio={toggleAudio}
                                isAudioActive={isAudioActive}
                            />
                        </div>
                    )}

                    {practiceTab === 'vowel' && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <VowelAnalysis dataRef={dataRef} colorBlindMode={settings.colorBlindMode} />
                        </div>
                    )}

                    {/* Exercises */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
                        <ToolExercises tool={practiceTab === 'overview' ? 'all' : practiceTab} audioEngine={audioEngineRef.current} />
                    </div>
                </div>
                )}
            </div>

            {/* Bottom Row: History & Practice Cards - Hidden in Focus Mode */}
            {!focusMode && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {practiceTab === 'overview' && (
                    <>
                        {/* Progress History */}
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 h-[500px]">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-pink-500" />
                                Your Progress
                            </h3>
                            <ProgressCharts />
                        </div>

                        {/* Practice Cards */}
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 h-[500px] overflow-hidden">
                            <PracticeCardsPanel embedded={true} />
                        </div>
                    </>
                )}
            </div>
            )}

            {/* Timer Modal */}
            {showTimer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <PracticeTimer
                        onComplete={(duration) => {
                            console.log(`Timer completed: ${duration}s`);
                        }}
                        onClose={() => {
                            setShowTimer(false);
                            setTimerActive(true);
                        }}
                    />
                </div>
            )}

            {/* Session Summary Modal */}
            {sessionSummary && (
                <VocalStatsSummary
                    sessionData={sessionSummary}
                    onClose={() => setSessionSummary(null)}
                />
            )}

            {/* Warmup Modal */}
            {showWarmup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <WarmupRoutine
                        onComplete={() => setShowWarmup(false)}
                        onSkip={() => setShowWarmup(false)}
                    />
                </div>
            )}

            {/* Post-Session Assessment Modal */}
            {showSelfAssessmentModal && (
                <SelfAssessmentModal
                    sessionData={selfAssessmentSessionData}
                    onClose={() => setShowSelfAssessmentModal(false)}
                />
            )}

            {/* DAF Modal */}
            {showDAF && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative">
                        <button
                            onClick={() => setShowDAF(false)}
                            className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <DAFMode />
                    </div>
                </div>
            )}

            {/* Environment Check Modal */}
            {showEnvironmentCheck && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <EnvironmentCheck onClose={() => setShowEnvironmentCheck(false)} />
                </div>
            )}

            {/* Wellness Check Modal */}
            {showWellnessCheck && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <PracticeWellnessCheck
                        onComplete={() => setShowWellnessCheck(false)}
                        onDismiss={() => setShowWellnessCheck(false)}
                        sessionDuration={lastSessionDuration}
                    />
                </div>
            )}

            {/* Progressive Stacking Modal */}
            {showProgressiveStacking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg h-[85vh] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                        <div className="h-full overflow-y-auto p-6">
                            <ProgressiveStackingSession onClose={() => setShowProgressiveStacking(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Conversation Practice Modal */}
            {showConversationPractice && (
                <ConversationPractice onClose={() => setShowConversationPractice(false)} />
            )}
        </div>
    );
};


export default PracticeMode;
