import React, { useEffect, useRef } from 'react';

const HighResSpectrogram = ({ dataRef }) => {
    const canvasRef = useRef(null);
    const tempCanvasRef = useRef(null);
    const lastFormantsRef = useRef({ f1: 0, f2: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });

        // Offscreen canvas for scrolling
        if (!tempCanvasRef.current) {
            tempCanvasRef.current = document.createElement('canvas');
        }
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

        // Set dimensions
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 512; // Higher vertical resolution

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        // Generate Viridis-like Colormap (Clinical standard)
        // Dark Blue -> Green -> Yellow
        const colormap = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            const t = i / 255;
            // Simple approximation of Viridis
            // R: increasing from 0.2
            // G: increasing
            // B: decreasing then increasing?
            // Let's use a "Magma" or "Inferno" style: Black -> Purple -> Orange -> Yellow

            let r, g, b;
            if (t < 0.25) { // Black to Purple
                r = t * 4 * 100;
                g = 0;
                b = t * 4 * 150;
            } else if (t < 0.5) { // Purple to Red
                r = 100 + (t - 0.25) * 4 * 155;
                g = 0;
                b = 150 - (t - 0.25) * 4 * 100;
            } else if (t < 0.75) { // Red to Orange
                r = 255;
                g = (t - 0.5) * 4 * 128;
                b = 50;
            } else { // Orange to Yellow/White
                r = 255;
                g = 128 + (t - 0.75) * 4 * 127;
                b = 50 + (t - 0.75) * 4 * 205;
            }

            colormap[i] = (255 << 24) | (Math.floor(b) << 16) | (Math.floor(g) << 8) | Math.floor(r);
        }

        let animationId;

        const loop = () => {
            if (!dataRef.current || !dataRef.current.spectrum) {
                animationId = requestAnimationFrame(loop);
                return;
            }

            const spectrum = dataRef.current.spectrum;
            const width = canvas.width;
            const height = canvas.height;
            const scrollSpeed = 2;

            // 1. Shift existing content to left
            tempCtx.drawImage(canvas, 0, 0);
            ctx.drawImage(tempCanvas, -scrollSpeed, 0);

            // 2. Draw new column
            const imgData = ctx.createImageData(scrollSpeed, height);
            const data = new Uint32Array(imgData.data.buffer);

            // Map spectrum to column
            // Spectrum usually 1024 bins -> 24kHz
            // We want 0-8kHz displayed (typical voice range harmonics)
            // 8kHz is 1/3 of 24kHz
            const maxBin = Math.floor(spectrum.length / 3);

            for (let y = 0; y < height; y++) {
                // Map y (0 at top) to frequency bin
                // We want low freq at bottom
                const freqRatio = (height - 1 - y) / height; // 0 at bottom, 1 at top

                // Logarithmic frequency scale is better for voice
                // But linear is easier to verify formants visually
                // Let's stick to linear for now to match SpectrumAnalyzer
                const binIndex = Math.floor(freqRatio * maxBin);

                const val = spectrum[binIndex] || 0;

                // Enhance contrast
                let intensity = Math.log10(val + 1) * 60; // Boost
                intensity = Math.min(255, Math.max(0, intensity));

                const color = colormap[Math.floor(intensity)];

                for (let x = 0; x < scrollSpeed; x++) {
                    data[y * scrollSpeed + x] = color;
                }
            }

            ctx.putImageData(imgData, width - scrollSpeed, 0);

            // 3. Draw Formant Overlay (F1 & F2)
            const { f1, f2 } = dataRef.current;
            const last = lastFormantsRef.current;

            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Helper to draw formant line
            const drawFormant = (currFreq, lastFreq, color) => {
                if (currFreq > 0 && lastFreq > 0) {
                    // Map frequency to Y (0-8kHz)
                    const currY = height * (1 - currFreq / 8000);
                    const lastY = height * (1 - lastFreq / 8000);

                    // Draw line from previous position (shifted left) to current
                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    // Previous point was at (width - scrollSpeed), now at (width - 2*scrollSpeed)
                    ctx.moveTo(width - scrollSpeed * 2, lastY);
                    ctx.lineTo(width - scrollSpeed, currY);
                    ctx.stroke();
                }
            };

            // Draw F1 (Red)
            drawFormant(f1, last.f1, 'rgba(255, 50, 50, 0.9)');

            // Draw F2 (Red)
            drawFormant(f2, last.f2, 'rgba(255, 50, 50, 0.9)');

            // Update history
            lastFormantsRef.current = { f1, f2 };

            animationId = requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'high-res-spectrogram',
                loop,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    return (
        <div className="relative h-full w-full bg-black rounded-xl overflow-hidden border border-slate-800">
            <canvas ref={canvasRef} className="w-full h-full" />

            {/* Overlay Labels */}
            <div className="absolute top-2 left-2 text-xs font-bold text-white/70 bg-black/50 px-2 rounded">
                High-Res Spectrogram (0-8kHz)
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] text-white/50 font-mono">
                Time →
            </div>

            {/* Frequency Axis Labels */}
            <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[9px] text-white/50 py-2 pointer-events-none">
                <span>8k</span>
                <span>6k</span>
                <span>4k</span>
                <span>2k</span>
                <span>0</span>
            </div>
        </div>
    );
};

export default HighResSpectrogram;
