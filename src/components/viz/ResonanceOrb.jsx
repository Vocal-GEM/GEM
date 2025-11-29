import React, { useEffect, useRef, useState } from 'react';
import { Info, WifiOff } from 'lucide-react';

/**
 * ResonanceOrb - Visual feedback for voice resonance
 * 
 * Uses resonanceScore (0-1) derived from RBI (0-100):
 * - 0.0 - 0.35: Dark (masculine resonance)
 * - 0.35 - 0.65: Balanced (androgynous resonance)  
 * - 0.65 - 1.0: Bright (feminine resonance)
 * 
 * Includes debug display for calibration (toggle with showDebug prop)
 */
const ResonanceOrb = ({ dataRef, calibration, showDebug = false, size = 128, colorBlindMode = false }) => {
    const orbRef = useRef(null);
    const labelRef = useRef(null);

    // Debug state
    const [debugInfo, setDebugInfo] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // Smoothing ref
    const currentScore = useRef(0.5);

    // Hold timer
    const silenceTimer = useRef(0);

    // Label stability tracking
    const labelState = useRef({ current: "Listening...", candidate: "Listening...", count: 0 });

    // History for sparklines
    const historyRef = useRef([]);

    useEffect(() => {
        let frameCount = 0;

        const loop = () => {
            if (orbRef.current && dataRef.current) {
                const { resonance, pitch, volume, f1, f2, debug, weight, resonanceScore, isBackendActive } = dataRef.current;

                // Update offline state
                if (isBackendActive !== undefined && !isBackendActive) {
                    setIsOffline(true);
                } else {
                    setIsOffline(false);
                }

                // Use backend RBI score (0-100) mapped to 0-1
                let calculatedScore = (resonanceScore !== undefined ? resonanceScore : 50) / 100.0;

                if (calibration) {
                    historyRef.current.push({
                        f1: f1 || 0,
                        f2: f2 || 0,
                        score: calculatedScore
                    });
                    if (historyRef.current.length > 50) historyRef.current.shift();
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
                        smoothingMode: debug.smoothingMode || '—',
                        history: [...historyRef.current] // Copy for render
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
                if (colorBlindMode) {
                    // Color Blind Mode: Teal (Dark) -> White (Balanced) -> Purple (Bright)
                    if (score <= 0.5) {
                        // Teal -> White
                        const t = score * 2;
                        const r = Math.round(45 + (255 - 45) * t);
                        const g = Math.round(212 + (255 - 212) * t);
                        const b = Math.round(191 + (255 - 191) * t);
                        color = `rgb(${r}, ${g}, ${b})`;
                    } else {
                        // White -> Purple
                        const t = (score - 0.5) * 2;
                        const r = Math.round(255 + (192 - 255) * t);
                        const g = Math.round(255 + (132 - 255) * t);
                        const b = Math.round(255 + (252 - 255) * t);
                        color = `rgb(${r}, ${g}, ${b})`;
                    }
                } else {
                    // Standard Mode
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
                        const g = Math.round(130 + (204 - 130) * t);
                        const b = Math.round(246 + (21 - 246) * t);
                        color = `rgb(${r}, ${g}, ${b})`;
                    }
                }

                // Apply visual updates to orb
                if (orbRef.current) {
                    orbRef.current.style.backgroundColor = color;
                    orbRef.current.style.boxShadow = `0 0 ${size * 0.5}px ${color}, 0 0 ${size}px ${color}40`;

                    // Offline visual cue
                    if (isOffline) {
                        orbRef.current.style.opacity = "0.7";
                        orbRef.current.style.border = "2px solid #ef4444"; // Red border for offline
                    } else {
                        orbRef.current.style.opacity = "1";
                        orbRef.current.style.border = "none";
                    }
                }

                // Label Logic
                let candidate = "";
                if (!isVoiceActive && silenceTimer.current > 45) {
                    candidate = "Listening...";
                } else if (isVoiceActive || silenceTimer.current <= 45) {
                    if (score < 0.35) candidate = "Dark";
                    else if (score > 0.65) candidate = "Bright";
                    else candidate = "Balanced";
                }

                if (candidate === labelState.current.candidate) {
                    labelState.current.count++;
                } else {
                    labelState.current.candidate = candidate;
                    labelState.current.count = 0;
                }

                let nextLabel = labelState.current.current;
                if (labelState.current.count > 45) {
                    nextLabel = candidate;
                    labelState.current.current = nextLabel;
                }

                if (labelRef.current) {
                    if (labelRef.current.innerText !== nextLabel) {
                        labelRef.current.innerText = nextLabel;
                    }

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
    }, [calibration, dataRef, showDebug, size, colorBlindMode]);

    // Helper to render sparkline
    const renderSparkline = (data, key, color, height = 30) => {
        if (!data || data.length < 2) return null;
        const max = Math.max(...data.map(d => d[key])) || 1;
        const min = Math.min(...data.map(d => d[key])) || 0;
        const range = max - min || 1;

        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = height - ((d[key] - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="w-full h-8 relative border-b border-white/10 mt-1">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden py-8">
            {/* Main orb container */}
            <div
                className="relative flex items-center justify-center shrink-0"
                style={{ width: size, height: size }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>

                <div
                    ref={orbRef}
                    className="rounded-full transition-all duration-150 z-10 relative"
                    style={{
                        width: size,
                        height: size,
                        transitionProperty: 'transform, opacity',
                        backgroundColor: 'rgb(59, 130, 246)',
                        boxShadow: `0 0 ${size * 0.5}px rgb(59, 130, 246), 0 0 ${size}px rgba(59, 130, 246, 0.25)`
                    }}
                ></div>

                {/* Offline Indicator */}
                {isOffline && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500/90 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-20">
                        <WifiOff size={10} />
                        <span>Offline</span>
                    </div>
                )}

                <div
                    ref={labelRef}
                    className="absolute bottom-0 translate-y-full text-xs font-bold tracking-widest text-slate-400 uppercase mt-4 transition-opacity duration-200 whitespace-nowrap"
                >
                    Listening...
                </div>
            </div>

            {/* Values Panel (formerly Debug Panel) */}
            {showDebug && debugInfo && (
                <div className="mt-12 p-4 bg-slate-800/50 backdrop-blur rounded-xl text-xs font-mono text-slate-300 w-64 border border-slate-700/50 shadow-lg relative">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-slate-500 uppercase tracking-wider font-bold">Values</div>
                        <button
                            onClick={() => setShowTooltip(!showTooltip)}
                            className="text-slate-500 hover:text-white transition-colors"
                            title="Information"
                        >
                            <Info size={14} />
                        </button>
                    </div>

                    {/* Info Tooltip */}
                    {showTooltip && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900/95 border border-slate-600 rounded-lg p-3 shadow-xl z-50 text-[10px] leading-relaxed">
                            <div className="font-bold text-white mb-1">Metrics Guide:</div>
                            <ul className="space-y-1 text-slate-300">
                                <li><span className="text-cyan-400">Centroid:</span> Center of mass of the spectrum. Higher = brighter.</li>
                                <li><span className="text-yellow-400">Score:</span> Resonance brightness (0-100%).</li>
                                <li><span className="text-green-400">F1:</span> Throat resonance (R1).</li>
                                <li><span className="text-green-400">F2:</span> Mouth resonance (R2).</li>
                                <li><span className="text-white">UI Score:</span> Smoothed display value.</li>
                            </ul>
                            <div className="absolute bottom-[-5px] left-4 w-2 h-2 bg-slate-900 border-b border-r border-slate-600 rotate-45"></div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="text-slate-400">Centroid:</div>
                        <div className="text-cyan-400 font-bold text-right">{debugInfo.centroid} Hz</div>

                        <div className="text-slate-400">Score:</div>
                        <div className="text-yellow-400 font-bold text-right">{debugInfo.centroidScore}%</div>

                        <div className="border-t border-slate-700/50 col-span-2 my-1"></div>

                        <div className="text-slate-400">F1:</div>
                        <div className="text-green-400 font-bold text-right">{debugInfo.f1} Hz</div>

                        <div className="text-slate-400">F2:</div>
                        <div className="text-green-400 font-bold text-right">{debugInfo.f2} Hz</div>

                        <div className="border-t border-slate-700/50 col-span-2 my-1"></div>

                        <div className="text-slate-400">UI Score:</div>
                        <div className="text-white font-bold text-right">{debugInfo.uiScore}%</div>
                    </div>

                    {/* History Sparklines */}
                    <div className="mt-4 pt-2 border-t border-slate-700/50">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">F1 History</div>
                        {renderSparkline(debugInfo.history, 'f1', '#4ade80')}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResonanceOrb;