import { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Mic, Square, Headphones, Ear, MessageSquare, Repeat, Clock, CheckCircle } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const STEPS = [
    { id: 'passive', title: 'Passive Listening', icon: <Headphones size={20} />, instruction: 'Listen while doing something else. Just let it wash over you.' },
    { id: 'active', title: 'Active Listening', icon: <Ear size={20} />, instruction: 'Close your eyes. Listen to ONLY the clip. 1 minute.' },
    { id: 'along', title: 'Speak Along', icon: <MessageSquare size={20} />, instruction: 'Speak WITH the clip. Match the timing exactly.' },
    { id: 'after', title: 'Speak After', icon: <Repeat size={20} />, instruction: 'Listen, then speak. Fill the silence with your imitation.' },
    { id: 'record', title: 'Record & Compare', icon: <Mic size={20} />, instruction: 'Record yourself and listen back-to-back.' }
];

const TranscriptionPractice = ({ onComplete }) => {
    const { audioEngineRef } = useAudio();
    const [file, setFile] = useState(null);
    const [audioSrc, setAudioSrc] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    // Playback state
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingUrl, setRecordingUrl] = useState(null);

    // Timer for Active Listening
    const [timerActive, setTimerActive] = useState(false);
    const [timer, setTimer] = useState(60);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setAudioSrc(URL.createObjectURL(file));
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleRecording = async () => {
        if (!audioEngineRef.current) return;

        if (isRecording) {
            const url = await audioEngineRef.current.stopRecording();
            setRecordingUrl(url);
            setIsRecording(false);
        } else {
            setRecordingUrl(null);
            audioEngineRef.current.startRecording();
            setIsRecording(true);
        }
    };

    const playComparison = () => {
        // Play reference, then recording
        if (audioRef.current && recordingUrl) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();

            audioRef.current.onended = () => {
                const recAudio = new Audio(recordingUrl);
                recAudio.play();
                audioRef.current.onended = null; // reset
            };
        }
    };

    // Timer logic
    useEffect(() => {
        let interval;
        if (timerActive && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="space-y-6">
            {!audioSrc ? (
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-900/50 hover:bg-slate-900 transition-colors">
                    <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="text-pink-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Upload Reference Clip</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Upload a short (5-10s) clip of a voice you want to imitate.
                        We&apos;ll loop this for your practice.
                    </p>
                    <label className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl cursor-pointer transition-all inline-block">
                        Choose Audio File
                        <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Player & Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                            <h4 className="font-bold text-slate-300 mb-4 truncate">{file.name}</h4>

                            <audio
                                ref={audioRef}
                                src={audioSrc}
                                loop
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                className="hidden"
                            />

                            <div className="flex justify-center gap-4 mb-4">
                                <button
                                    onClick={togglePlay}
                                    className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Looping Enabled</p>
                        </div>

                        <button
                            onClick={() => { setAudioSrc(null); setFile(null); }}
                            className="w-full py-2 text-slate-500 hover:text-white text-sm"
                        >
                            Change Clip
                        </button>
                    </div>

                    {/* Right: Steps */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm">{currentStep + 1}</span>
                                {STEPS[currentStep].title}
                            </h3>

                            <p className="text-lg text-slate-300 mb-8 font-serif italic">&quot;{STEPS[currentStep].instruction}&quot;</p>

                            {/* Step Specific Tools */}
                            {STEPS[currentStep].id === 'active' && (
                                <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-pink-400" />
                                        <span className="font-mono text-2xl text-white">{formatTime(timer)}</span>
                                    </div>
                                    <button
                                        onClick={() => setTimerActive(!timerActive)}
                                        className="text-sm font-bold text-pink-400 hover:text-pink-300"
                                    >
                                        {timerActive ? 'Pause' : 'Start Timer'}
                                    </button>
                                </div>
                            )}

                            {STEPS[currentStep].id === 'record' && (
                                <div className="space-y-4 mb-4">
                                    <button
                                        onClick={toggleRecording}
                                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-white hover:bg-slate-600'
                                            }`}
                                    >
                                        {isRecording ? <><Square size={20} /> Stop Recording</> : <><Mic size={20} /> Record Imitation</>}
                                    </button>

                                    {recordingUrl && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={playComparison}
                                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                                            >
                                                <Play size={16} /> Play Comparison
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between pt-6 border-t border-slate-700/50">
                                <button
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0}
                                    className="text-slate-500 disabled:opacity-30 hover:text-white"
                                >
                                    Previous Step
                                </button>
                                {currentStep < STEPS.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                        className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold flex items-center gap-2"
                                    >
                                        Next Step <CheckCircle size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onComplete?.()}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2"
                                    >
                                        Complete Session <CheckCircle size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptionPractice;
