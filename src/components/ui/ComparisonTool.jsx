import React, { useState, useRef } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import TargetVoicePlayer from './TargetVoicePlayer';
import { useProfile } from '../../context/ProfileContext';

const ComparisonTool = () => {
    const { audioEngineRef } = useAudio();
    const { activeProfile } = useProfile();
    const [clipA, setClipA] = useState(null);
    const [clipB, setClipB] = useState(null);
    const [recordingTarget, setRecordingTarget] = useState(null); // 'A' or 'B'
    const [isRecording, setIsRecording] = useState(false);
    const [targetPhrase, setTargetPhrase] = useState("The quick brown fox jumps over the lazy dog.");

    const toggleRecording = async (target) => {
        if (!audioEngineRef.current) return;

        if (isRecording) {
            // Stop
            const url = await audioEngineRef.current.stopRecording();
            if (recordingTarget === 'A') setClipA(url);
            if (recordingTarget === 'B') setClipB(url);
            setIsRecording(false);
            setRecordingTarget(null);
        } else {
            // Start
            setRecordingTarget(target);
            audioEngineRef.current.startRecording();
            setIsRecording(true);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-6 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="text-blue-400" />
                Voice Comparison
            </h3>
            <p className="text-sm text-slate-400">Record a "Before" and "After" clip to hear your progress.</p>

            {/* Target Phrase & TTS */}
            <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5 space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 block">Target Phrase</label>
                <input
                    type="text"
                    value={targetPhrase}
                    onChange={(e) => setTargetPhrase(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
                <TargetVoicePlayer text={targetPhrase} gender={activeProfile} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Clip A */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Clip A (Before)</span>

                    {!clipA ? (
                        <button
                            onClick={() => toggleRecording('A')}
                            disabled={isRecording && recordingTarget !== 'A'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording && recordingTarget === 'A' ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'} ${isRecording && recordingTarget !== 'A' ? 'opacity-20' : ''}`}
                        >
                            {isRecording && recordingTarget === 'A' ? <div className="w-4 h-4 bg-white rounded-sm"></div> : <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2 w-full">
                            <audio src={clipA} controls className="w-full h-8" />
                            <button onClick={() => setClipA(null)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    )}
                </div>

                {/* Clip B */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Clip B (After)</span>

                    {!clipB ? (
                        <button
                            onClick={() => toggleRecording('B')}
                            disabled={isRecording && recordingTarget !== 'B'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording && recordingTarget === 'B' ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'} ${isRecording && recordingTarget !== 'B' ? 'opacity-20' : ''}`}
                        >
                            {isRecording && recordingTarget === 'B' ? <div className="w-4 h-4 bg-white rounded-sm"></div> : <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2 w-full">
                            <audio src={clipB} controls className="w-full h-8" />
                            <button onClick={() => setClipB(null)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComparisonTool;
