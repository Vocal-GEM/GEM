import React, { useState } from 'react';
import { Book, EyeOff, Mic, Wrench, Activity, Anchor, Aperture, Maximize2, Waves, LayoutGrid, Stethoscope } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { useStats } from '../../context/StatsContext';
import { useSettings } from '../../context/SettingsContext';
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
import SZRatio from '../viz/SZRatio';
import IntonationTrainer from '../viz/IntonationTrainer';


const PracticeView = () => {
    const { isAudioActive, toggleAudio, dataRef, audioEngineRef } = useAudio();
    const { calibration, targetRange } = useProfile();
    const { goals, stats } = useStats();
    const { settings } = useSettings();
    // userMode is local state in App.jsx, but passed down? No, it was in GemContext.
    // I need to decide where userMode lives. It seems to be a UI toggle.
    // For now, I'll assume it's in SettingsContext or I need to add it there.
    // Let's check SettingsContext.jsx content.
    // I'll add it to SettingsContext if it's not there, or just use a default for now.
    // Actually, I should probably add userMode to SettingsContext.
    // But for this file, I'll access it from SettingsContext assuming I'll put it there.
    const { userMode } = settings; // Assuming userMode is part of settings object now.
    const navigate = useNavigate();

    const [activeGame, setActiveGame] = useState('pitch'); // Reusing this for tab state: 'pitch' | 'resonance' | 'range' | 'spectrogram' | 'clinical'
    const [showTools, setShowTools] = useState(false);
    const [showAllTools, setShowAllTools] = useState(false); // For temporarily revealing all tools in beginner mode

    // Hero Principle: Orb takes up most space
    // Mobile Ergonomics: Controls at bottom
    return (
        <div className="h-[calc(100vh-140px)] flex flex-col relative">


            {/* Hero Section: Resonance Orb */}
            <div className="flex-1 relative flex items-center justify-center min-h-[300px]">
                {/* The Orb */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <ResonanceOrb dataRef={dataRef} calibration={calibration} size={300} showDebug={true} />
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
                <div className="animate-in slide-in-from-bottom-10 fade-in duration-300 pt-4 pb-20 bg-slate-900/90 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl absolute bottom-0 left-0 right-0 h-[60vh] flex flex-col z-40">

                    {/* Drawer Handle */}
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0" onClick={() => setShowTools(false)}></div>

                    {/* Tabs */}
                    <div className="flex gap-2 px-4 mb-4 overflow-x-auto shrink-0 pb-2 no-scrollbar">
                        {[
                            { id: 'pitch', label: 'Pitch', icon: 'Activity' },
                            { id: 'range', label: 'Range', icon: 'Maximize2' },
                            // Hide advanced tools in beginner mode unless "Show All" is clicked
                            ...((!settings.beginnerMode || showAllTools) ? [
                                { id: 'weight', label: 'Weight', icon: 'Anchor' },
                                { id: 'vowel', label: 'Vowel', icon: 'Aperture' },
                                { id: 'spectrogram', label: 'Spectrogram', icon: 'Waves' },
                                { id: 'all', label: 'Show All', icon: 'LayoutGrid' },
                                ...(userMode === 'slp' ? [{ id: 'clinical', label: 'Clinical', icon: 'Stethoscope' }] : [])
                            ] : [])
                        ].map(tab => {
                            const Icon = {
                                'Activity': Activity,
                                'Anchor': Anchor,
                                'Aperture': Aperture,
                                'Maximize2': Maximize2,
                                'Waves': Waves,
                                'LayoutGrid': LayoutGrid,
                                'Stethoscope': Stethoscope
                            }[tab.icon];

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveGame(tab.id === activeGame ? null : tab.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeGame === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }`}
                                >
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {tab.label}
                                </button>
                            );
                        })}
                        );
                        })}

                        {/* Show More Tools Button for Beginners */}
                        {settings.beginnerMode && !showAllTools && (
                            <button
                                onClick={() => setShowAllTools(true)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all whitespace-nowrap flex items-center gap-2"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                More...
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {(!activeGame || activeGame === 'pitch') && (
                            <div className="h-full min-h-[300px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
                                <PitchVisualizer
                                    dataRef={dataRef}
                                    targetRange={targetRange}
                                    userMode={userMode}
                                    exercise={null}
                                    onScore={() => { }}
                                    settings={settings}
                                />
                            </div>
                        )}

                        {activeGame === 'weight' && (
                            <div className="space-y-4">
                                <VoiceQualityMeter dataRef={dataRef} userMode={userMode} />
                                <div className="p-4 bg-slate-800/50 rounded-xl text-sm text-slate-400">
                                    <p>Visualizes vocal weight (spectral tilt/closed quotient). Aim for the target zone.</p>
                                </div>
                            </div>
                        )}

                        {activeGame === 'vowel' && (
                            <div className="space-y-4">
                                <div className="h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden p-4 relative">
                                    <h3 className="text-sm font-bold text-slate-400 mb-2 absolute top-4 left-4">Vowel Space</h3>
                                    <VowelSpacePlot dataRef={dataRef} userMode={userMode} />
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl text-sm text-slate-400">
                                    <p>Real-time formant tracking (F1 vs F2). Helps with vowel clarity and resonance.</p>
                                </div>
                            </div>
                        )}

                        {activeGame === 'range' && (
                            <div className="space-y-4">
                                <VoiceRangeProfile dataRef={dataRef} isActive={isAudioActive} />
                                <div className="p-4 bg-slate-800/50 rounded-xl text-sm text-slate-400">
                                    <p>Explore your full vocal range. Try sliding from your lowest note to your highest note, and from quiet to loud.</p>
                                </div>
                            </div>
                        )}

                        {activeGame === 'spectrogram' && (
                            <div className="space-y-4">
                                <HighResSpectrogram dataRef={dataRef} />
                                <div className="p-4 bg-slate-800/50 rounded-xl text-sm text-slate-400">
                                    <p>Visualizing frequency content up to 8kHz. Brighter colors indicate more energy.</p>
                                </div>
                            </div>
                        )}

                        {activeGame === 'all' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <VoiceQualityMeter dataRef={dataRef} userMode={userMode} />
                                    <VowelSpacePlot dataRef={dataRef} userMode={userMode} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-48 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
                                        <ResonanceOrb dataRef={dataRef} calibration={calibration} size={100} />
                                    </div>
                                    <div className="h-48">
                                        <HighResSpectrogram dataRef={dataRef} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeGame === 'clinical' && userMode === 'slp' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <SpectrumAnalyzer dataRef={dataRef} userMode={userMode} />
                                    <CPPMeter dataRef={dataRef} isActive={isAudioActive} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <MPTTracker dataRef={dataRef} isActive={isAudioActive} />
                                    <SZRatio dataRef={dataRef} isActive={isAudioActive} />
                                </div>
                                <IntonationTrainer dataRef={dataRef} isActive={isAudioActive} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeView;
