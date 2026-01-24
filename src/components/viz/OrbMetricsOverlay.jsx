import { useState, useEffect, useRef, memo } from 'react';
import { useSettings } from '../../context/SettingsContext';

const OrbMetricsOverlay = memo(({ dataRef, calibration, mode, showDebug, variant = 'overlay', isVisible = true }) => {
    const { settings } = useSettings();
    const beginnerMode = settings?.beginnerMode;

    const [debugInfo, setDebugInfo] = useState(null);
    const [genderPerception, setGenderPerception] = useState({ label: '—', color: 'text-slate-500' });
    const [metricClassifications, setMetricClassifications] = useState({
        pitch: { label: '—', color: 'text-slate-500' },
        resonance: { label: '—', color: 'text-slate-500' },
        weight: { label: '—', color: 'text-slate-500' }
    });
    const [pitchDisplay, setPitchDisplay] = useState(null);

    // Gender Perception Logic
    const scoreBuffer = useRef([]);
    const silenceStart = useRef(null);

    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            if (dataRef.current) {
                const { pitch, resonance, weight, volume } = dataRef.current;
                const pitchVal = pitch || 0;

                // --- GENDER PERCEPTION & METRICS ---
                // Handle Silence / Invalid Pitch with Debounce
                if (!pitch || pitch <= 0) {
                    if (!silenceStart.current) {
                        silenceStart.current = Date.now();
                    }

                    // If silence persists for > 1.5 seconds, reset
                    if (Date.now() - silenceStart.current > 1500) {
                        setGenderPerception({ label: '—', color: 'text-slate-500' });
                        scoreBuffer.current = []; // Clear buffer
                    }
                } else {
                    // Voice detected - reset silence timer
                    silenceStart.current = null;

                    // 1. Pitch Score (0 = Masc, 1 = Fem)
                    let pitchScore = 0.5;
                    if (pitch < 85) pitchScore = 0.0;
                    else if (pitch < 165) pitchScore = ((pitch - 85) / 80) * 0.4;
                    else if (pitch < 185) pitchScore = 0.4 + ((pitch - 165) / 20) * 0.2;
                    else if (pitch < 255) pitchScore = 0.6 + ((pitch - 185) / 70) * 0.4;
                    else pitchScore = 1.0;

                    // 2. Resonance Score (0 = Masc, 1 = Fem)
                    let resScore = 0.5;
                    if (resonance && calibration) {
                        const { dark, bright } = calibration;
                        resScore = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
                    }

                    // 3. Weight Score (0 = Masc, 1 = Fem)
                    const weightVal = weight !== undefined ? weight : 50;
                    const weightScore = 1.0 - Math.max(0, Math.min(1, weightVal / 100));

                    // Average for this frame
                    const currentScore = (pitchScore * 2 + resScore + weightScore) / 4;

                    // Add to buffer
                    scoreBuffer.current.push(currentScore);
                    if (scoreBuffer.current.length > 10) scoreBuffer.current.shift();

                    // Calculate smoothed score
                    const smoothedScore = scoreBuffer.current.reduce((a, b) => a + b, 0) / scoreBuffer.current.length;

                    let label = 'Androgynous';
                    let color = 'text-purple-400';

                    if (mode === 'fire') {
                        if (smoothedScore < 0.5) {
                            label = 'Masculine';
                            color = 'text-blue-400';
                        } else {
                            label = 'Feminine';
                            color = 'text-pink-400';
                        }
                    } else {
                        if (smoothedScore < 0.40) {
                            label = 'Masculine';
                            color = 'text-blue-400';
                        } else if (smoothedScore > 0.60) {
                            label = 'Feminine';
                            color = 'text-pink-400';
                        }
                    }

                    setGenderPerception({ label, color });
                    setPitchDisplay(pitch > 0 ? Math.round(pitch) : null);

                    const getClassification = (score) => {
                        if (score < 0.40) return { label: 'Masculine', color: 'text-blue-400' };
                        if (score > 0.60) return { label: 'Feminine', color: 'text-pink-400' };
                        return { label: 'Androgynous', color: 'text-purple-400' };
                    };

                    setMetricClassifications({
                        pitch: getClassification(pitchScore),
                        resonance: getClassification(resScore),
                        weight: getClassification(weightScore)
                    });
                }

                // --- DEBUG INFO ---
                if (showDebug) {
                    // Re-calculate scores for debug display if needed
                    let resScore = 0.5;
                    if (resonance && calibration) {
                        const { dark, bright } = calibration;
                        resScore = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
                    }
                    const weightVal = weight !== undefined ? weight : 50;
                    const weightScore = 1.0 - Math.max(0, Math.min(1, weightVal / 100));

                    let pitchScore = 0.5;
                    if (pitchVal > 0) {
                         if (pitchVal < 85) pitchScore = 0.0;
                         else if (pitchVal < 165) pitchScore = ((pitchVal - 85) / 80) * 0.4;
                         else if (pitchVal < 185) pitchScore = 0.4 + ((pitchVal - 165) / 20) * 0.2;
                         else if (pitchVal < 255) pitchScore = 0.6 + ((pitchVal - 185) / 70) * 0.4;
                         else pitchScore = 1.0;
                    }

                    const currentScore = (pitchScore * 2 + resScore + weightScore) / 4;

                    setDebugInfo({
                        centroid: resonance?.toFixed(0) || '—',
                        pitch: pitchVal > 0 ? pitchVal.toFixed(0) : '—',
                        resScore: (resScore * 100).toFixed(0),
                        volume: ((volume || 0) * 100).toFixed(1),
                        pScore: pitchScore.toFixed(2),
                        rScore: resScore.toFixed(2),
                        wScore: weightScore.toFixed(2),
                        tScore: currentScore.toFixed(2)
                    });
                }
            }
        }, 200);

        return () => clearInterval(interval);
    }, [dataRef, calibration, mode, showDebug, isVisible]);

    if (!isVisible) return null;

    if (variant === 'footer') {
        // Mixer Mode Footer Layout
        if (beginnerMode) return null;

        return (
            <div className="flex-shrink-0 py-4 bg-slate-900/30 border-t border-white/5">
                <div className="flex justify-center gap-4 text-xs mb-2">
                    <div className="text-center">
                        <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Pitch</div>
                        <div className={`font-bold ${metricClassifications.pitch.color} transition-colors duration-300`}>
                            {metricClassifications.pitch.label}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Resonance</div>
                        <div className={`font-bold ${metricClassifications.resonance.color} transition-colors duration-300`}>
                            {metricClassifications.resonance.label}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Weight</div>
                        <div className={`font-bold ${metricClassifications.weight.color} transition-colors duration-300`}>
                            {metricClassifications.weight.label}
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Gender Perception</div>
                    <div className={`text-lg font-bold ${genderPerception.color} transition-colors duration-300`}>
                        {genderPerception.label}
                    </div>
                </div>
            </div>
        );
    }

    // Default 'overlay' Layout
    return (
        <>
            {/* Accessibility Live Region */}
            <div className="sr-only" aria-live="polite">
                {genderPerception.label !== '—' ? `Voice detected: ${genderPerception.label}. Pitch: ${metricClassifications.pitch.label}, Resonance: ${metricClassifications.resonance.label}.` : 'Listening...'}
            </div>

            {/* Live Hz Overlay */}
            {pitchDisplay && (
                <div className="absolute top-[20%] left-0 right-0 text-center pointer-events-none z-0 animate-in fade-in duration-300">
                    <div className="text-5xl font-black text-white/10 tracking-tighter select-none">
                        {pitchDisplay} Hz
                    </div>
                </div>
            )}

            {/* Debug Panel Overlay */}
            {showDebug && debugInfo && (
                <div className="absolute top-4 right-4 p-4 bg-slate-900/90 backdrop-blur-md rounded-lg border border-white/10 w-64 z-20 shadow-xl">
                    <div className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider flex justify-between items-center">
                        <span>Diagnostics</span>
                        <span className="text-amber-500 animate-pulse">●</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-xs font-mono mb-4">
                        <div className="text-slate-500">Pitch</div>
                        <div className="text-white text-right">{debugInfo.pitch} Hz</div>

                        <div className="text-slate-500">Resonance</div>
                        <div className="text-cyan-400 text-right">{debugInfo.centroid} Hz</div>

                        <div className="text-slate-500">Volume</div>
                        <div className="text-emerald-400 text-right">{debugInfo.volume}%</div>

                        <div className="col-span-2 border-t border-white/10 my-1"></div>

                        <div className="text-slate-500 text-[10px]">P/R/W Score</div>
                        <div className="text-white text-right text-[10px]">
                            {debugInfo.pScore} / {debugInfo.rScore} / {debugInfo.wScore}
                        </div>
                        <div className="text-slate-500 text-[10px]">Total</div>
                        <div className="text-white text-right text-[10px] font-bold">{debugInfo.tScore}</div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                        <div className="flex justify-between text-[10px] text-slate-300 mb-1 uppercase tracking-wider">
                            <span>Dark</span>
                            <span>Balanced</span>
                            <span>Bright</span>
                        </div>
                        <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden ring-1 ring-white/10">
                            <div className="absolute inset-0 opacity-80" style={{
                                background: 'linear-gradient(to right, #312e81 0%, #3b82f6 35%, #3b82f6 65%, #facc15 100%)'
                            }}></div>
                            <div className="absolute top-0 bottom-0 w-px bg-white/30 left-[35%]"></div>
                            <div className="absolute top-0 bottom-0 w-px bg-white/30 left-[65%]"></div>
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] transition-all duration-100 ease-out z-10"
                                style={{ left: `${debugInfo.resScore}%`, transform: 'translateX(-50%)' }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Classifications Row */}
            {!beginnerMode && (
                <div className="absolute bottom-12 left-0 right-0 px-4 pointer-events-none">
                    <div className="flex justify-center gap-4 text-xs">
                        <div className="text-center">
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Pitch</div>
                            <div className={`font-bold ${metricClassifications.pitch.color} transition-colors duration-300`}>
                                {metricClassifications.pitch.label}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Resonance</div>
                            <div className={`font-bold ${metricClassifications.resonance.color} transition-colors duration-300`}>
                                {metricClassifications.resonance.label}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Weight</div>
                            <div className={`font-bold ${metricClassifications.weight.color} transition-colors duration-300`}>
                                {metricClassifications.weight.label}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gender Perception Label */}
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Gender Perception</div>
                <div className={`text-lg font-bold ${genderPerception.color} transition-colors duration-300`}>
                    {genderPerception.label}
                </div>
            </div>
        </>
    );
});

OrbMetricsOverlay.displayName = 'OrbMetricsOverlay';

export default OrbMetricsOverlay;
