
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Volume2, Target } from 'lucide-react';
import { BiofeedbackService } from '../../services/BiofeedbackService';

const PitchMatchingModule = ({ audioEngine }) => {
    const [targetNote, setTargetNote] = useState({ note: 'A3', freq: 220 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    // const [status, setStatus] = useState('idle'); // idle, listening, success
    const [feedback, setFeedback] = useState({ text: 'Ready', color: 'text-slate-400' });

    // Notes for selection
    const notes = [
        { note: 'G3', freq: 196.00 },
        { note: 'A3', freq: 220.00 },
        { note: 'B3', freq: 246.94 },
        { note: 'C4', freq: 261.63 },
        { note: 'D4', freq: 293.66 },
        { note: 'E4', freq: 329.63 },
        { note: 'F4', freq: 349.23 },
        { note: 'G4', freq: 392.00 }
    ];

    const canvasRef = useRef(null);
    const requestRef = useRef(null);

    const playTargetTone = () => {
        if (!audioEngine?.audioContext) return;

        const ctx = audioEngine.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(targetNote.freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2);
    };

    const togglePractice = () => {
        if (isPlaying) {
            setIsPlaying(false);
            // setStatus('idle');
            setFeedback({ text: 'Stopped', color: 'text-slate-400' });
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        } else {
            setIsPlaying(true);
            playTargetTone(); // Play cue
            // setStatus('listening');
            setScore(0);
            animate();
        }
    };

    const animate = useCallback(() => {
        if (!audioEngine || !canvasRef.current) return;

        const data = audioEngine.getAnalysisData(); // Should return { pitch, volume, ... }
        // Fallback if getAnalysisData not available or different signature
        const pitch = data?.pitch || audioEngine.dataRef?.current?.pitch || 0;
        const volume = data?.volume || audioEngine.dataRef?.current?.volume || -100;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw Target Line (Center)
        ctx.beginPath();
        ctx.strokeStyle = '#475569'; // Slate-600
        ctx.lineWidth = 2;
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        if (volume > -50 && pitch > 50) {
            // Calculate Score
            const result = BiofeedbackService.calculatePitchScore(pitch, targetNote.freq, 0.5);

            // Update Feedback Text
            if (result.score >= 90) {
                setFeedback({ text: 'Perfect Match!', color: 'text-emerald-400' });
                setScore(s => Math.min(1000, s + 2));
                setStreak(s => s + 1);
            } else if (result.score >= 50) {
                setFeedback({ text: result.status === 'high' ? 'Too High' : 'Too Low', color: 'text-yellow-400' });
                setScore(s => Math.min(1000, s + 0.5));
                setStreak(0); // Reset streak on near miss? Maybe keep it loose
            } else {
                setFeedback({ text: result.status === 'high' ? 'Way Too High' : 'Way Too Low', color: 'text-red-400' });
                setStreak(0);
            }

            // Draw User Cursor
            // Map diff semitones to x-axis (-2 to +2 semitones range)
            const semitoneDiff = 12 * Math.log2(pitch / targetNote.freq);
            const x = (width / 2) + (semitoneDiff * (width / 4)); // 2 semitones = half width from center

            ctx.beginPath();
            ctx.fillStyle = result.score >= 90 ? '#10b981' : result.score >= 50 ? '#facc15' : '#f87171';
            ctx.arc(x, height / 2, 10, 0, Math.PI * 2);
            ctx.fill();

            // Connecting line
            ctx.beginPath();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 2;
            ctx.moveTo(width / 2, height / 2);
            ctx.lineTo(x, height / 2);
            ctx.stroke();
        } else {
            setFeedback({ text: 'Listening...', color: 'text-slate-400' });
        }

        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [audioEngine, targetNote, isPlaying]);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Re-trigger animation loop if playing (needed if React re-renders and breaks loop)
    useEffect(() => {
        if (isPlaying && !requestRef.current) {
            animate();
        }
    }, [isPlaying, targetNote, animate]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="text-blue-400" /> Pitch Matching
                    </h3>
                    <p className="text-sm text-slate-400">Match the target frequency to score points.</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-emerald-400">{score}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Score</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Target Note</label>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        {notes.map(n => (
                            <button
                                key={n.note}
                                onClick={() => {
                                    setTargetNote(n);
                                    if (isPlaying) playTargetTone();
                                }}
                                className={`p-2 rounded-lg text-sm font-bold transition-all ${targetNote.note === n.note ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {n.note} <span className="text-[10px] opacity-70 font-normal">{n.freq} Hz</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-3 flex flex-col bg-slate-900 rounded-xl border border-slate-800 p-4 relative">
                    <div className="absolute top-4 left-4 z-10">
                        <div className={`text-lg font-bold ${feedback.color} transition-colors duration-300`}>
                            {feedback.text}
                        </div>
                        {streak > 10 && (
                            <div className="text-xs font-bold text-purple-400 animate-pulse mt-1">
                                🔥 {streak} Streak!
                            </div>
                        )}
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={300}
                        className="w-full h-64 bg-slate-900/50 rounded-lg mb-4"
                    />

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={playTargetTone}
                            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-blue-400 border border-slate-700 transition-colors"
                            title="Hear Tone"
                        >
                            <Volume2 size={24} />
                        </button>
                        <button
                            onClick={togglePractice}
                            className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/20' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20'}`}
                        >
                            {isPlaying ? (
                                <>Stop Practice</>
                            ) : (
                                <><Play size={20} fill="currentColor" /> Start Practice</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PitchMatchingModule;
