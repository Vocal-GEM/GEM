import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { X, Mic, Mic2, Volume2, VolumeX, Settings, Activity, BarChart2, BookOpen, ChevronRight, Play, Pause, RefreshCw } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import DynamicOrb from '../viz/DynamicOrb';
import ResonanceOrb from '../viz/ResonanceOrb';
import PitchVisualizer from '../viz/PitchVisualizer';
import VoiceQualityMeter from '../viz/VoiceQualityMeter';
import SpectralTiltMeter from '../viz/SpectralTiltMeter';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import ArticulationView from '../views/ArticulationView';
import ContourVisualizer from '../viz/ContourVisualizer';
import VoiceQualityView from '../views/VoiceQualityView';
import Spectrogram from '../viz/Spectrogram';
import ComparisonTool from '../ui/ComparisonTool';
import GenderPerceptionDashboard from '../ui/GenderPerceptionDashboard';
import PitchTargets from '../ui/PitchTargets';
import PitchPipe from '../ui/PitchPipe';
import VoiceQualityAnalysis from '../viz/VoiceQualityAnalysis';
import VowelAnalysis from '../viz/VowelAnalysis';
import ToolExercises from '../ui/ToolExercises';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/GlobalErrorBoundary';

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
        openModal
    } = useNavigation();

    const {
        audioEngineRef,
        isAudioActive,
        toggleAudio
    } = useAudio();

    const { saveSession } = useProfile();

    // Session Tracking
    const sessionRef = useRef({
        startTime: null,
        accumulatedPitch: 0,
        accumulatedResonance: 0,
        sampleCount: 0,
        stabilityScore: 0
    });

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
            console.log("Session saved:", { duration, avgPitch });
        } catch (e) {
            console.error("Failed to save session:", e);
        }

        // Reset
        sessionRef.current = {
            startTime: null,
            accumulatedPitch: 0,
            accumulatedResonance: 0,
            sampleCount: 0,
            stabilityScore: 0
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
                sampleCount: 0,
                stabilityScore: 0
            };
        } else {
            // Stop and save
            saveCurrentSession();
        }
    }, [isAudioActive, saveCurrentSession]);

    // Accumulate Metrics
    useEffect(() => {
        if (!isAudioActive) return;

        const interval = setInterval(() => {
            if (dataRef.current && dataRef.current.pitch > 0) {
                sessionRef.current.accumulatedPitch += dataRef.current.pitch;
                sessionRef.current.accumulatedResonance += dataRef.current.resonance;
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
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'pitch', label: 'Pitch', icon: Mic2 },
        { id: 'resonance', label: 'Resonance', icon: Volume2 },
        { id: 'weight', label: 'Weight', icon: BarChart2 },
        { id: 'vowel', label: 'Vowel', icon: BookOpen },
        { id: 'spectrogram', label: 'Spectrogram', icon: Activity },
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
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => switchPracticeTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${practiceTab === tab.id
                                ? 'bg-gradient-to-r from-teal-500 to-violet-500 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                                }`}
                            aria-label={`Switch to ${tab.label} view`}
                            aria-current={practiceTab === tab.id ? 'page' : undefined}
                        >
                            <tab.icon size={14} aria-hidden="true" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleAudio}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${isAudioActive
                            ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30'
                            : 'bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-400 hover:to-violet-400 text-white hover:shadow-xl hover:shadow-teal-500/30 animate-glow-pulse'
                            }`}
                        aria-label={isAudioActive ? "Stop Microphone" : "Start Microphone"}
                        aria-pressed={isAudioActive}
                    >
                        {isAudioActive ? (
                            <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE</>
                        ) : (
                            <><Mic className="w-4 h-4" /> START MIC</>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column: Visualization */}
                <div className="flex flex-col h-[600px] relative">
                    <div className="h-full w-full relative z-20 rounded-3xl overflow-hidden bg-slate-900/30 border border-white/5 shadow-2xl">
                        <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-red-400">Visualization Error</div>}>
                            <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
                                {practiceTab === 'overview' && (
                                    <DynamicOrb
                                        dataRef={dataRef}
                                        calibration={{ ...calibration, disable3D: settings.disable3D }}
                                        audioEngine={audioEngineRef.current}
                                    />
                                )}
                                {practiceTab === 'pitch' && <PitchVisualizer dataRef={dataRef} />}
                                {practiceTab === 'resonance' && (
                                    <ResonanceOrb
                                        dataRef={dataRef}
                                        calibration={calibration}
                                        showDebug={false}
                                        colorBlindMode={settings.colorBlindMode}
                                    />
                                )}
                                {practiceTab === 'weight' && <VoiceQualityMeter dataRef={dataRef} userMode="user" showAnalysis={false} />}
                                {practiceTab === 'vowel' && <VowelSpacePlot dataRef={dataRef} showAnalysis={false} />}
                                {practiceTab === 'spectrogram' && <Spectrogram dataRef={dataRef} />}
                            </Suspense>
                        </ErrorBoundary>
                    </div>

                    {/* Comparison Tool (hidden on overview/resonance to save space/redundancy) */}
                    {practiceTab !== 'overview' && practiceTab !== 'resonance' && (
                        <div className="mt-6">
                            <ComparisonTool />
                        </div>
                    )}
                </div>

                {/* Right Column: Dashboard & Tools */}
                <div className="flex flex-col h-[600px] overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    {/* Gender Perception Dashboard */}
                    <div className="min-h-[300px]">
                        <GenderPerceptionDashboard dataRef={dataRef} view={practiceTab === 'overview' ? 'all' : practiceTab} />
                    </div>

                    {/* Context-Specific Tools */}
                    {practiceTab === 'pitch' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <PitchTargets audioEngine={audioEngineRef} />
                            <PitchPipe audioEngine={audioEngineRef} />
                        </div>
                    )}

                    {practiceTab === 'weight' && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <VoiceQualityAnalysis dataRef={dataRef} colorBlindMode={settings.colorBlindMode} />
                        </div>
                    )}

                    {practiceTab === 'vowel' && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <VowelAnalysis dataRef={dataRef} colorBlindMode={settings.colorBlindMode} />
                        </div>
                    )}

                    {/* Exercises */}
                    <ToolExercises tool={practiceTab === 'overview' ? 'all' : practiceTab} audioEngine={audioEngineRef.current} />

                    {/* Quick Links */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <button onClick={() => openModal('assessment')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-2 text-center group">
                            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Activity size={20} />
                            </div>
                            <span className="text-sm font-bold">Assessment</span>
                        </button>
                        <button onClick={() => openModal('warmup')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-2 text-center group">
                            <div className="p-2 rounded-full bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <Play size={20} />
                            </div>
                            <span className="text-sm font-bold">Warm Up</span>
                        </button>
                        <button onClick={() => openModal('calibration')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex flex-col items-center gap-2 text-center group">
                            <div className="p-2 rounded-full bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <RefreshCw size={20} />
                            </div>
                            <span className="text-sm font-bold">Recalibrate</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeMode;
