import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import { RotateCcw, HelpCircle, AlertTriangle, X } from 'lucide-react';
import { frequencyToNote, getCentsDeviation } from '../../utils/musicUtils';
import { useAudio } from '../../context/AudioContext';
import { useFeedback } from '../../hooks/useFeedback';
import FeedbackControls from '../ui/FeedbackControls';

const PitchVisualizer = React.memo(({ dataRef, targetRange, userMode, exercise, onScore, settings }) => {
    const { voiceProfiles } = useProfile();
    const { colorBlindMode } = useSettings();
    const canvasRef = useRef(null);
    const balloonRef = useRef(new Image());
    const birdRef = useRef(new Image());
    const gameRef = useRef({ score: 0, lastUpdate: Date.now(), lastPitch: 0 });

    const [zoomRange, setZoomRange] = useState({ min: 50, max: 350 });
    const [averagePitchRange, setAveragePitchRange] = useState({ lowest: null, highest: null });
    const [showUnstableHelp, setShowUnstableHelp] = useState(false);

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
        const getPitchColor = (freq, clarity = 1.0) => {
            // 1. Confidence Check
            // If clarity is low (e.g. < 0.8), don't give "success" colors
            if (clarity < 0.8) {
                return colorBlindMode ? '#9333ea' : '#ef4444'; // Default to "Out of Range" / Unstable
            }

            const fem = voiceProfiles.find(p => p.id === 'fem');
            const masc = voiceProfiles.find(p => p.id === 'masc');

            // Use genderRange if available, fallback to targetRange
            const femRange = fem?.genderRange || fem?.targetRange;
            const mascRange = masc?.genderRange || masc?.targetRange;

            // Check if within target range (primary success)
            if (targetRange && freq >= targetRange.min && freq <= targetRange.max) {
                if (colorBlindMode) return '#0d9488'; // Teal-600 (Safe)
                return '#22c55e'; // Green-500
            }

            // Check if within tolerance (near miss) - Cents based (e.g. +/- 50 cents)
            // 50 cents is approx 3% frequency deviation (2^(50/1200) ~= 1.029)
            if (targetRange) {
                // Calculate cents distance from nearest edge
                const distMin = 1200 * Math.log2(freq / targetRange.min);
                const distMax = 1200 * Math.log2(freq / targetRange.max);

                // If within 50 cents of min (below) or max (above)
                if ((distMin > -50 && distMin < 0) || (distMax > 0 && distMax < 50)) {
                    if (colorBlindMode) return '#f59e0b'; // Amber-500 (Safe)
                    return '#eab308'; // Yellow-500
                }
            }

            // Check Gender Ranges
            if (femRange && freq >= femRange.min && freq <= femRange.max) {
                return '#e879f9'; // Fuchsia-400 (Feminine)
            }

            if (mascRange && freq >= mascRange.min && freq <= mascRange.max) {
                return '#60a5fa'; // Blue-400 (Masculine)
            }

            // Out of range
            if (colorBlindMode) return '#9333ea'; // Purple-600 (Safe for contrast against teal/amber)
            return '#ef4444'; // Red-500
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

                // Tolerance Band (lighter, wider)
                const tolerance = (targetRange.max - targetRange.min) * 0.5;
                const tolTopY = mapY(targetRange.max + tolerance);
                const tolBotY = mapY(targetRange.min - tolerance);
                const tolH = Math.abs(tolBotY - tolTopY);

                if (tolTopY < height && tolBotY > 0) {
                    ctx.fillStyle = colorBlindMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(234, 179, 8, 0.05)'; // Amber/Yellow tint
                    ctx.fillRect(30, tolTopY, width - 30, tolH);
                }

                // Target Band (Success Zone)
                if (topY < height && botY > 0) {
                    // Shaded region
                    ctx.fillStyle = colorBlindMode ? 'rgba(13, 148, 136, 0.1)' : 'rgba(34, 197, 94, 0.1)'; // Teal/Green tint
                    ctx.fillRect(30, topY, width - 30, h);

                    // Border lines
                    ctx.strokeStyle = colorBlindMode ? 'rgba(13, 148, 136, 0.5)' : 'rgba(34, 197, 94, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(30, topY);
                    ctx.lineTo(width, topY);
                    ctx.moveTo(30, botY);
                    ctx.lineTo(width, botY);
                    ctx.stroke();

                    // Label
                    ctx.fillStyle = colorBlindMode ? '#0d9488' : '#22c55e';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText('TARGET ZONE', 35, topY - 5);
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
            const currentClarity = dataRef.current.clarity || 0;

            // Update average pitch range
            if (currentP > 0) {
                setAveragePitchRange(prev => ({
                    lowest: prev.lowest === null ? currentP : Math.min(prev.lowest, currentP),
                    highest: prev.highest === null ? currentP : Math.max(prev.highest, currentP)
                }));
            }

            if (currentP > 0) {
                ctx.fillStyle = getPitchColor(currentP, currentClarity);
                ctx.font = 'bold 20px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(Math.round(currentP) + " Hz", width - 10, 30);
            }

            // Stability Indicator
            if (history.length > 10 && currentP > 0) {
                const recent = history.slice(-10).filter(p => p > 0);
                if (recent.length > 5) {
                    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
                    const variance = recent.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / recent.length;
                    const stdDev = Math.sqrt(variance);
                    const stability = Math.max(0, Math.min(100, 100 - (stdDev * 5)));

                    const barW = 100;
                    const barH = 6;
                    const barX = width - barW - 10;
                    const barY = 45;

                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(barX, barY, barW, barH);

                    ctx.fillStyle = stability > 80 ? '#4ade80' : stability > 50 ? '#facc15' : '#f87171';
                    ctx.fillRect(barX, barY, barW * (stability / 100), barH);

                    ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    ctx.font = '9px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.fillText('STABILITY', barX - 5, barY + 6);
                }
            }
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
    const [feedbackSettings, setFeedbackSettings] = useFeedback();

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

            {/* Feedback Controls */}
            <div className="absolute top-3 right-48 z-20">
                <FeedbackControls settings={feedbackSettings} setSettings={setFeedbackSettings} />
            </div>

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

            {/* Unstable Signal Overlay */}
            {dataRef.current?.pitch > 0 && (dataRef.current?.clarity || 0) < 0.8 && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30">
                    <div className="flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                        <AlertTriangle size={14} />
                        <span className="text-xs font-bold">UNSTABLE SIGNAL</span>
                        <button
                            onClick={() => setShowUnstableHelp(true)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                            <HelpCircle size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {showUnstableHelp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowUnstableHelp(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="text-red-400" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Unstable Signal</h3>
                        </div>

                        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                            The app is having trouble detecting a clear pitch. This usually happens when:
                        </p>

                        <ul className="space-y-2 text-sm text-slate-400 mb-6">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>Background noise is interfering</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>Microphone is too far away</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>Speaking/singing volume is too low</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => setShowUnstableHelp(false)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default PitchVisualizer;
