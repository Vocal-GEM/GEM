import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Activity, Maximize2, Minimize2, Info } from 'lucide-react';

// --- Geometry Helpers ---

// Monotone Chain Convex Hull Algorithm
const calculateConvexHull = (points) => {
    if (points.length < 3) return points;

    // Sort by x, then y
    points.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);

    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

    const lower = [];
    for (let p of points) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
};

// Polygon Area (Shoelace Formula)
const calculatePolygonArea = (points) => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i][0] * points[j][1];
        area -= points[j][0] * points[i][1];
    }
    return Math.abs(area) / 2;
};

const VoiceRangeProfile = ({ sessions = [], targetRange }) => {
    const canvasRef = useRef(null);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    // Configuration
    const config = {
        minPitch: 50,
        maxPitch: 400,
        minIntensity: 30, // dB
        maxIntensity: 100, // dB
        pitchBins: 50,
        intensityBins: 40
    };

    // 1. Process Data into 2D Histogram
    const { grid, points, bounds, hull } = useMemo(() => {
        const grid = new Array(config.pitchBins).fill(0).map(() => new Array(config.intensityBins).fill(0));
        const points = [];
        let minP = Infinity, maxP = -Infinity, minI = Infinity, maxI = -Infinity;

        sessions.forEach(session => {
            // Handle different session formats (array of frames or object with frames)
            const frames = Array.isArray(session) ? session : (session.frames || []);

            frames.forEach(frame => {
                const pitch = frame.pitch;
                const intensity = frame.volume ? frame.volume * 100 : frame.intensity; // Normalize volume if needed

                if (pitch > config.minPitch && pitch < config.maxPitch && intensity > config.minIntensity) {
                    // Map to bin
                    const pIdx = Math.floor((pitch - config.minPitch) / (config.maxPitch - config.minPitch) * config.pitchBins);
                    const iIdx = Math.floor((intensity - config.minIntensity) / (config.maxIntensity - config.minIntensity) * config.intensityBins);

                    if (pIdx >= 0 && pIdx < config.pitchBins && iIdx >= 0 && iIdx < config.intensityBins) {
                        grid[pIdx][iIdx]++;
                        points.push([pitch, intensity]);

                        minP = Math.min(minP, pitch);
                        maxP = Math.max(maxP, pitch);
                        minI = Math.min(minI, intensity);
                        maxI = Math.max(maxI, intensity);
                    }
                }
            });
        });

        // Calculate Hull
        // Downsample points for hull calculation if too many (performance)
        const hullPoints = points.length > 1000 ? points.filter((_, i) => i % 5 === 0) : points;
        const hull = calculateConvexHull(hullPoints);

        return {
            grid,
            points,
            bounds: { minP, maxP, minI, maxI },
            hull
        };
    }, [sessions]);

    // 2. Draw Visualization
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphW = width - padding * 2;
        const graphH = height - padding * 2;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Helper: Map Data to Pixel
        const mapX = (pitch) => padding + ((pitch - config.minPitch) / (config.maxPitch - config.minPitch)) * graphW;
        const mapY = (intensity) => height - padding - ((intensity - config.minIntensity) / (config.maxIntensity - config.minIntensity)) * graphH;

        // Draw Grid / Axes
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 1;
        ctx.beginPath();
        // X-Axis (Pitch)
        for (let p = config.minPitch; p <= config.maxPitch; p += 50) {
            const x = mapX(p);
            ctx.moveTo(x, height - padding);
            ctx.lineTo(x, padding);
            ctx.fillStyle = '#94a3b8'; // slate-400
            ctx.font = '10px sans-serif';
            ctx.fillText(`${p}Hz`, x - 10, height - padding + 15);
        }
        // Y-Axis (Intensity)
        for (let i = config.minIntensity; i <= config.maxIntensity; i += 10) {
            const y = mapY(i);
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`${i}dB`, 5, y + 3);
        }
        ctx.stroke();

        // Draw Target Zone (if provided)
        if (targetRange) {
            const x1 = mapX(targetRange.min);
            const x2 = mapX(targetRange.max);
            ctx.fillStyle = 'rgba(45, 212, 191, 0.1)'; // teal-400 low opacity
            ctx.fillRect(x1, padding, x2 - x1, graphH);
            ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
            ctx.strokeRect(x1, padding, x2 - x1, graphH);

            ctx.fillStyle = '#2dd4bf';
            ctx.fillText('Target', x1 + 5, padding + 15);
        }

        // Draw Heatmap
        const binW = graphW / config.pitchBins;
        const binH = graphH / config.intensityBins;

        // Find max count for normalization
        let maxCount = 0;
        grid.forEach(row => row.forEach(c => maxCount = Math.max(maxCount, c)));

        for (let x = 0; x < config.pitchBins; x++) {
            for (let y = 0; y < config.intensityBins; y++) {
                const count = grid[x][y];
                if (count > 0) {
                    const intensity = count / maxCount;
                    // Viridis-like: Purple -> Blue -> Green -> Yellow
                    // Simple: Blue -> Cyan -> White
                    const alpha = 0.2 + intensity * 0.8;
                    ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`; // sky-400

                    const px = padding + x * binW;
                    const py = height - padding - (y + 1) * binH;
                    ctx.fillRect(px, py, binW + 1, binH + 1); // +1 to avoid gaps
                }
            }
        }

        // Draw Convex Hull
        if (hull.length > 0) {
            ctx.beginPath();
            ctx.moveTo(mapX(hull[0][0]), mapY(hull[0][1]));
            for (let i = 1; i < hull.length; i++) {
                ctx.lineTo(mapX(hull[i][0]), mapY(hull[i][1]));
            }
            ctx.closePath();
            ctx.strokeStyle = '#f472b6'; // pink-400
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(244, 114, 182, 0.1)';
            ctx.fill();
        }

        // Draw Labels
        ctx.fillStyle = '#f472b6';
        ctx.font = '12px sans-serif';
        if (hull.length > 0) {
            // Label near the top of the hull
            const topPoint = hull.reduce((a, b) => a[1] > b[1] ? a : b);
            ctx.fillText('Voice Range', mapX(topPoint[0]), mapY(topPoint[1]) - 10);
        }

    }, [grid, hull, targetRange]);

    // Metrics
    const area = useMemo(() => calculatePolygonArea(hull), [hull]);
    const dynamicRange = bounds.maxI - bounds.minI;
    const pitchRange = bounds.maxP - bounds.minP;

    return (
        <div className="w-full bg-slate-900/50 rounded-xl border border-white/10 p-4 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="text-teal-400" size={18} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Voice Range Profile</h3>
                </div>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <Info size={16} />
                </button>
            </div>

            {showInfo && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                    This chart maps your voice capabilities. The horizontal axis is Pitch (Hz), and the vertical axis is Volume (dB). The shaded area represents your "Voice Space" - the range of pitches and volumes you can comfortably produce.
                </div>
            )}

            <div className="relative aspect-[16/9] w-full bg-slate-950/50 rounded-lg border border-white/5 mb-4">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    className="w-full h-full"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Dynamic Range</div>
                    <div className="text-lg font-bold text-white">
                        {isFinite(dynamicRange) ? dynamicRange.toFixed(1) : 0} <span className="text-xs text-slate-500 font-normal">dB</span>
                    </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Pitch Range</div>
                    <div className="text-lg font-bold text-white">
                        {isFinite(pitchRange) ? pitchRange.toFixed(0) : 0} <span className="text-xs text-slate-500 font-normal">Hz</span>
                    </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Voice Area</div>
                    <div className="text-lg font-bold text-white">
                        {area.toFixed(0)} <span className="text-xs text-slate-500 font-normal">units</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceRangeProfile;
