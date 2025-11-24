import React, { useRef, useEffect } from 'react';

const PitchTrace = ({ data, targetRange, currentTime, duration }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || data.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Define scales
        const minFreq = 50;
        const maxFreq = 400;
        const timeScale = width / duration;
        const freqScale = height / (maxFreq - minFreq);

        // Helper to map frequency to Y (inverted)
        const getY = (freq) => height - ((freq - minFreq) * freqScale);

        // Draw Target Range
        if (targetRange) {
            const yMin = getY(targetRange.min);
            const yMax = getY(targetRange.max);

            ctx.fillStyle = 'rgba(74, 222, 128, 0.1)'; // Green-400 with opacity
            ctx.fillRect(0, yMax, width, yMin - yMax);

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
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < data.length; i++) {
            const p1 = data[i - 1];
            const p2 = data[i];

            if (!p1.frequency || !p2.frequency) continue;

            const x1 = p1.time * timeScale;
            const y1 = getY(p1.frequency);
            const x2 = p2.time * timeScale;
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

            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Draw Playback Cursor
        if (currentTime !== undefined) {
            const cursorX = currentTime * timeScale;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cursorX, 0);
            ctx.lineTo(cursorX, height);
            ctx.stroke();
        }

    }, [data, targetRange, currentTime, duration]);

    return (
        <div className="w-full h-48 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
            <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-full"
            />
            <div className="absolute top-2 left-2 text-xs text-slate-500">
                Pitch (Hz)
            </div>
        </div>
    );
};

export default PitchTrace;
