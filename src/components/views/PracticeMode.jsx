import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Play, Square, Mic, Volume2, Activity, Settings, BarChart2, Calendar, Clock, Save, RefreshCw, ChevronRight, AlertCircle, Check, X, Mic2, Layers, BookOpen, Dumbbell, ClipboardCheck, Timer } from 'lucide-react';
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
import GenderPerceptionDashboard from '../ui/GenderPerceptionDashboard';
import PracticeCardsPanel from '../ui/PracticeCardsPanel';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';
import ResizablePanel from '../ui/ResizablePanel';
import ComparisonTool from '../ui/ComparisonTool';
import PracticeTimer from '../ui/PracticeTimer';
import InstantPlayback from '../ui/InstantPlayback';

// Embeddable Views
import TrainingView from './TrainingView';
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
import VocalStatsSummary from '../ui/VocalStatsSummary';
import WarmupRoutine from '../ui/WarmupRoutine';
import DAFMode from '../ui/DAFMode';
import EnvironmentCheck from '../ui/EnvironmentCheck';
import ToolExercises from '../ui/ToolExercises';
import VoiceSelfAssessment from '../ui/VoiceSelfAssessment';

import { CoachingEngine } from '../../utils/CoachingEngine';


const PracticeMode = ({
    dataRef,
    calibration,
    targetRange,
    goals,
    settings,
    onUpdateRange,
    onSwitchProfile
}) => {
    const {
        practiceTab,
        switchPracticeTab,
        navigate,
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
    }, []);

    useEffect(() => {
        if (practiceTab === 'spectrogram') {
            startTour('spectrogram');
        }
    }, [practiceTab, startTour]);

    const { saveSession } = useProfile();
    const [showTimer, setShowTimer] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [showWarmup, setShowWarmup] = useState(false);
    const [showDAF, setShowDAF] = useState(false);
    const [showEnvironmentCheck, setShowEnvironmentCheck] = useState(false);

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
            }
            saveCurrentSession();
        }
    }, [isAudioActive, saveCurrentSession]);

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

    // Tabs Configuration
    const TABS = [
        { id: 'overview', label: t('practiceMode.tabs.overview'), icon: Activity },
        { id: 'pitch', label: t('practiceMode.tabs.pitch'), icon: Mic2 },
        { id: 'resonance', label: t('practiceMode.tabs.resonance'), icon: Volume2 },
        { id: 'perception', label: 'Perception', icon: Layers },
        { id: 'weight', label: t('practiceMode.tabs.weight'), icon: BarChart2 },
        { id: 'vowel', label: t('practiceMode.tabs.vowel'), icon: BookOpen },
        { id: 'spectrogram', label: t('practiceMode.tabs.spectrogram'), icon: Activity },
        { id: 'training', label: t('practiceMode.tabs.training', 'Training'), icon: Dumbbell },
        { id: 'assessment', label: t('practiceMode.actions.assessment', 'Assessment'), icon: ClipboardCheck },
    ];

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

            {/* Header / Controls */}
            <div className="flex flex-col justify-between items-center mb-3 gap-3">
                <div id="practice-tabs" className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full pb-2 no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => switchPracticeTab(tab.id)}
                            className={`px-3 py-2 sm:px-4 rounded-full text-sm font-bold flex items-center gap-1 sm:gap-2 transition-all whitespace-nowrap ${practiceTab === tab.id
                                ? 'bg-gradient-to-r from-teal-500 to-violet-500 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                                }`}
                            aria-label={`Switch to ${tab.label} view`}
                            aria-current={practiceTab === tab.id ? 'page' : undefined}
                        >
                            <tab.icon size={14} aria-hidden="true" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full justify-end">
                    {/* Timer Toggle */}
                    {timerActive ? (
                        <PracticeTimer compact onClose={() => setTimerActive(false)} />
                    ) : (
                        <button
                            onClick={() => setShowTimer(true)}
                            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
                            title="Practice Timer"
                        >
                            <Timer size={18} />
                        </button>
                    )}

                    {/* Instant Playback */}
                    <InstantPlayback />

                    <button
                        id="mic-button"
                        onClick={toggleAudio}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${isAudioActive
                            ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30'
                            : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-400 hover:to-violet-400 text-white hover:shadow-xl hover:shadow-teal-500/30 animate-glow-pulse'
                            }`}
                        aria-label={isAudioActive ? "Stop Session" : "Start Session"}
                        aria-pressed={isAudioActive}
                    >
                        {isAudioActive ? (
                            <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> {t('practiceMode.session.stop')}</>
                        ) : (
                            <><Play className="w-4 h-4" /> {t('practiceMode.session.start')}</>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">
                {/* Left Column: Visualization - Takes more space */}
                <ResizablePanel
                    className="flex flex-col relative flex-shrink-0 w-full lg:w-3/5"
                    defaultHeight={400}
                    defaultWidth={null}
                    minWidth={280}
                >
                    <div id="visualization-area" className="flex flex-col h-full relative min-h-[300px] sm:min-h-[400px]">
                        <div className="h-full w-full relative z-20 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900/30 border border-white/5 shadow-2xl">
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
                                            <p className="text-xs text-slate-500 text-center max-w-sm">
                                                This quadrant shows how pitch (Y) and resonance (X) combine to influence gender perception.
                                                The purple zone marks the ambiguity range where resonance becomes the deciding factor.
                                            </p>
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
                    </div>

                    {/* Comparison Tool (hidden on overview/resonance to save space/redundancy) */}
                    {
                        practiceTab !== 'overview' && practiceTab !== 'resonance' && (
                            <div className="mt-3">
                                <ComparisonTool />
                            </div>
                        )
                    }
                </ResizablePanel>

                {/* Right Column: Dashboard & Tools */}
                <div id="dashboard-area" className="flex-1 flex flex-col min-h-[400px] lg:min-h-[600px] h-full overflow-y-auto custom-scrollbar space-y-3 min-w-0 lg:min-w-[320px] lg:w-2/5">
                    {/* Gender Perception Dashboard */}
                    <div className="min-h-[250px] sm:min-h-[300px]">
                        <GenderPerceptionDashboard dataRef={dataRef} view={practiceTab === 'overview' ? 'all' : practiceTab} />
                    </div>


                    {/* Voice Self-Assessment Tool (Overview tab) */}
                    {practiceTab === 'overview' && (
                        <>
                            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                                <VoiceSelfAssessment />
                            </div>
                            <div className="h-[500px] w-full animate-in slide-in-from-right-4 fade-in duration-300 delay-100 mt-4 rounded-xl overflow-hidden border border-white/5 bg-slate-900/50">
                                <PracticeCardsPanel embedded={true} />
                            </div>
                        </>
                    )}

                    {/* Context-Specific Tools */}
                    {
                        practiceTab === 'pitch' && (
                            <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300">
                                <PitchTargets audioEngine={audioEngineRef} />
                                <ToneGenerator compact />
                                <PitchPipe audioEngine={audioEngineRef} />
                            </div>
                        )
                    }

                    {
                        practiceTab === 'weight' && (
                            <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300">
                                <StrainIndicator tilt={dataRef.current?.tilt} isSilent={dataRef.current?.isSilent} />
                                <VoiceQualityAnalysis
                                    dataRef={dataRef}
                                    colorBlindMode={settings.colorBlindMode}
                                    toggleAudio={toggleAudio}
                                    isAudioActive={isAudioActive}
                                />
                            </div>
                        )
                    }

                    {
                        practiceTab === 'vowel' && (
                            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                                <VowelAnalysis dataRef={dataRef} colorBlindMode={settings.colorBlindMode} />
                            </div>
                        )
                    }

                    {/* Exercises */}
                    <ToolExercises tool={practiceTab === 'overview' ? 'all' : practiceTab} audioEngine={audioEngineRef.current} />
                </div>
            </div>

            {/* Quick Links - Full width below main content */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button onClick={() => openModal('adaptiveSession')} className="col-span-2 lg:col-span-2 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 flex flex-row items-center justify-center gap-3 text-center group border border-white/10">
                    <div className="p-2 rounded-full bg-white/20 text-white group-hover:scale-110 transition-transform">
                        <Play size={24} fill="currentColor" />
                    </div>
                    <div className="text-left">
                        <span className="block text-lg font-bold text-white">{t('practiceMode.daily.title')}</span>
                        <span className="block text-xs text-blue-50 font-medium">{t('practiceMode.daily.subtitle')}</span>
                    </div>
                </button>


                <button onClick={() => openModal('warmup')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-2 text-center group">
                    <div className="p-2 rounded-full bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <Play size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{t('practiceMode.actions.warmup')}</span>
                </button>
                <button onClick={() => openModal('calibration')} className="col-span-2 lg:col-span-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex flex-row items-center justify-center gap-3 text-center group">
                    <div className="p-2 rounded-full bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <RefreshCw size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{t('practiceMode.actions.calibrate')}</span>
                </button>

                <button onClick={() => setShowDAF(true)} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-2 text-center group">
                    <div className="p-2 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <Mic size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">DAF Loop</span>
                </button>

                <button onClick={() => setShowEnvironmentCheck(true)} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-2 text-center group">
                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Volume2 size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Noise Check</span>
                </button>
            </div>

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
        </div>
    );
};


export default PracticeMode;
