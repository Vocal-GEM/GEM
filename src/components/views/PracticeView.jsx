import React, { useState } from 'react';
import { Book, EyeOff, Mic, Wrench } from 'lucide-react';
import { useGem } from '../../context/GemContext';
import { useNavigate } from 'react-router-dom';
import ResonanceOrb from '../viz/ResonanceOrb';
import LiveMetricsBar from '../viz/LiveMetricsBar';
import PitchVisualizer from '../viz/PitchVisualizer';
import Spectrogram from '../viz/Spectrogram';
import VoiceQualityMeter from '../viz/VoiceQualityMeter';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import CPPMeter from '../viz/CPPMeter';
import HighResSpectrogram from '../viz/HighResSpectrogram';
import SpectrumAnalyzer from '../viz/SpectrumAnalyzer';
import VoiceRangeProfile from '../viz/VoiceRangeProfile';
import MPTTracker from '../viz/MPTTracker';
import DailyGoalsWidget from '../ui/DailyGoalsWidget';

const PracticeView = () => {
    const {
        isAudioActive, toggleAudio,
        dataRef, calibration, targetRange, userMode,
        goals, stats, settings,
        audioEngineRef
    } = useGem();
    const navigate = useNavigate();

    const [activeGame, setActiveGame] = useState(null);
    const [showTools, setShowTools] = useState(false);

    // Hero Principle: Orb takes up most space
    // Mobile Ergonomics: Controls at bottom
    return (
        <div className="h-[calc(100vh-140px)] flex flex-col relative">
            {/* Top Section: Goals & Incognito */}
            <div className="shrink-0 mb-4 flex justify-between items-start">
                <div className="flex-1 mr-4">
                    <DailyGoalsWidget goals={goals} compact={true} />
                </div>
                <button
                    onClick={() => useGem().setIncognito(true)}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    title="Incognito Mode"
                >
                    <EyeOff className="w-5 h-5" />
                </button>
            </div>

            {/* Hero Section: Resonance Orb */}
            <div className="flex-1 relative flex items-center justify-center min-h-[300px]">
                {/* The Orb */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <ResonanceOrb dataRef={dataRef} calibration={calibration} size={300} />
                </div>

                {/* Metrics Overlay (Glassmorphism) */}
                <div className="absolute top-4 inset-x-4 z-20">
                    <LiveMetricsBar dataRef={dataRef} />
                </div>
            </div>

            {/* Bottom Controls (Thumb Zone) */}
            <div className="shrink-0 mt-4 space-y-4 z-30">
                {/* Primary Action: Toggle Mic */}
                <button
                    onClick={toggleAudio}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${isAudioActive
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-white/10'
                        }`}
                >
                    {isAudioActive ? (
                        <><span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span> STOP LISTENING</>
                    ) : (
                        <><Mic className="w-6 h-6" /> START PRACTICE</>
                    )}
                </button>

                {/* Secondary Actions: Tools Drawer Toggle */}
                <button
                    onClick={() => setShowTools(!showTools)}
                    className="w-full py-3 bg-slate-800/50 backdrop-blur-md rounded-xl text-slate-400 text-sm font-medium border border-white/5 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                    {showTools ? 'Hide Advanced Tools' : 'Show Advanced Tools'}
                    <i data-lucide={showTools ? "chevron-down" : "chevron-up"} className="w-4 h-4"></i>
                </button>
            </div>

            {/* Advanced Tools Drawer (Slide Up) */}
            {showTools && (
                <div className="animate-in slide-in-from-bottom-10 fade-in duration-300 pt-4 space-y-4 pb-20">
                    <PitchVisualizer
                        dataRef={dataRef}
                        targetRange={targetRange}
                        userMode={userMode}
                        exercise={activeGame}
                        onScore={(score) => { }}
                        settings={settings}
                    />

                    {userMode === 'slp' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <HighResSpectrogram dataRef={dataRef} />
                            <div className="grid grid-cols-2 gap-4">
                                <SpectrumAnalyzer dataRef={dataRef} userMode={userMode} />
                                <CPPMeter dataRef={dataRef} isActive={isAudioActive} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <VoiceRangeProfile dataRef={dataRef} isActive={isAudioActive} />
                                <MPTTracker dataRef={dataRef} isActive={isAudioActive} />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <VoiceQualityMeter dataRef={dataRef} userMode={userMode} />
                        <VowelSpacePlot dataRef={dataRef} userMode={userMode} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/journal')} className="p-4 bg-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors">
                            <Book className="text-blue-400" />
                            <span className="text-xs font-bold">Log Journal</span>
                        </button>
                        <button onClick={() => navigate('/tools')} className="p-4 bg-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors">
                            <Wrench className="text-purple-400" />
                            <span className="text-xs font-bold">Tools</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeView;
