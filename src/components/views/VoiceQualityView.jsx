import React, { useState, useEffect, useRef } from 'react';
import { Mic, Upload, Play, Square, Activity, FileText, BarChart2, Info } from 'lucide-react';
import { io } from 'socket.io-client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const VoiceQualityView = () => {
    const [activeTab, setActiveTab] = useState('recorded'); // 'recorded' or 'live'
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [goal, setGoal] = useState('transfem_soft_slightly_breathy');
    const [includeTranscript, setIncludeTranscript] = useState(true);

    // Live Analysis State
    const [isLive, setIsLive] = useState(false);
    const [liveMetrics, setLiveMetrics] = useState(null);
    const [liveLabel, setLiveLabel] = useState('');
    const socketRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const streamRef = useRef(null);

    // --- Recorded Analysis ---

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('audio', file);
        formData.append('goal', goal);
        formData.append('include_transcript', includeTranscript);

        try {
            // Assuming backend is on same host/port or proxied. 
            // If dev, might need localhost:5000. 
            // Using relative path assuming proxy or same origin.
            const response = await fetch('http://localhost:5000/api/voice-quality/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Analysis failed');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- Live Analysis ---

    const startLiveAnalysis = async () => {
        try {
            setError(null);
            socketRef.current = io('http://localhost:5000');

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
            });

            socketRef.current.on('analysis_update', (data) => {
                setLiveMetrics(data);
                setLiveLabel(data.label);
            });

            socketRef.current.on('analysis_error', (data) => {
                console.error('Socket error:', data);
                setError(data.error);
            });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

            // Load AudioWorklet
            try {
                await audioContextRef.current.audioWorklet.addModule(new URL('../../audio/voice-quality-processor.js', import.meta.url));
            } catch (e) {
                console.error("Failed to load AudioWorklet:", e);
                throw new Error("AudioWorklet support is required.");
            }

            const source = audioContextRef.current.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(audioContextRef.current, 'voice-quality-processor');

            // Configure the worklet
            workletNode.port.postMessage({
                type: 'config',
                sampleRate: audioContextRef.current.sampleRate,
                targetSamples: Math.round(audioContextRef.current.sampleRate * 0.25)
            });

            workletNode.port.onmessage = (e) => {
                if (e.data.type === 'chunk') {
                    if (socketRef.current && socketRef.current.connected) {
                        socketRef.current.emit('audio_chunk', {
                            pcm: e.data.pcm,
                            sr: e.data.sr
                        });
                    }
                }
            };

            source.connect(workletNode);
            workletNode.connect(audioContextRef.current.destination);

            processorRef.current = workletNode;

            setIsLive(true);
        } catch (err) {
            console.error(err);
            setError('Failed to start live analysis: ' + err.message);
        }
    };

    const stopLiveAnalysis = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        setIsLive(false);
        setLiveMetrics(null);
        setLiveLabel('');
    };

    useEffect(() => {
        return () => {
            stopLiveAnalysis();
        };
    }, []);

    // --- Rendering Helpers ---

    const renderGoalStatus = (goals) => {
        if (!goals) return null;
        return (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/10">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" />
                    Goal Comparison: <span className="text-teal-400">{goals.goal_label}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['breathiness', 'roughness', 'strain'].map(metric => (
                        <div key={metric} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="text-xs uppercase text-slate-400 mb-1">{metric}</div>
                            <div className={`font-bold ${goals[`${metric}_flag`] === 'within_target' ? 'text-green-400' :
                                goals[`${metric}_flag`] === 'unknown' ? 'text-slate-400' : 'text-yellow-400'
                                }`}>
                                {goals[`${metric}_flag`]?.replace('_', ' ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTranscript = (transcript) => {
        if (!transcript || !transcript.words) return null;

        const getColor = (label) => {
            switch (label) {
                case 'breathy': return 'bg-pink-500/20 text-pink-200 border-pink-500/30';
                case 'pressed': return 'bg-red-500/20 text-red-200 border-red-500/30';
                case 'rough': return 'bg-orange-500/20 text-orange-200 border-orange-500/30';
                case 'modal': return 'bg-green-500/20 text-green-200 border-green-500/30';
                default: return 'bg-slate-700/30 text-slate-400 border-transparent';
            }
        };

        return (
            <div className="mt-6 p-6 bg-slate-800/50 rounded-xl border border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Voice Quality Transcript
                </h3>
                <div className="flex flex-wrap gap-2 leading-relaxed">
                    {transcript.words.map((word, idx) => (
                        <div
                            key={idx}
                            className={`px-2 py-1 rounded border text-sm transition-all cursor-help relative group ${getColor(word.label)}`}
                        >
                            {word.text}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 rounded-lg border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-xl">
                                <div className="font-bold mb-1 capitalize">{word.label}</div>
                                <div>Breathiness: {word.breathiness_score}</div>
                                <div>Strain: {word.strain_score}</div>
                                <div>Roughness: {word.roughness_score}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderLiveBars = () => {
        if (!liveMetrics) return <div className="text-slate-400 italic">Waiting for audio...</div>;

        const { breathiness_score, strain_score, roughness_score, label } = liveMetrics;

        const renderBar = (label, value, colorClass) => (
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span>{value}</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${colorClass}`}
                        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                    />
                </div>
            </div>
        );

        return (
            <div className="mt-6 p-6 bg-slate-800/50 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl">Current Quality: <span className="capitalize text-teal-400">{label}</span></h3>
                    <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold animate-pulse">LIVE</div>
                </div>

                {renderBar('Breathiness', breathiness_score, breathiness_score > 75 ? 'bg-pink-500' : breathiness_score > 40 ? 'bg-green-500' : 'bg-slate-500')}
                {renderBar('Strain', strain_score, strain_score > 60 ? 'bg-red-500' : 'bg-green-500')}
                {renderBar('Roughness', roughness_score, roughness_score > 50 ? 'bg-orange-500' : 'bg-green-500')}

                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300">
                    <Info className="w-4 h-4 inline mr-2 text-teal-400" />
                    {label === 'breathy' && "Your voice is breathy. Ensure it's supported and not whispery."}
                    {label === 'pressed' && "High strain detected. Try to relax your throat and use less effort."}
                    {label === 'rough' && "Roughness detected. Try to smooth out the airflow."}
                    {label === 'modal' && "Good, clear tone detected."}
                    {label === 'silence' && "Listening..."}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-purple-500">
                    Voice Quality Analysis
                </h2>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('recorded')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'recorded' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Recorded
                    </button>
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Live
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {activeTab === 'recorded' ? (
                <div className="space-y-6">
                    <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Target Goal</label>
                                <select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="w-full p-3 bg-slate-900 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    <option value="transfem_soft_slightly_breathy">Transfeminine (Soft, Slightly Breathy)</option>
                                    <option value="clean_smooth">Clean & Smooth</option>
                                    <option value="light_and_bright">Light & Bright</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Upload Recording</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full p-3 bg-slate-900 border border-white/10 rounded-lg text-slate-300 flex items-center gap-2 hover:bg-slate-900/80 transition-colors">
                                        <Upload className="w-4 h-4" />
                                        <span className="truncate">{file ? file.name : "Choose WAV file..."}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeTranscript}
                                    onChange={(e) => setIncludeTranscript(e.target.checked)}
                                    className="rounded bg-slate-900 border-white/10 text-teal-500 focus:ring-teal-500"
                                />
                                Include Transcript Analysis
                            </label>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || isAnalyzing}
                            className="mt-6 w-full py-3 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <><Activity className="w-5 h-5 animate-spin" /> Analyzing...</>
                            ) : (
                                <><BarChart2 className="w-5 h-5" /> Analyze Recording</>
                            )}
                        </button>
                    </div>

                    {results && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {renderGoalStatus(results.goals)}

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/10 text-center">
                                    <div className="text-sm text-slate-400 uppercase">Breathiness</div>
                                    <div className="text-2xl font-bold text-white mt-1">{results.summary.breathiness_score}</div>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/10 text-center">
                                    <div className="text-sm text-slate-400 uppercase">Roughness</div>
                                    <div className="text-2xl font-bold text-white mt-1">{results.summary.roughness_score}</div>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/10 text-center">
                                    <div className="text-sm text-slate-400 uppercase">Strain</div>
                                    <div className="text-2xl font-bold text-white mt-1">{results.summary.strain_score}</div>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/10 text-center">
                                    <div className="text-sm text-slate-400 uppercase">Overall</div>
                                    <div className="text-lg font-bold text-teal-400 mt-1">{results.summary.overall_label}</div>
                                </div>
                            </div>

                            {renderTranscript(results.transcript)}

                            {/* Charts could go here using results.timeline */}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-8 bg-slate-800/50 rounded-xl border border-white/10 text-center">
                        {!isLive ? (
                            <button
                                onClick={startLiveAnalysis}
                                className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full shadow-lg shadow-red-500/20 transition-all flex items-center gap-3 mx-auto text-lg"
                            >
                                <Mic className="w-6 h-6" /> Start Live Analysis
                            </button>
                        ) : (
                            <button
                                onClick={stopLiveAnalysis}
                                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full transition-all flex items-center gap-3 mx-auto text-lg"
                            >
                                <Square className="w-6 h-6 fill-current" /> Stop Analysis
                            </button>
                        )}
                        <p className="mt-4 text-slate-400 text-sm">
                            Microphone audio will be analyzed in real-time for breathiness, strain, and roughness.
                        </p>
                    </div>

                    {isLive && renderLiveBars()}
                </div>
            )}
        </div>
    );
};

export default VoiceQualityView;
