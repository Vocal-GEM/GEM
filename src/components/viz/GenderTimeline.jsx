import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
    predictGenderPerception,
    getPerceptionColor
} from '../../services/GenderPerceptionPredictor';
import { renderCoordinator } from '../../services/RenderCoordinator';

/**
 * GenderTimeline - Genderfluent-style visualization showing gender estimation over time
 * 
 * Displays two synchronized charts:
 * 1. Top: Gender estimation bar (pink ↔ blue gradient per 1-second window)
 * 2. Bottom: Pitch trace with gender-colored points
 * 
 * Inspired by Genderfluent's AI gender estimation visualization.
 */
const GenderTimeline = ({ dataRef, duration = 10 }) => {
    const { colorBlindMode } = useSettings();
    const canvasRef = useRef(null);
    const historyRef = useRef([]);
    const [stats, setStats] = useState(null);

    // Configuration
    const WINDOW_SIZE = 1000; // 1 second windows for gender estimation
    const SAMPLE_RATE = 100; // Sample every 100ms for pitch trace
    const PITCH_MIN = 80;
    const PITCH_MAX = 300;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Layout
        const genderBarHeight = 30;
        const pitchChartHeight = height - genderBarHeight - 30; // Leave room for axis
        const padding = { left: 40, right: 10, top: 5 };

        let lastSampleTime = 0;
        let currentWindowData = [];
        let lastWindowTime = 0;

        const loop = () => {
            const now = Date.now();

            // Sample data
            if (now - lastSampleTime >= SAMPLE_RATE && dataRef.current) {
                lastSampleTime = now;
                const { pitch, f1, resonanceScore } = dataRef.current;

                if (pitch > 50) {
                    const prediction = predictGenderPerception(pitch, f1, resonanceScore);

                    currentWindowData.push({
                        time: now,
                        pitch,
                        f1: f1 || 0,
                        genderScore: prediction.score
                    });

                    // Add to history for pitch trace
                    historyRef.current.push({
                        time: now,
                        pitch,
                        genderScore: prediction.score
                    });
                }
            }

            // Aggregate window every WINDOW_SIZE
            if (now - lastWindowTime >= WINDOW_SIZE && currentWindowData.length > 0) {
                lastWindowTime = now;

                // Calculate average gender score for this window
                const avgScore = currentWindowData.reduce((sum, d) => sum + d.genderScore, 0) / currentWindowData.length;
                const avgPitch = currentWindowData.reduce((sum, d) => sum + d.pitch, 0) / currentWindowData.length;

                // Add window summary to history (separate from point data)
                historyRef.current.push({
                    time: now,
                    isWindow: true,
                    genderScore: avgScore,
                    avgPitch
                });

                currentWindowData = [];
            }

            // Trim history to duration
            const cutoff = now - (duration * 1000);
            historyRef.current = historyRef.current.filter(h => h.time > cutoff);

            // Clear canvas
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            // Draw gender estimation bar (top)
            const windows = historyRef.current.filter(h => h.isWindow);
            const windowWidth = (width - padding.left - padding.right) / duration;

            windows.forEach((w, i) => {
                const age = (now - w.time) / 1000;
                const x = padding.left + (duration - age) * windowWidth - windowWidth;

                // Create gradient for this window
                const color = getPerceptionColor(w.genderScore, colorBlindMode);
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.8;
                ctx.fillRect(x, padding.top, windowWidth - 1, genderBarHeight);
                ctx.globalAlpha = 1;
            });

            // Draw border around gender bar
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.strokeRect(padding.left, padding.top, width - padding.left - padding.right, genderBarHeight);

            // Draw pitch chart (bottom)
            const pitchChartTop = genderBarHeight + 10;
            const pitchPoints = historyRef.current.filter(h => !h.isWindow && h.pitch > 0);

            // Draw pitch grid
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            for (let p = 100; p <= 250; p += 50) {
                const y = pitchChartTop + pitchChartHeight * (1 - (p - PITCH_MIN) / (PITCH_MAX - PITCH_MIN));
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();

                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(`${p}`, padding.left - 5, y + 3);
            }

            // Draw pitch trace
            if (pitchPoints.length > 1) {
                ctx.beginPath();
                ctx.lineWidth = 2;

                pitchPoints.forEach((pt, i) => {
                    const age = (now - pt.time) / 1000;
                    const x = padding.left + (duration - age) * windowWidth;
                    const y = pitchChartTop + pitchChartHeight * (1 - (pt.pitch - PITCH_MIN) / (PITCH_MAX - PITCH_MIN));

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)'; // Teal
                ctx.stroke();

                // Draw points with gender color
                pitchPoints.forEach(pt => {
                    const age = (now - pt.time) / 1000;
                    const x = padding.left + (duration - age) * windowWidth;
                    const y = pitchChartTop + pitchChartHeight * (1 - (pt.pitch - PITCH_MIN) / (PITCH_MAX - PITCH_MIN));

                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = getPerceptionColor(pt.genderScore, colorBlindMode);
                    ctx.fill();
                });
            }

            // Draw time axis
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'center';
            for (let t = 0; t <= duration; t += 2) {
                const x = padding.left + t * windowWidth;
                ctx.fillText(`${t}s`, x, height - 5);
            }

            // Labels
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Gender', padding.left + 5, padding.top + 12);

            ctx.save();
            ctx.translate(10, pitchChartTop + pitchChartHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Pitch (Hz)', 0, 0);
            ctx.restore();

            // Calculate and display stats
            if (pitchPoints.length > 10) {
                const avgGender = pitchPoints.reduce((sum, p) => sum + p.genderScore, 0) / pitchPoints.length;
                const avgPitch = pitchPoints.reduce((sum, p) => sum + p.pitch, 0) / pitchPoints.length;
                setStats({ avgGender, avgPitch });
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            'gender-timeline',
            loop,
            renderCoordinator.PRIORITY.NORMAL
        );

        return () => unsubscribe();
    }, [duration, colorBlindMode, dataRef]);

    return (
        <div className="w-full h-full flex flex-col">
            <canvas
                ref={canvasRef}
                className="w-full flex-1 rounded-xl"
                style={{ minHeight: 200 }}
            />

            {/* Legend and Stats */}
            <div className="flex justify-between items-center mt-2 px-2">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                        <span className="text-slate-400">Masculine</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-purple-500" />
                        <span className="text-slate-400">Ambiguous</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-pink-500" />
                        <span className="text-slate-400">Feminine</span>
                    </div>
                </div>

                {stats && (
                    <div className="text-xs text-slate-400">
                        Avg: <span
                            className="font-bold"
                            style={{ color: getPerceptionColor(stats.avgGender, colorBlindMode) }}
                        >
                            {stats.avgGender < 0.4 ? 'Masc' : stats.avgGender > 0.6 ? 'Fem' : 'Ambig'}
                        </span>
                        {' | '}
                        <span className="text-teal-400 font-mono">{Math.round(stats.avgPitch)} Hz</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenderTimeline;
