import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

const PitchTrace = ({ data, targetRange, currentTime, duration }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Zoom state: { tMin, tMax, fMin, fMax } or null (default)
    const [zoom, setZoom] = useState(null);

    // Selection state for drag-to-zoom
    const [selection, setSelection] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Default bounds
    const MIN_FREQ_DEFAULT = 50;
    const MAX_FREQ_DEFAULT = 400;

    // Helper to get current bounds
    const getBounds = () => {
        if (zoom) return zoom;
        return {
            tMin: 0,
            tMax: duration || 10,
            fMin: MIN_FREQ_DEFAULT,
            fMax: MAX_FREQ_DEFAULT
        };
    };

    const bounds = getBounds();

    // Coordinate Transforms
    const getPointFromEvent = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    // Drawing Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (!data || data.length === 0) return;

        // Current Projection Scales
        const timeRange = bounds.tMax - bounds.tMin;
        const freqRange = bounds.fMax - bounds.fMin;

        const timeScale = width / timeRange;
        const freqScale = height / freqRange;

        const getX = (t) => (t - bounds.tMin) * timeScale;
        const getY = (f) => height - ((f - bounds.fMin) * freqScale);

        // Draw Target Range
        if (targetRange) {
            const yMin = getY(targetRange.min);
            const yMax = getY(targetRange.max);

            ctx.fillStyle = 'rgba(74, 222, 128, 0.1)'; // Green-400 with opacity

            // Fill rect needs valid coordinates. 
            // Note: yMin corresponds to targetRange.min (lower freq, higher Y pixel)
            // yMax corresponds to targetRange.max (higher freq, lower Y pixel)

            // We want to fill between yMax and yMin.
            // Canvas fills from x, y, w, h. 
            // Using Math.min/max handles the direction correctly.
            ctx.fillRect(0, Math.min(yMin, yMax), width, Math.abs(yMin - yMax));

            // Draw target lines
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(0, yMin);
            ctx.lineTo(width, yMin);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, yMax);
            ctx.lineTo(width, yMax);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw Pitch Trace
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Filter and Draw Segments
        // We only draw lines if they are visible or crossing the view

        ctx.beginPath();
        let isDrawing = false;

        for (let i = 1; i < data.length; i++) {
            const p1 = data[i - 1];
            const p2 = data[i];

            if (!p1.frequency || !p2.frequency) {
                isDrawing = false;
                continue;
            }

            // Optimization: Skip if completely out of horizontal view
            if (p2.time < bounds.tMin || p1.time > bounds.tMax) continue;

            const x1 = getX(p1.time);
            const y1 = getY(p1.frequency);
            const x2 = getX(p2.time);
            const y2 = getY(p2.frequency);

            // Determine color based on target
            let color = '#ef4444'; // Red default
            if (targetRange) {
                const avgFreq = (p1.frequency + p2.frequency) / 2;
                if (avgFreq >= targetRange.min && avgFreq <= targetRange.max) {
                    color = '#4ade80'; // Green
                } else if (
                    (avgFreq >= targetRange.min * 0.9 && avgFreq < targetRange.min) ||
                    (avgFreq > targetRange.max && avgFreq <= targetRange.max * 1.1)
                ) {
                    color = '#facc15'; // Yellow
                }
            }

            // Because we want per-segment coloring, we must stroke each segment individually
            // or batch them by color. For simplicity/correctness of gradient transition 
            // in this specific "color by target" logic, stroking individually is easiest 
            // though less performant. Given data size (~seconds of audio), it's fine.

            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Draw Playback Cursor
        if (currentTime !== undefined) {
            // Only draw if within current view
            if (currentTime >= bounds.tMin && currentTime <= bounds.tMax) {
                const cursorX = getX(currentTime);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cursorX, 0);
                ctx.lineTo(cursorX, height);
                ctx.stroke();
            }
        }

        // Draw Selection Box
        if (selection) {
            const { start, current } = selection;
            const x = Math.min(start.x, current.x);
            const y = Math.min(start.y, current.y);
            const w = Math.abs(current.x - start.x);
            const h = Math.abs(current.y - start.y);

            ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; // Sky blue low opacity
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
            ctx.lineWidth = 1;

            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);
        }

    }, [data, targetRange, currentTime, duration, zoom, selection]);


    // Interaction Handlers
    const handleStart = (e) => {
        // Prevent default only for touch to stop scrolling
        if (e.type === 'touchstart') {
            // e.preventDefault(); // Passive listener issue in React 18 usually. 
            // We'll handle via CSS touch-action: none
        }

        const pt = getPointFromEvent(e);
        setSelection({ start: pt, current: pt });
        setIsDragging(true);
    };

    const handleMove = (e) => {
        if (!isDragging || !selection) return;
        const pt = getPointFromEvent(e);
        setSelection(prev => ({ ...prev, current: pt }));
    };

    const handleEnd = () => {
        if (!isDragging || !selection) return;
        setIsDragging(false);

        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        const start = selection.start;
        const end = selection.current;

        // Calculate box
        const xMin = Math.min(start.x, end.x);
        const xMax = Math.max(start.x, end.x);
        const yMin = Math.min(start.y, end.y); // Pixel coordinates (0 at top)
        const yMax = Math.max(start.y, end.y);

        // Minimum drag threshold to avoid clicks
        if (xMax - xMin < 10 || yMax - yMin < 10) {
            setSelection(null);
            return;
        }

        // Convert Pixels to Value Domain based on CURRENT zoom
        // Current scale factors
        const timeRange = bounds.tMax - bounds.tMin;
        const freqRange = bounds.fMax - bounds.fMin;
        const timeScale = width / timeRange;
        const freqScale = height / freqRange;

        // Inverse mapping
        // x = (t - tMin) * timeScale  =>  t = x / timeScale + tMin
        // y = height - ((f - fMin) * freqScale) => (height - y) = (f - fMin) * freqScale => f = (height - y) / freqScale + fMin

        const newTMin = (xMin / timeScale) + bounds.tMin;
        const newTMax = (xMax / timeScale) + bounds.tMin;

        // Note: Y pixel increases downwards. 
        // yMin (top pixel) corresponds to Higher Frequency
        // yMax (bottom pixel) corresponds to Lower Frequency
        const newFMax = (height - yMin) / freqScale + bounds.fMin;
        const newFMin = (height - yMax) / freqScale + bounds.fMin;

        setZoom({
            tMin: Math.max(0, newTMin),
            tMax: Math.min(duration || 10, newTMax),
            fMin: Math.max(0, newFMin), // Clamp > 0
            fMax: newFMax
        });

        setSelection(null);
    };

    const resetZoom = (e) => {
        e.stopPropagation();
        setZoom(null);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-48 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative touch-none select-none cursor-crosshair"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-full pointer-events-none" // Events handled by container
            />

            {/* Axis Labels (Dynamic) */}
            <div className="absolute top-2 left-2 text-xs text-slate-500 font-mono pointer-events-none">
                {Math.round(bounds.fMax)}Hz
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-slate-500 font-mono pointer-events-none">
                {Math.round(bounds.fMin)}Hz
            </div>

            {/* Undo Zoom Button */}
            {zoom && (
                <button
                    onClick={resetZoom}
                    className="absolute bottom-3 right-3 p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg shadow-lg backdrop-blur-sm border border-slate-600 transition-all active:scale-95 z-10"
                    title="Reset Zoom"
                >
                    <RotateCcw size={16} />
                </button>
            )}

            {/* Hint */}
            {!zoom && !isDragging && (
                <div className="absolute top-2 right-2 text-[10px] text-slate-600 pointer-events-none">
                    Drag to zoom
                </div>
            )}
        </div>
    );
};

export default PitchTrace;
