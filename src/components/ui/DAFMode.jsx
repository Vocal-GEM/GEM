import { useState, useRef, useEffect, useCallback } from 'react';
import { Headphones, Volume2, VolumeX, Play, Square, Settings } from 'lucide-react';

/**
 * DAFMode - Delayed Auditory Feedback
 * Plays back the user's voice with a configurable delay
 * Used for fluency training and modifying speech patterns
 */
const DAFMode = ({ onClose }) => {
    const [isActive, setIsActive] = useState(false);
    const [delay, setDelay] = useState(150); // ms
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const delayNodeRef = useRef(null);
    const gainNodeRef = useRef(null);
    const sourceRef = useRef(null);

    const delayPresets = [
        { label: '50ms', value: 50, description: 'Subtle' },
        { label: '100ms', value: 100, description: 'Light' },
        { label: '150ms', value: 150, description: 'Standard' },
        { label: '200ms', value: 200, description: 'Moderate' },
        { label: '300ms', value: 300, description: 'Strong' },
        { label: '500ms', value: 500, description: 'Maximum' }
    ];

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopDAF();
        };
    }, [stopDAF]);

    // Update delay in real-time
    useEffect(() => {
        if (delayNodeRef.current && audioContextRef.current) {
            delayNodeRef.current.delayTime.setValueAtTime(
                delay / 1000,
                audioContextRef.current.currentTime
            );
        }
    }, [delay]);

    // Update volume in real-time
    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            const targetVolume = isMuted ? 0 : volume;
            gainNodeRef.current.gain.setValueAtTime(
                targetVolume,
                audioContextRef.current.currentTime
            );
        }
    }, [volume, isMuted]);

    const startDAF = async () => {
        try {
            // Get microphone stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false, // Important: disable to hear the delay properly
                    noiseSuppression: false,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            // Create audio context and nodes
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            // Create source from microphone
            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Create delay node
            const delayNode = audioContext.createDelay(1.0); // Max 1 second delay
            delayNode.delayTime.setValueAtTime(delay / 1000, audioContext.currentTime);
            delayNodeRef.current = delayNode;

            // Create gain node for volume control
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(isMuted ? 0 : volume, audioContext.currentTime);
            gainNodeRef.current = gainNode;

            // Connect: source -> delay -> gain -> destination (speakers)
            source.connect(delayNode);
            delayNode.connect(gainNode);
            gainNode.connect(audioContext.destination);

            setIsActive(true);
        } catch (err) {
            console.error('Failed to start DAF:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopDAF = useCallback(() => {
        // Stop microphone stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Disconnect and close audio context
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        delayNodeRef.current = null;
        gainNodeRef.current = null;
        setIsActive(false);
    }, []);

    return (
        <div id="daf-modal" className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                        <Headphones className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Delayed Auditory Feedback</h2>
                        <p className="text-xs text-slate-400">Hear yourself with a delay</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Info Box */}
            <div id="daf-info-box" className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-6">
                <p className="text-sm text-indigo-200">
                    <strong>How it works:</strong> DAF plays your voice back through headphones with a slight delay.
                    This can help with fluency training and modifying speech patterns.
                </p>
                <p className="text-xs text-indigo-300/70 mt-2">
                    ⚠️ Use headphones to prevent audio feedback loops
                </p>
            </div>

            {/* Delay Selector */}
            <div id="daf-delay-selector" className="mb-6">
                <label className="text-sm font-bold text-slate-300 mb-2 block">Delay Amount</label>
                <div className="grid grid-cols-3 gap-2">
                    {delayPresets.map(preset => (
                        <button
                            key={preset.value}
                            onClick={() => setDelay(preset.value)}
                            disabled={isActive}
                            className={`p-2 rounded-lg text-center transition-all ${delay === preset.value
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="text-sm font-bold">{preset.label}</div>
                            <div className="text-xs opacity-70">{preset.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Volume Control */}
            {showSettings && (
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-slate-300">Volume</label>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                        >
                            {isMuted ? (
                                <VolumeX className="w-4 h-4 text-slate-400" />
                            ) : (
                                <Volume2 className="w-4 h-4 text-slate-300" />
                            )}
                        </button>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                    />
                    <div className="text-xs text-slate-500 text-center mt-1">
                        {Math.round(volume * 100)}%
                    </div>
                </div>
            )}

            {/* Status Display */}
            {isActive && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-indigo-300 font-medium">
                            DAF Active • {delay}ms delay
                        </span>
                    </div>
                </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
                {!isActive ? (
                    <button
                        id="daf-start-button"
                        onClick={startDAF}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                    >
                        <Play className="w-5 h-5" fill="currentColor" />
                        Start DAF
                    </button>
                ) : (
                    <button
                        onClick={stopDAF}
                        className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all"
                    >
                        <Square className="w-5 h-5" fill="currentColor" />
                        Stop DAF
                    </button>
                )}
            </div>

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={() => { stopDAF(); onClose(); }}
                    className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Close
                </button>
            )}
        </div>
    );
};

export default DAFMode;
