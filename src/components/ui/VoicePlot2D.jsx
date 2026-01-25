/**
 * VoicePlot2D
 * 
 * 2D Visualization of Pitch (Y) vs Resonance (X)
 * Based on research showing gender perception clusters in this 2D space.
 * 
 * Top-Right (High Pitch/High Resonance) -> Feminine (Pink)
 * Bottom-Left (Low Pitch/Low Resonance) -> Masculine (Blue)
 * Center -> Androgynous (Purple/Grey)
 * 
 * Features:
 * - Heatmap background indicating gender zones
 * - Live cursor showing current voice position
 * - Trajectory trail showing recent history
 * - Statistic overlay (Mean/Median/StdDev)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const VoicePlot2D = ({
    pitch,          // Current pitch in Hz
    resonance,      // Current resonance (avg formant) in Hz
    history = [],   // Array of { pitch, resonance } points for trail
    width = 600,
    height = 400,
    showStats = true,
    stats = null,   // { mean, median, stdev }
    className = ''
}) => {
    const canvasRef = useRef(null);

    // Configuration for axis ranges
    // Pitch: 50Hz - 300Hz (covers diverse masculine to feminine range)
    // Resonance: 500Hz - 2500Hz (approximate range for R1/Avg Formant)
    const config = useMemo(() => ({
        minPitch: 50,
        maxPitch: 350,
        minRes: 500,
        maxRes: 2500,
        padding: 40
    }), []);

    // Draw the plot
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { minPitch, maxPitch, minRes, maxRes, padding } = config;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Gradient Background (Gender Zones)
        // Create diagonal gradient: Bottom-Left (Masc) -> Top-Right (Fem)
        const gradient = ctx.createLinearGradient(
            padding, height - padding,
            width - padding, padding
        );

        // Colors derived from HSL perception space
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');   // Blue/Masc (Low/Low)
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');  // Purple/Andro (Mid)
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.15)');   // Pink/Fem (High/High)

        ctx.fillStyle = gradient;
        ctx.fillRect(padding, padding, graphWidth, graphHeight);

        // 2. Draw Grid & Axes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Horizontal lines (Pitch)
        for (let p = 100; p <= 300; p += 50) {
            const y = height - padding - ((p - minPitch) / (maxPitch - minPitch)) * graphHeight;
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);

            // Label
            ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText(`${p}Hz`, 5, y + 3);
        }

        // Vertical lines (Resonance)
        for (let r = 1000; r <= 2000; r += 500) {
            const x = padding + ((r - minRes) / (maxRes - minRes)) * graphWidth;
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);

            // Label
            ctx.fillText(`${r}Hz`, x - 15, height - 10);
        }
        ctx.stroke();

        // Axis Labels
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Pitch (Hz)', -20, 0); // Vertical text
        ctx.restore();

        ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
        ctx.fillText('Resonance (Avg Formant)', width / 2 - 60, height - 5);

        // 3. Draw Trajectory Trail
        if (history.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;

            history.forEach((point, i) => {
                if (!point.pitch || !point.resonance) return;

                // Map to coordinates
                const x = padding + ((point.resonance - minRes) / (maxRes - minRes)) * graphWidth;
                const y = height - padding - ((point.pitch - minPitch) / (maxPitch - minPitch)) * graphHeight;

                // Clamp to graph area
                const clampedX = Math.max(padding, Math.min(width - padding, x));
                const clampedY = Math.max(padding, Math.min(height - padding, y));

                if (i === 0) ctx.moveTo(clampedX, clampedY);
                else ctx.lineTo(clampedX, clampedY);
            });
            ctx.stroke();
        }

        // 4. Draw Current Point
        if (pitch && resonance) {
            const x = padding + ((resonance - minRes) / (maxRes - minRes)) * graphWidth;
            const y = height - padding - ((pitch - minPitch) / (maxPitch - minPitch)) * graphHeight;

            // Check bounds
            if (pitch >= minPitch && pitch <= maxPitch && resonance >= minRes && resonance <= maxRes) {
                // Outer glow
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(250, 204, 21, 0.4)'; // Yellow glow
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#facc15'; // Yellow core
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
            }
        }

        // 5. Draw Target Zones (Optional reference lines)
        // Feminine Threshold (170Hz)
        const femY = height - padding - ((170 - minPitch) / (maxPitch - minPitch)) * graphHeight;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)'; // Pink dashed
        ctx.setLineDash([5, 5]);
        ctx.moveTo(padding, femY);
        ctx.lineTo(width - padding, femY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
        ctx.fillText('Fem Threshold (170Hz)', width - padding - 120, femY - 5);

    }, [pitch, resonance, history, width, height, config]);

    return (
        <div className={`voice-plot-2d relative bg-slate-900 rounded-xl border border-slate-800 p-2 ${className}`}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full h-full"
            />
            {showStats && stats && (
                <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs shadow-lg">
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-right">
                        <div className="font-semibold text-slate-400 text-left">Metric</div>
                        <div className="font-semibold text-slate-400">Mean</div>
                        <div className="font-semibold text-slate-400">StdDev*</div>

                        <div className="text-slate-300 text-left">Pitch</div>
                        <div className="font-mono text-emerald-400">{stats.mean}Hz</div>
                        <div className="font-mono text-blue-400">{stats.stdev}Hz</div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 max-w-[180px] leading-tight">
                        *Higher pitch variability (std dev) is often associated with feminine speech patterns.
                    </div>
                </div>
            )}
        </div>
    );
};

VoicePlot2D.propTypes = {
    pitch: PropTypes.number,
    resonance: PropTypes.number,
    history: PropTypes.arrayOf(PropTypes.shape({
        pitch: PropTypes.number,
        resonance: PropTypes.number
    })),
    width: PropTypes.number,
    height: PropTypes.number,
    showStats: PropTypes.bool,
    stats: PropTypes.shape({
        mean: PropTypes.number,
        median: PropTypes.number,
        stdev: PropTypes.number
    }),
    className: PropTypes.string
};

export default VoicePlot2D;
