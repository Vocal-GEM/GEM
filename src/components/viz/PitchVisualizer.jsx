import { useState, useEffect, useRef, memo } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';
import { RotateCcw, HelpCircle, AlertTriangle, X, Sparkles, BarChart2 } from 'lucide-react';
import { frequencyToNote, getCentsDeviation } from '../../utils/musicUtils';
import { useAudio } from '../../context/AudioContext';
import { useFeedback } from '../../hooks/useFeedback';
import FeedbackControls from '../ui/FeedbackControls';
import { NormsService } from '../../services/NormsService';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { predictGenderPerception, getPerceptionColor, AMBIGUITY_ZONE } from '../../services/GenderPerceptionPredictor';
import GenderTimeline from './GenderTimeline';
import FeedbackManager from './FeedbackManager';

const PitchVisualizer = memo(({ dataRef, targetRange, userMode, exercise, onScore, settings }) => {
    const { voiceProfiles, activeProfile } = useProfile();
    const { colorBlindMode } = useSettings();
    const canvasRef = useRef(null);
    const balloonRef = useRef(new Image());
    const birdRef = useRef(new Image());
    const gameRef = useRef({ score: 0, lastUpdate: Date.now(), lastPitch: 0 });

    const [zoomRange, setZoomRange] = useState({ min: 50, max: 350 });
    const [averagePitchRange, setAveragePitchRange] = useState({ lowest: null, highest: null });
    const [showUnstableHelp, setShowUnstableHelp] = useState(false);
    const [ambiguityZoneData, setAmbiguityZoneData] = useState(null);
    const [showGenderTimeline, setShowGenderTimeline] = useState(false);

    const label = userMode === 'slp' ? 'Fundamental Frequency (F0)' : 'Pitch';
    const { audioEngineRef } = useAudio();
    const { settings: feedbackSettings, setSettings: setFeedbackSettings } = useFeedback(audioEngineRef, dataRef);

    useEffect(() => {
        balloonRef.current.src = '/assets/balloon.png';
        birdRef.current.src = '/assets/bird.png';
    }, []);

    const handleZoomIn = () => {
        setZoomRange(prev => {
            const range = prev.max - prev.min;
            if (range <= 100) return prev;
            const center = (prev.min + prev.max) / 2;
            const newRange = range * 0.8;
            return { min: center - newRange / 2, max: center + newRange / 2 };
        });
    };

    const handleZoomOut = () => {
        setZoomRange(prev => {
            const range = prev.max - prev.min;
            if (range >= 1000) return prev;
            const center = (prev.min + prev.max) / 2;
            const newRange = range * 1.25;
            return { min: Math.max(0, center - newRange / 2), max: center + newRange / 2 };
        });
    };

    const handleResetAverage = () => {
        setAveragePitchRange({ lowest: null, highest: null });
    };

    // Touch gesture state for pinch-to-zoom
    const touchesRef = useRef([]);
    const initialPinchDistRef = useRef(null);
    const initialZoomRef = useRef(null);

    const handlePointerDown = (e) => {
        touchesRef.current.push({ id: e.pointerId, x: e.clientX, y: e.clientY });
        if (touchesRef.current.length === 2) {
            // Start pinch
            const [t1, t2] = touchesRef.current;
            initialPinchDistRef.current = Math.hypot(t2.x - t1.x, t2.y - t1.y);
            initialZoomRef.current = { ...zoomRange };
        }
    };

    const handlePointerMove = (e) => {
        const idx = touchesRef.current.findIndex(t => t.id === e.pointerId);
        if (idx !== -1) {
            touchesRef.current[idx] = { id: e.pointerId, x: e.clientX, y: e.clientY };
        }

        if (touchesRef.current.length === 2 && initialPinchDistRef.current) {
            const [t1, t2] = touchesRef.current;
            const currentDist = Math.hypot(t2.x - t1.x, t2.y - t1.y);
            const scale = initialPinchDistRef.current / currentDist; // Inverted: pinch out = zoom in

            const initialRange = initialZoomRef.current.max - initialZoomRef.current.min;
            const newRange = Math.max(50, Math.min(1000, initialRange * scale));
            const center = (initialZoomRef.current.min + initialZoomRef.current.max) / 2;

            setZoomRange({
                min: Math.max(0, center - newRange / 2),
                max: center + newRange / 2
            });
        }
    };

    const handlePointerUp = (e) => {
        touchesRef.current = touchesRef.current.filter(t => t.id !== e.pointerId);
        if (touchesRef.current.length < 2) {
            initialPinchDistRef.current = null;
            initialZoomRef.current = null;
        }
    };

    const handlePointerCancel = handlePointerUp;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        if (exercise) gameRef.current = { score: 0, lastUpdate: Date.now(), lastPitch: 0 };

        const getPitchColor = (freq, clarity = 1.0) => {
            if (clarity < 0.8) {
                return colorBlindMode ? '#9333ea' : '#ef4444';
            }

            // Check Settings Mode
            const mode = settings?.genderFeedbackMode || 'neutral'; // Default to neutral if undefined

            const fem = voiceProfiles.find(p => p.id === 'fem');
            const masc = voiceProfiles.find(p => p.id === 'masc');

            const femRange = fem?.genderRange || fem?.targetRange;
            const mascRange = masc?.genderRange || masc?.targetRange;

            // Target Zone (Always Winning Color)
            const isFem = activeProfile === 'fem';
            if (targetRange && freq >= targetRange.min && (isFem || freq <= targetRange.max)) {
                if (colorBlindMode) return '#0d9488';
                return '#22c55e'; // Green
            }

            // Near Miss Zone
            if (targetRange) {
                const distMin = 1200 * Math.log2(freq / targetRange.min);
                const distMax = 1200 * Math.log2(freq / targetRange.max);

                if ((distMin > -50 && distMin < 0) || (distMax > 0 && distMax < 50)) {
                    if (colorBlindMode) return '#f59e0b';
                    return '#eab308'; // Yellow
                }
            }

            // If Neutral or Off, avoid gendered colors
            if (mode === 'neutral') {
                if (freq < 155) return '#6366f1'; // Indigo (Low)
                if (freq > 185) return '#f59e0b'; // Amber (High)
                return '#10b981'; // Emerald (Mid/Target-ish)
            }
            if (mode === 'off') {
                return '#94a3b8'; // Slate (Neutral feedback)
            }

            // Default Gendered Colors
            if (femRange && freq >= femRange.min && freq <= femRange.max) {
                return '#e879f9'; // Pink
            }

            if (mascRange && freq >= mascRange.min && freq <= mascRange.max) {
                return '#60a5fa'; // Blue
            }

            if (colorBlindMode) return '#9333ea';
            return '#ef4444';
        };

        const loop = () => {
            // ... (context init omitted, assumes mostly unchanged logic till drawing) ...
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;
            ctx.clearRect(0, 0, width, height);

            // ... (grid drawing lines 114-133 omitted) ...
            const yMin = zoomRange.min;
            const yMax = zoomRange.max;
            const mapY = (freq) => height - ((freq - yMin) / (yMax - yMin)) * height;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.lineWidth = 1;

            for (let f = Math.ceil(yMin / 50) * 50; f < yMax; f += 50) {
                const y = mapY(f);
                ctx.beginPath();
                ctx.moveTo(30, y);
                ctx.lineTo(width, y);
                ctx.stroke();
                ctx.fillText(`${f}`, 25, y + 3);
            }

            ctx.stroke();

            const showNorms = settings?.showNorms !== false;
            const mode = settings?.genderFeedbackMode || 'neutral';

            if (showNorms && mode !== 'off') {
                let genderId = null;
                const targetCenter = (targetRange.min + targetRange.max) / 2;
                if (targetCenter < 160) genderId = 'masculine';
                else if (targetCenter > 190) genderId = 'feminine';
                else genderId = 'androgynous';

                const norms = NormsService.getNorms(genderId);

                if (norms && norms.pitch) {
                    const normTopY = mapY(norms.pitch.max);
                    const normBotY = mapY(norms.pitch.min);
                    const normH = Math.abs(normBotY - normTopY);

                    // Override label for neutral mode
                    let label = norms.pitch.label;
                    if (mode === 'neutral') {
                        if (genderId === 'masculine') label = 'Typical Low Range';
                        else if (genderId === 'feminine') label = 'Typical High Range';
                        else label = 'Mid Range';
                    }

                    if (normTopY < height && normBotY > 0) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                        ctx.fillRect(30, normTopY, width - 30, normH);

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        ctx.font = 'italic 10px sans-serif';
                        ctx.textAlign = 'right';
                        ctx.fillText(label, width - 10, normTopY + 12);
                    }
                }
            }

            if (targetRange && !exercise) {
                const isFem = activeProfile === 'fem';
                const topY = isFem ? 0 : mapY(targetRange.max);
                const botY = mapY(targetRange.min);
                const h = Math.abs(botY - topY);

                if (botY > 0) {
                    ctx.fillStyle = colorBlindMode ? 'rgba(13, 148, 136, 0.1)' : 'rgba(34, 197, 94, 0.1)';
                    ctx.fillRect(30, topY, width - 30, h);

                    ctx.strokeStyle = colorBlindMode ? 'rgba(13, 148, 136, 0.5)' : 'rgba(34, 197, 94, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    if (!isFem) {
                        ctx.moveTo(30, topY);
                        ctx.lineTo(width, topY);
                    }
                    ctx.moveTo(30, botY);
                    ctx.lineTo(width, botY);
                    ctx.stroke();

                    ctx.fillStyle = colorBlindMode ? '#0d9488' : '#22c55e';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText('TARGET ZONE', 35, isFem ? mapY(targetRange.min + 20) : topY - 5);
                }
            }

            const tolerance = (targetRange.max - targetRange.min) * 0.5;
            const tolTopY = mapY(targetRange.max + tolerance);
            const tolBotY = mapY(targetRange.min - tolerance);
            const tolH = Math.abs(tolBotY - tolTopY);

            if (tolTopY < height && tolBotY > 0) {
                ctx.fillStyle = colorBlindMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(234, 179, 8, 0.05)';
                ctx.fillRect(30, tolTopY, width - 30, tolH);
            }

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

            // Crossover point marker at 157 Hz (gender-neutral point based on research)
            const crossoverFreq = 157;
            if (crossoverFreq > yMin && crossoverFreq < yMax && mode !== 'off') {
                const crossY = mapY(crossoverFreq);
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'; // Purple
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(30, crossY);
                ctx.lineTo(width, crossY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
                ctx.font = 'italic 9px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText('Crossover ~157 Hz', width - 10, crossY - 3);
            }

            if (exercise) {
                const now = Date.now();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([10, 15]); ctx.beginPath();
                let targetFreqAtCurrent = 0;

                for (let i = 30; i < width; i += 5) {
                    const t = (i - 30) / (width - 30); let freq = 0;
                    if (exercise.gameId === 'glide') { const freqRange = exercise.range; const center = (targetRange.min + targetRange.max) / 2; const phase = (Date.now() / 2000) * Math.PI * 2; freq = center + (freqRange / 2) * Math.sin((t * Math.PI * 4) + phase); }
                    else if (exercise.gameId === 'step') { const steps = 4; const stepHeight = exercise.range / steps; const phase = (Date.now() / 4000) % 1; const adjustedT = (t + phase) % 1; const currentStep = Math.floor(adjustedT * steps); freq = targetRange.min + (currentStep * stepHeight); }

                    const y = mapY(freq);
                    if (i === 30) ctx.moveTo(i, y); else ctx.lineTo(i, y);
                    if (i >= width - 50 && i < width - 40) targetFreqAtCurrent = freq;

                    if (i % 150 === 0) {
                        const birdY = y + (Math.sin(i + now / 100) * 20);
                        if (birdRef.current.complete) ctx.drawImage(birdRef.current, i, birdY - 15, 30, 30);
                    }
                }
                ctx.stroke(); ctx.setLineDash([]);

                const currentPitch = dataRef.current.history[dataRef.current.history.length - 1];
                if (currentPitch > 0) {
                    const playerY = mapY(currentPitch);
                    if (balloonRef.current.complete) {
                        ctx.drawImage(balloonRef.current, width - 60, playerY - 25, 50, 50);
                    } else {
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

            if (currentP > 0) {
                setAveragePitchRange(prev => ({
                    lowest: prev.lowest === null ? currentP : Math.min(prev.lowest, currentP),
                    highest: prev.highest === null ? currentP : Math.max(prev.highest, currentP)
                }));

                // Check if in ambiguity zone and update state
                const f1 = dataRef.current.f1 || 0;
                const rbi = dataRef.current.resonanceScore;
                if (currentP >= AMBIGUITY_ZONE.min && currentP <= AMBIGUITY_ZONE.max) {
                    const prediction = predictGenderPerception(currentP, f1, rbi);
                    setAmbiguityZoneData({
                        pitch: currentP,
                        f1,
                        rbi,
                        prediction
                    });
                } else {
                    setAmbiguityZoneData(null);
                }
            }

            if (currentP > 0) {
                ctx.fillStyle = getPitchColor(currentP, currentClarity);
                ctx.font = 'bold 20px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(Math.round(currentP) + " Hz", width - 10, 30);
            }

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

        const unsubscribe = renderCoordinator.subscribe(
            'pitch-visualizer',
            loop,
            renderCoordinator.PRIORITY.HIGH
        );

        return () => {
            unsubscribe();
        };
    }, [targetRange, exercise, zoomRange, voiceProfiles, settings, colorBlindMode]);

    return (
        <div className="w-full h-full relative overflow-hidden group">
            <div className="absolute top-3 left-10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>

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

            <div className="absolute top-3 right-48 z-20">
                <FeedbackControls settings={feedbackSettings} setSettings={setFeedbackSettings} />
            </div>

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

            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
            ></canvas>

            {/* Gender Timeline Toggle */}
            <button
                onClick={() => setShowGenderTimeline(!showGenderTimeline)}
                className={`absolute top-3 left-28 z-20 p-2 rounded-lg backdrop-blur-sm border transition-all ${showGenderTimeline
                    ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                title="Toggle Gender Timeline"
            >
                <BarChart2 size={16} />
            </button>

            {/* Gender Timeline Overlay */}
            {showGenderTimeline && (
                <div className="absolute inset-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 animate-in fade-in duration-200">
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-bold text-purple-300 flex items-center gap-2">
                                <BarChart2 size={16} />
                                Gender Estimation Timeline
                            </div>
                            <button
                                onClick={() => setShowGenderTimeline(false)}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <GenderTimeline dataRef={dataRef} duration={10} />
                        </div>
                    </div>
                </div>
            )}

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

            {/* Ambiguity Zone Alert */}
            {ambiguityZoneData && settings?.genderFeedbackMode !== 'off' && (
                <div className="absolute bottom-4 left-4 z-30 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-start gap-3 bg-purple-900/80 backdrop-blur-sm border border-purple-500/40 rounded-xl px-4 py-3 shadow-lg max-w-xs">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Sparkles className="text-purple-400" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                                Ambiguity Zone
                            </div>
                            <div className="text-xs text-purple-100 mb-2">
                                Resonance is now the deciding factor
                            </div>
                            <div className="flex gap-3 text-[10px]">
                                <div>
                                    <span className="text-purple-400">F1:</span>
                                    <span className="text-white font-mono ml-1">
                                        {ambiguityZoneData.f1 > 0 ? `${Math.round(ambiguityZoneData.f1)} Hz` : '--'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-purple-400">RBI:</span>
                                    <span className="text-white font-mono ml-1">
                                        {ambiguityZoneData.rbi !== undefined ? `${Math.round(ambiguityZoneData.rbi)}%` : '--'}
                                    </span>
                                </div>
                            </div>
                            {ambiguityZoneData.prediction && (
                                <div
                                    className="mt-2 text-xs font-bold"
                                    style={{ color: getPerceptionColor(ambiguityZoneData.prediction.score, colorBlindMode) }}
                                >
                                    → {ambiguityZoneData.prediction.label}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

            {/* Tier 3 Feedback System Overlay */}
            <FeedbackManager dataRef={dataRef} targetRange={targetRange} active={!settings?.feedback?.focusMode} />
        </div>
    );
});

PitchVisualizer.displayName = 'PitchVisualizer';

export default PitchVisualizer;
