import React, { useEffect, useRef, useState } from 'react';

/**
 * ResonanceOrb - Visual feedback for voice resonance
 * 
 * Uses resonanceScore (0-1) from the processor:
 * - 0.0 - 0.35: Dark (masculine resonance)
 * - 0.35 - 0.65: Balanced (androgynous resonance)  
 * - 0.65 - 1.0: Bright (feminine resonance)
 * 
 * Includes debug display for calibration (toggle with showDebug prop)
 */
const ResonanceOrb = ({ dataRef, calibration, showDebug = false }) => {
    const orbRef = useRef(null);
    const labelRef = useRef(null);

    // Debug state
    const [debugInfo, setDebugInfo] = useState(null);

    // Smoothing ref
    const currentScore = useRef(0.5);

    // Hold timer
    const silenceTimer = useRef(0);

    // Label stability tracking
    const labelState = useRef({ current: "Listening...", candidate: "Listening...", count: 0 });

    useEffect(() => {
        let frameCount = 0;

        const loop = () => {
            if (orbRef.current && dataRef.current) {
                const { resonance, pitch, volume, f1, f2, debug, weight } = dataRef.current;

                // Calculate resonance score locally since processor doesn't send it
                // Map resonance (Hz) to 0-1 score based on calibration
                // Dark (Low Hz) -> 0, Bright (High Hz) -> 1
                let calculatedScore = 0.5;
                if (resonance && calibration) {
                    const { dark, bright } = calibration;
                    // Clamp and normalize
                    calculatedScore = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
                }

                // Update debug display every 10 frames (~6 times/sec) to reduce flicker
                frameCount++;
                if (showDebug && frameCount % 10 === 0 && debug) {
                    setDebugInfo({
                        centroid: resonance?.toFixed(0) || '—',
                        rawCentroid: debug.rawCentroid?.toFixed(0) || '—',
                        centroidScore: (calculatedScore * 100)?.toFixed(0) || '—',
                        f1: f1?.toFixed(0) || '—',
                        f2: f2?.toFixed(0) || '—',
                        f2Score: debug.hasValidF2 ? (debug.f2Score * 100)?.toFixed(0) : 'N/A',
                        rawScore: (debug.rawScore * 100)?.toFixed(0) || '—',
                        finalScore: (calculatedScore * 100)?.toFixed(0) || '—',
                        hasF2: debug.hasValidF2 ? 'Yes' : 'No',
                        uiScore: (currentScore.current * 100)?.toFixed(0) || '—',
                        label: labelState.current.current,
                        peakCount: debug.peakCount !== undefined ? debug.peakCount : '—',
                        smoothingMode: debug.smoothingMode || '—'
                    });
                }

                const isVoiceActive = pitch > 0 && volume > 0.005;

                if (isVoiceActive) {
                    silenceTimer.current = 0;

                    const targetScore = calculatedScore;
                    const smoothFactor = 0.15; // Slightly faster response
                    currentScore.current = currentScore.current + (targetScore - currentScore.current) * smoothFactor;
                } else {
                    silenceTimer.current++;

                    if (silenceTimer.current > 25) {
                        currentScore.current = currentScore.current * 0.97 + 0.5 * 0.03;
                    }
                }

                const score = currentScore.current;

                // ============================================
                // Visual Color Mapping
                // ============================================
                let color;
                if (score <= 0.5) {
                    // Dark -> Balanced (deep purple-blue to blue)
                    const t = score * 2;
                    const r = Math.round(45 + (59 - 45) * t);
                    const g = Math.round(35 + (130 - 35) * t);
                    const b = Math.round(120 + (246 - 120) * t);
                    color = `rgb(${r}, ${g}, ${b})`;
                } else {
                    // Balanced -> Bright (blue to warm gold)
                    const t = (score - 0.5) * 2;
                    const r = Math.round(59 + (255 - 59) * t);
                    let nextLabel = labelState.current.current;

                    // Determine candidate label
                    let candidate = "";
                    if (!isVoiceActive && silenceTimer.current > 45) { // Increased wait for silence
                        candidate = "Listening...";
                    } else if (isVoiceActive || silenceTimer.current <= 45) {
                        if (score < 0.35) candidate = "Dark";
                        else if (score > 0.65) candidate = "Bright";
                        else candidate = "Balanced";
                    }

                    // Debounce logic
                    if (candidate === labelState.current.candidate) {
                        labelState.current.count++;
                    } else {
                        labelState.current.candidate = candidate;
                        labelState.current.count = 0;
                    }

                    // Only switch if stable for 45 frames (~0.75s)
                    if (labelState.current.count > 45) {
                        nextLabel = candidate;
                        labelState.current.current = nextLabel;
                    }

                    // Apply to DOM
                    if (labelRef.current.innerText !== nextLabel) {
                        labelRef.current.innerText = nextLabel;
                    }

                    // Opacity handling
                    if (nextLabel === "Listening...") {
                        labelRef.current.style.opacity = "0.6";
                    } else {
                        labelRef.current.style.opacity = "1";
                    }
                }
            }
            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [calibration, dataRef, showDebug]);

    return (
        <div className="relative flex flex-col items-center">
            {/* Main orb container */}
            <div className="relative h-48 w-full flex items-center justify-center mb-6 mt-2">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>

                <div
                    ref={orbRef}
                    className="w-32 h-32 rounded-full transition-all duration-150 z-10 relative"
                    style={{ transitionProperty: 'transform, opacity' }}
                ></div>

                <div
                    ref={labelRef}
                    className="absolute bottom-0 translate-y-full text-xs font-bold tracking-widest text-slate-400 uppercase mt-4 transition-opacity duration-200"
                >
                    Listening...
                </div>
            </div>

            {/* Debug Panel */}
            {showDebug && debugInfo && (
                <div className="mt-8 p-4 bg-slate-800/80 rounded-lg text-xs font-mono text-slate-300 w-full max-w-sm">
                    <div className="text-slate-500 uppercase tracking-wider mb-2 text-center">Debug Values</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>Centroid (raw):</div>
                        <div className="text-cyan-400">{debugInfo.rawCentroid} Hz</div>

                        <div>Centroid (smooth):</div>
                        <div className="text-cyan-400">{debugInfo.centroid} Hz</div>

                        <div>Centroid Score:</div>
                        <div className="text-yellow-400">{debugInfo.centroidScore}%</div>

                        <div className="border-t border-slate-700 col-span-2 my-1"></div>

                        <div>F1:</div>
                        <div className="text-green-400">{debugInfo.f1} Hz</div>

                        <div>F2:</div>
                        <div className="text-green-400">{debugInfo.f2} Hz</div>

                        <div>Valid F2?</div>
                        <div className={debugInfo.hasF2 === 'Yes' ? 'text-green-400' : 'text-red-400'}>{debugInfo.hasF2}</div>

                        <div className="border-t border-slate-700 col-span-2 my-1"></div>

                        <div>Proc Score:</div>
                        <div className="text-orange-400">{debugInfo.finalScore}%</div>

                        <div>UI Score:</div>
                        <div className="text-white font-bold">{debugInfo.uiScore}%</div>

                        <div>Label:</div>
                        <div className="text-white">{debugInfo.label}</div>

                        <div className="border-t border-slate-700 col-span-2 my-1"></div>

                        <div>Peaks:</div>
                        <div className="text-slate-400">{debugInfo.peakCount}</div>

                        <div>Mode:</div>
                        <div className="text-slate-400">{debugInfo.smoothingMode}</div>
                    </div>

                    {/* Spectrum Scale */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                            <span>Dark</span>
                            <span>Balanced</span>
                            <span>Bright</span>
                        </div>

                        <div className="relative h-4 w-full rounded-full bg-slate-900 overflow-hidden ring-1 ring-white/10">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 opacity-80" style={{
                                background: 'linear-gradient(to right, #312e81 0%, #3b82f6 35%, #3b82f6 65%, #facc15 100%)'
                            }}></div>

                            {/* Threshold Markers */}
                            <div className="absolute top-0 bottom-0 w-px bg-white/20 left-[35%]"></div>
                            <div className="absolute top-0 bottom-0 w-px bg-white/20 left-[65%]"></div>

                            {/* Indicator Line */}
                            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,1)] transition-all duration-75 ease-out z-10"
                                style={{ left: `${debugInfo.uiScore}%`, transform: 'translateX(-50%)' }}
                            ></div>
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                            <span>0%</span>
                            <span className="pl-2">35%</span>
                            <span className="pr-2">65%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResonanceOrb;