import React, { useState, useRef, useEffect } from 'react';
import { ClipboardCheck, Mic, X } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const RAINBOW_PASSAGE = `When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.`;

const AssessmentModule = ({ onClose }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const [isRecording, setIsRecording] = useState(false);
    const [results, setResults] = useState(null);
    const recordingDataRef = useRef([]);

    useEffect(() => {
        if (isRecording && isAudioActive) {
            const interval = setInterval(() => {
                const pitch = dataRef.current.pitch;
                if (pitch > 0) {
                    recordingDataRef.current.push(pitch);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isRecording, isAudioActive, dataRef]);

    const handleStartRecording = async () => {
        recordingDataRef.current = [];
        setResults(null);
        setIsRecording(true);
        if (!isAudioActive) {
            await toggleAudio();
        }
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        if (isAudioActive) {
            toggleAudio();
        }

        // Calculate Results
        const pitches = recordingDataRef.current;
        if (pitches.length > 0) {
            const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
            const minPitch = Math.min(...pitches);
            const maxPitch = Math.max(...pitches);
            const range = maxPitch - minPitch;

            setResults({
                avgPitch: Math.round(avgPitch),
                minPitch: Math.round(minPitch),
                maxPitch: Math.round(maxPitch),
                range: Math.round(range),
                date: new Date().toISOString()
            });

            // Save to localStorage
            const assessments = JSON.parse(localStorage.getItem('assessments') || '[]');
            assessments.push({
                avgPitch: Math.round(avgPitch),
                minPitch: Math.round(minPitch),
                maxPitch: Math.round(maxPitch),
                range: Math.round(range),
                date: new Date().toISOString()
            });
            localStorage.setItem('assessments', JSON.stringify(assessments));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mt-20 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                            <ClipboardCheck className="text-blue-400" /> Baseline Assessment
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 mb-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">The Rainbow Passage</h3>
                        <p className="text-slate-200 leading-relaxed text-lg font-serif">
                            {RAINBOW_PASSAGE}
                        </p>
                    </div>

                    {!results ? (
                        <div className="text-center space-y-4">
                            <p className="text-slate-300 text-sm">
                                Read the passage above out loud at a comfortable pace. We&apos;ll analyze your average pitch and range.
                            </p>
                            {!isRecording ? (
                                <button
                                    onClick={handleStartRecording}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 transform active:scale-95"
                                >
                                    <Mic className="w-5 h-5 inline mr-2" /> Start Recording
                                </button>
                            ) : (
                                <button
                                    onClick={handleStopRecording}
                                    className="px-8 py-4 bg-red-500/20 text-red-400 border border-red-500/50 font-bold rounded-xl transition-all animate-pulse"
                                >
                                    <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-2 animate-ping"></span> Stop Recording
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white text-center mb-4">Your Results</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 text-center">
                                    <div className="text-3xl font-bold text-blue-400">{results.avgPitch} Hz</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Average Pitch</div>
                                </div>
                                <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 text-center">
                                    <div className="text-3xl font-bold text-purple-400">{results.range} Hz</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Pitch Range</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-2xl font-mono text-slate-300">{results.minPitch} Hz</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Lowest</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-2xl font-mono text-slate-300">{results.maxPitch} Hz</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Highest</div>
                                </div>
                            </div>
                            <div className="text-center mt-6 space-x-4">
                                <button
                                    onClick={() => { setResults(null); recordingDataRef.current = []; }}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentModule;
