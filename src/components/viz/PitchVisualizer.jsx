import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import { RotateCcw } from 'lucide-react';
import { frequencyToNote, getCentsDeviation } from '../../utils/musicUtils';

const PitchVisualizer = ({ dataRef, targetRange, userMode, exercise, onScore, settings }) => {
    const { voiceProfiles } = useProfile();
    const { colorBlindMode } = useSettings();
    const canvasRef = useRef(null);
    const balloonRef = useRef(new Image());
    const birdRef = useRef(new Image());
    const gameRef = useRef({ score: 0, lastUpdate: Date.now(), lastPitch: 0 });

    const [zoomRange, setZoomRange] = useState({ min: 50, max: 350 });
    const [averagePitchRange, setAveragePitchRange] = useState({ lowest: null, highest: null });

    useEffect(() => {
        balloonRef.current.src = '/assets/balloon.png';
        birdRef.current.src = '/assets/bird.png';
    }, []);

    const handleZoomIn = () => {
        setZoomRange(prev => {
            const range = prev.max - prev.min;
            if (range <= 100) return prev; // Max zoom limit
            const center = (prev.min + prev.max) / 2;
            const newRange = range * 0.8;
            return { min: center - newRange / 2, max: center + newRange / 2 };
        });
    };

    const handleZoomOut = () => {
        setZoomRange(prev => {
            const range = prev.max - prev.min;
            if (range >= 1000) return prev; // Min zoom limit
            const center = (prev.min + prev.max) / 2;
            const newRange = range * 1.25;
            return { min: Math.max(0, center - newRange / 2), max: center + newRange / 2 }; // Prevent negative freq
        });
    };

    const handleResetAverage = () => {
        setAveragePitchRange({ lowest: null, highest: null });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        if (exercise) gameRef.current = { score: 0, lastUpdate: Date.now(), lastPitch: 0 };

        // Helper to get color based on frequency
        const getPitchColor = (freq) => {
            const fem = voiceProfiles.find(p => p.id === 'fem');
            const masc = voiceProfiles.find(p => p.id === 'masc');

            // Use genderRange if available, fallback to targetRange
            const femRange = fem?.genderRange || fem?.targetRange;
            const mascRange = masc?.genderRange || masc?.targetRange;

            if (colorBlindMode) {
                if (femRange && freq >= femRange.min && freq <= femRange.max) return '#9333ea'; // Purple-600
                if (mascRange && freq >= mascRange.min && freq <= mascRange.max) return '#0d9488'; // Teal-600
                return '#f59e0b'; // Amber-500
            } else {
                if (femRange && freq >= femRange.min && freq <= femRange.max) return '#ec4899'; // Pink-500
                if (mascRange && freq >= mascRange.min && freq <= mascRange.max) return '#3b82f6'; // Blue-500
                return '#22c55e'; // Green-500 (Default)
            }
        };

        const loop = () => {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;
            ctx.clearRect(0, 0, width, height);

            const yMin = zoomRange.min;
            const yMax = zoomRange.max;
            const mapY = (freq) => height - ((freq - yMin) / (yMax - yMin)) * height;

            // Draw Grid & Axis
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.lineWidth = 1;

            // Draw horizontal grid lines every 50Hz
            for (let f = Math.ceil(yMin / 50) * 50; f < yMax; f += 50) {
                const y = mapY(f);
                ctx.beginPath();
                ctx.moveTo(30, y); // Start after axis labels
                ctx.lineTo(width, y);
                ctx.stroke();
                ctx.fillText(`${f}`, 25, y + 3);
            }

            // Draw Axis Line
            ctx.beginPath();
            ctx.moveTo(30, 0);
            ctx.lineTo(30, height);
            ctx.stroke();

            if (targetRange && !exercise) {
                const topY = mapY(targetRange.max);
                const botY = mapY(targetRange.min);
                const h = Math.abs(botY - topY);

                // Only draw if visible
                if (topY < height && botY > 0) {
                    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
                    ctx.fillRect(30, topY, width - 30, h);

                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
                    ctx.setLineDash([5, 5]);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(30, topY);
                    ctx.lineTo(width, topY);
                    ctx.moveTo(30, botY);
                    ctx.lineTo(width, botY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                // Draw Home Note Anchor
                if (settings?.homeNote && settings.homeNote > yMin && settings.homeNote < yMax) {
                    const homeY = mapY(settings.homeNote);
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([10, 5]);
                    ctx.beginPath();
                    ctx.moveTo(30, homeY);
                    ctx.lineTo(width, homeY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText(`Home: ${Math.round(settings.homeNote)} Hz`, 35, homeY - 5);
                }
            }

            if (exercise) {
                const now = Date.now();
                // Draw Game Path
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([10, 15]); ctx.beginPath();
                let targetFreqAtCurrent = 0;

                // Draw Birds/Obstacles based on path
                for (let i = 30; i < width; i += 5) {
                    const t = (i - 30) / (width - 30); let freq = 0;
                    if (exercise.gameId === 'glide') { const freqRange = exercise.range; const center = (targetRange.min + targetRange.max) / 2; const phase = (Date.now() / 2000) * Math.PI * 2; freq = center + (freqRange / 2) * Math.sin((t * Math.PI * 4) + phase); }
                    else if (exercise.gameId === 'step') { const steps = 4; const stepHeight = exercise.range / steps; const phase = (Date.now() / 4000) % 1; const adjustedT = (t + phase) % 1; const currentStep = Math.floor(adjustedT * steps); freq = targetRange.min + (currentStep * stepHeight); }

                    const y = mapY(freq);
                    if (i === 30) ctx.moveTo(i, y); else ctx.lineTo(i, y);
                    if (i >= width - 50 && i < width - 40) targetFreqAtCurrent = freq; // Check slightly ahead

                    // Draw birds occasionally
                    if (i % 150 === 0) {
                        const birdY = y + (Math.sin(i + now / 100) * 20); // Bobbing bird
                        if (birdRef.current.complete) ctx.drawImage(birdRef.current, i, birdY - 15, 30, 30);
                    }
                }
                ctx.stroke(); ctx.setLineDash([]);

                const currentPitch = dataRef.current.history[dataRef.current.history.length - 1];
                if (currentPitch > 0) {
                    const playerY = mapY(currentPitch);
                    // Draw Balloon
                    if (balloonRef.current.complete) {
                        ctx.drawImage(balloonRef.current, width - 60, playerY - 25, 50, 50);
                    } else {
                        // Fallback circle
                        ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(width - 40, playerY, 15, 0, Math.PI * 2); ctx.fill();
                    }

                    const diff = Math.abs(currentPitch - targetFreqAtCurrent);
                    if (diff < 20) {
                        gameRef.current.score += 1;
                        ctx.shadowBlur = 20; ctx.shadowColor = "#4ade80";
                        if (gameRef.current.score % 50 === 0) onScore(gameRef.current.score);
                    } else {
                        ctx.shadowBlur = 0;
                    }
                }

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(exercise.name.toUpperCase(), 40, 25);
                ctx.fillStyle = '#4ade80'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(`SCORE: ${gameRef.current.score}`, 40, 55);
            }

            const history = dataRef.current.history;

            // 1. Draw the Line (Multi-colored)
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 1; i < history.length; i++) {
                const p1 = history[i - 1];
                const p2 = history[i];

                if (p1 > 0 && p2 > 0) {
                    const x1 = 30 + ((i - 1) / (history.length - 1)) * (width - 30);
                    const y1 = mapY(p1);
                    const x2 = 30 + (i / (history.length - 1)) * (width - 30);
                    const y2 = mapY(p2);

                    // Create Gradient for this segment
                    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
                    grad.addColorStop(0, getPitchColor(p1));
                    grad.addColorStop(1, getPitchColor(p2));

                    ctx.strokeStyle = grad;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }

            // 2. Draw the Dots
            history.forEach((p, i) => {
                if (p > 0) {
                    const x = 30 + (i / (history.length - 1)) * (width - 30);
                    const y = mapY(p);
                    ctx.fillStyle = getPitchColor(p);
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.shadowBlur = 0;
            const currentP = history[history.length - 1];

            // Update average pitch range (only for speaking pitches > 0)
            if (currentP > 0) {
                setAveragePitchRange(prev => ({
                    lowest: prev.lowest === null ? currentP : Math.min(prev.lowest, currentP),
                    highest: prev.highest === null ? currentP : Math.max(prev.highest, currentP)
                }));
            }

            if (currentP > 0) { ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'right'; ctx.fillText(Math.round(currentP) + " Hz", width - 10, 30); }
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'pitch-visualizer',
                loop,
                renderCoordinator.PRIORITY.HIGH
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [targetRange, exercise, zoomRange, voiceProfiles, settings, colorBlindMode]);

    const label = userMode === 'slp' ? 'Fundamental Frequency (F0)' : 'Pitch';

    return (
        <div className="w-full h-full relative overflow-hidden group">
            <div className="absolute top-3 left-10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>

            {/* Current Note Display */}
            {dataRef.current?.pitch > 50 && (
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-blue-500/50 rounded-lg px-4 py-2 shadow-lg">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Note</div>
                    <div className="text-2xl font-bold text-blue-400 font-mono">
                        {frequencyToNote(dataRef.current.pitch)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                        {Math.round(dataRef.current.pitch)} Hz
                        {getCentsDeviation(dataRef.current.pitch) !== 0 && (
                            <span className={`ml-1 ${getCentsDeviation(dataRef.current.pitch) > 0 ? 'text-orange-400' : 'text-cyan-400'}`}>
                                {getCentsDeviation(dataRef.current.pitch) > 0 ? '+' : ''}{getCentsDeviation(dataRef.current.pitch)}¢
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Average Pitch Range Display */}
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2">
                <div className="flex flex-col items-end">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Average Pitch</div>
                    {averagePitchRange.lowest !== null && averagePitchRange.highest !== null ? (
                        <div className="text-sm font-mono font-bold text-emerald-400">
                            {Math.round(averagePitchRange.lowest)} - {Math.round(averagePitchRange.highest)} Hz
                        </div>
                    ) : (
                        <div className="text-sm font-mono text-slate-500">-- Hz</div>
                    )}
                </div>
                <button
                    onClick={handleResetAverage}
                    className="w-7 h-7 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700/50"
                    title="Reset Average"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleZoomIn}
                    className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700"
                    title="Zoom In"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700"
                    title="Zoom Out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
            </div>

            <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
    );
};

export default PitchVisualizer;
