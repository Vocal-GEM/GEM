import { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import { useSettings } from '../../context/SettingsContext';
import ClientSelector from '../ui/ClientSelector';
import SessionNotes from '../ui/SessionNotes';
import HighResSpectrogram from '../viz/HighResSpectrogram';
import SpectrumAnalyzer from '../viz/SpectrumAnalyzer';
import CPPMeter from '../viz/CPPMeter';
import MPTTracker from '../viz/MPTTracker';
import VoiceRangeProfile from '../viz/VoiceRangeProfile';
import SZRatio from '../viz/SZRatio';
import IntonationTrainer from '../viz/IntonationTrainer';
import { Activity, Settings, Grid } from 'lucide-react';

const SLPDashboard = ({ dataRef, audioEngine }) => {
    const { activeClient } = useClient();
    const { showSettings, setShowSettings } = useSettings();
    const [activeTool, setActiveTool] = useState('spectrogram'); // spectrogram, vrp, mpt, sz, intonation

    // Ensure audio engine is running
    useEffect(() => {
        if (audioEngine && !audioEngine.isActive) {
            // Optional: Auto-start or show start button
        }
    }, [audioEngine]);

    return (
        <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden">
            {/* Top Bar */}
            <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Clinical Dashboard
                    </h1>
                    <div className="h-8 w-px bg-slate-800"></div>
                    <ClientSelector />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-800/50 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTool('spectrogram')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${activeTool === 'spectrogram' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Spectrogram
                        </button>
                        <button
                            onClick={() => setActiveTool('vrp')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${activeTool === 'vrp' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            VRP
                        </button>
                        <button
                            onClick={() => setActiveTool('intonation')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${activeTool === 'intonation' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Intonation
                        </button>
                    </div>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
                {/* Left Column: Primary Visualization (8 cols) */}
                <div className="col-span-8 flex flex-col gap-6 h-full overflow-hidden">
                    {/* Main Viz Panel */}
                    <div className="flex-1 glass-panel-dark rounded-2xl p-1 relative overflow-hidden flex flex-col">
                        {activeTool === 'spectrogram' && (
                            <div className="relative w-full h-full flex flex-col">
                                <div className="absolute top-4 left-4 z-10 flex gap-2">
                                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-blue-400 border border-blue-500/30">
                                        High-Res Spectrogram + LPC
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <HighResSpectrogram dataRef={dataRef} height={400} />
                                </div>
                                <div className="h-1/3 border-t border-slate-800 bg-black/20">
                                    <SpectrumAnalyzer dataRef={dataRef} height={200} showLPC={true} />
                                </div>
                            </div>
                        )}

                        {activeTool === 'vrp' && (
                            <div className="w-full h-full p-4">
                                <VoiceRangeProfile dataRef={dataRef} />
                            </div>
                        )}

                        {activeTool === 'intonation' && (
                            <div className="w-full h-full p-4">
                                <IntonationTrainer dataRef={dataRef} />
                            </div>
                        )}
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="h-48 grid grid-cols-2 gap-6 shrink-0">
                        <div className="glass-panel-dark rounded-2xl p-4">
                            <CPPMeter dataRef={dataRef} />
                        </div>
                        <div className="glass-panel-dark rounded-2xl p-4">
                            <div className="h-full flex flex-col">
                                <h3 className="text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                                    <Activity size={14} />
                                    Quick Tools
                                </h3>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                                        onClick={() => setActiveTool('mpt')}>
                                        <div className="text-blue-400 font-bold text-lg">MPT</div>
                                        <div className="text-[10px] text-slate-500">Timer</div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                                        onClick={() => setActiveTool('sz')}>
                                        <div className="text-purple-400 font-bold text-lg">S/Z</div>
                                        <div className="text-[10px] text-slate-500">Ratio</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Clinical Data (4 cols) */}
                <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    {/* Session Notes */}
                    <div className="flex-1 min-h-0">
                        <SessionNotes />
                    </div>

                    {/* Active Tool / Mini View */}
                    <div className="h-1/2 glass-panel-dark rounded-2xl p-4 overflow-hidden flex flex-col">
                        {activeTool === 'mpt' ? (
                            <MPTTracker dataRef={dataRef} />
                        ) : activeTool === 'sz' ? (
                            <SZRatio />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <Grid size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">Select a tool to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SLPDashboard;
