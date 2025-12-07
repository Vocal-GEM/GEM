import { useState } from 'react';
import { Mic, Activity, Anchor, Aperture, Maximize2, Waves, Stethoscope } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { useStats } from '../../context/StatsContext';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';

import ResonanceOrb from '../viz/ResonanceOrb';
import LiveMetricsBar from '../viz/LiveMetricsBar';
import PitchVisualizer from '../viz/PitchVisualizer';

import VoiceQualityMeter from '../viz/VoiceQualityMeter';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import CPPMeter from '../viz/CPPMeter';
import HighResSpectrogram from '../viz/HighResSpectrogram';
import VoiceRangeProfile from '../viz/VoiceRangeProfile';
import MPTTracker from '../viz/MPTTracker';

import IntonationTrainer from '../viz/IntonationTrainer';
import ResizableToolGrid, { GridTool } from '../layout/ResizableToolGrid';
import LayoutControls from '../ui/LayoutControls';
import { useLayout } from '../../context/LayoutContext';


const PracticeView = () => {
    const { t } = useTranslation();
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

    const { toggleTool, activeTools } = useLayout();

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
                        <><span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span> {t('practice.stop')}</>
                    ) : (
                        <><Mic className="w-6 h-6" /> {t('practice.start')}</>
                    )}
                </button>

                {/* Secondary Actions: Tools Drawer Toggle */}
                <button
                    onClick={() => setShowTools(!showTools)}
                    className="w-full py-3 bg-slate-800 rounded-xl text-slate-400 text-sm font-medium border border-white/5 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                    {showTools ? t('practice.tools.hide') : t('practice.tools.show')}
                    <i data-lucide={showTools ? "chevron-down" : "chevron-up"} className="w-4 h-4"></i>
                </button>
            </div>

            {/* Advanced Tools Drawer (Slide Up) */}
            {showTools && (
                <div className="animate-in slide-in-from-bottom-10 fade-in duration-300 pt-4 pb-4 bg-slate-900 rounded-t-3xl border-t border-white/10 shadow-2xl absolute bottom-0 left-0 right-0 h-[75vh] flex flex-col z-40">

                    {/* Drawer Handle */}
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0 cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => setShowTools(false)}></div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 mb-4 shrink-0 gap-4">
                        {/* Tool Toggles */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 items-center">
                            {[
                                { id: 'pitch', label: t('practice.tools.pitch.label'), icon: Activity },
                                { id: 'resonance', label: t('practice.tools.resonance.label'), icon: Activity },
                                { id: 'range', label: t('practice.tools.range.label'), icon: Maximize2 },
                                { id: 'weight', label: t('practice.tools.weight.label'), icon: Anchor },
                                { id: 'vowel', label: t('practice.tools.vowel.label'), icon: Aperture },
                                { id: 'spectrogram', label: t('practice.tools.spectrogram.label'), icon: Waves },
                                ...(userMode === 'slp' ? [
                                    { id: 'cpp', label: t('practice.tools.cpp.label'), icon: Stethoscope },
                                    { id: 'mpt', label: t('practice.tools.mpt.label'), icon: Stethoscope },
                                    { id: 'intonation', label: t('practice.tools.intonation.label'), icon: Activity }
                                ] : [])
                            ].map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => toggleTool(tool.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTools.includes(tool.id)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }`}
                                >
                                    <tool.icon className="w-3 h-3" />
                                    {tool.label}
                                </button>
                            ))}
                        </div>

                        {/* Layout Controls */}
                        <LayoutControls />
                    </div>

                    {/* Grid Content */}
                    <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                        <ResizableToolGrid className="min-h-full">
                            <GridTool toolId="pitch" title={t('practice.tools.pitch.title')}>
                                <PitchVisualizer
                                    dataRef={dataRef}
                                    targetRange={targetRange}
                                    userMode={userMode}
                                    exercise={null}
                                    onScore={() => { }}
                                    settings={settings}
                                />
                            </GridTool>

                            <GridTool toolId="resonance" title={t('practice.tools.resonance.title')}>
                                <div className="flex items-center justify-center h-full bg-slate-950">
                                    <ResonanceOrb dataRef={dataRef} calibration={calibration} size={200} />
                                </div>
                            </GridTool>

                            <GridTool toolId="weight" title={t('practice.tools.weight.title')}>
                                <VoiceQualityMeter dataRef={dataRef} userMode={userMode} />
                            </GridTool>

                            <GridTool toolId="vowel" title={t('practice.tools.vowel.title')}>
                                <VowelSpacePlot dataRef={dataRef} userMode={userMode} />
                            </GridTool>

                            <GridTool toolId="range" title={t('practice.tools.range.title')}>
                                <VoiceRangeProfile dataRef={dataRef} isActive={isAudioActive} />
                            </GridTool>

                            <GridTool toolId="spectrogram" title={t('practice.tools.spectrogram.title')}>
                                <HighResSpectrogram dataRef={dataRef} />
                            </GridTool>

                            <GridTool toolId="cpp" title={t('practice.tools.cpp.title')}>
                                <CPPMeter dataRef={dataRef} isActive={isAudioActive} />
                            </GridTool>

                            <GridTool toolId="mpt" title={t('practice.tools.mpt.title')}>
                                <MPTTracker dataRef={dataRef} isActive={isAudioActive} />
                            </GridTool>

                            <GridTool toolId="intonation" title={t('practice.tools.intonation.title')}>
                                <IntonationTrainer dataRef={dataRef} isActive={isAudioActive} />
                            </GridTool>
                        </ResizableToolGrid>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeView;
