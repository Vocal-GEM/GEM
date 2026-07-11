import React, { useState } from 'react';
import AudioWaveform from '../ui/AudioWaveform';
import { Upload, Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';
import AudioSourceManager from './AudioSourceManager';

const SpectrogramComparison = () => {
    const [audioFile1, setAudioFile1] = useState(null);
    const [audioUrl1, setAudioUrl1] = useState(null);
    const [audioFile2, setAudioFile2] = useState(null);
    const [audioUrl2, setAudioUrl2] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [deviceId, setDeviceId] = useState('');

    const handleFileUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (index === 1) {
                setAudioFile1(file);
                setAudioUrl1(url);
            } else {
                setAudioFile2(file);
                setAudioUrl2(url);
            }
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen text-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                    Signal Comparison
                </h1>
                <div className="flex items-center gap-2">
                    <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700" onClick={() => setZoomLevel(z => Math.max(1, z - 0.5))}><ZoomOut size={20} /></button>
                    <span className="text-sm font-mono text-slate-400">{zoomLevel}x</span>
                    <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700" onClick={() => setZoomLevel(z => Math.min(5, z + 0.5))}><ZoomIn size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Configuration */}
                <div className="space-y-6">
                    <AudioSourceManager onSourceChange={setDeviceId} />

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h3 className="font-semibold mb-4 text-slate-200">Recording A (Reference)</h3>
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-lg hover:border-pink-500 hover:bg-slate-800/50 transition-all cursor-pointer mb-2">
                            <div className="text-center">
                                <Upload className="mx-auto text-slate-500 mb-2" />
                                <span className="text-xs text-slate-400">Upload Reference Audio</span>
                            </div>
                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 1)} />
                        </label>
                        {audioFile1 && <p className="text-xs text-green-400 text-center truncate">{audioFile1.name}</p>}
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h3 className="font-semibold mb-4 text-slate-200">Recording B (Comparison)</h3>
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-lg hover:border-pink-500 hover:bg-slate-800/50 transition-all cursor-pointer mb-2">
                            <div className="text-center">
                                <Upload className="mx-auto text-slate-500 mb-2" />
                                <span className="text-xs text-slate-400">Upload Comparison Audio</span>
                            </div>
                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 2)} />
                        </label>
                        {audioFile2 && <p className="text-xs text-blue-400 text-center truncate">{audioFile2.name}</p>}
                    </div>
                </div>

                {/* Right Panel: Visualization */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Waveform A */}
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative">
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-900/50 text-green-400 text-[10px] uppercase font-bold rounded border border-green-500/30">Reference</span>
                        {audioUrl1 ? (
                            <AudioWaveform audioUrl={audioUrl1} isPlaying={false} />
                        ) : (
                            <div className="h-32 flex items-center justify-center text-slate-600 font-mono text-xs">NO SIGNAL</div>
                        )}
                    </div>

                    {/* Waveform B */}
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative">
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-900/50 text-blue-400 text-[10px] uppercase font-bold rounded border border-blue-500/30">Comparison</span>
                        {audioUrl2 ? (
                            <AudioWaveform audioUrl={audioUrl2} isPlaying={false} />
                        ) : (
                            <div className="h-32 flex items-center justify-center text-slate-600 font-mono text-xs">NO SIGNAL</div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center pt-4">
                        <button className="flex items-center gap-2 px-8 py-3 bg-pink-600 hover:bg-pink-500 rounded-full font-bold shadow-lg shadow-pink-900/20 transition-all">
                            <Play fill="currentColor" size={20} /> Play Both
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpectrogramComparison;
