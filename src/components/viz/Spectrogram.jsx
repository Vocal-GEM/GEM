import React, { useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';

const Spectrogram = ({ height = 200, showLabels = true }) => {
    const canvasRef = useRef(null);
    const { dataRef, isAudioActive } = useAudio();
    const requestRef = useRef();

    // Spectrogram State
    const speed = 2; // Pixels per frame

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const h = canvas.height;

        // 1. Shift existing image to the left
        // We use drawImage to move the canvas content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, h);

        // Draw shifted image
        ctx.drawImage(tempCanvas, -speed, 0);

        // 2. Draw new column at the right edge
        const spectrum = dataRef.current.spectrum; // Float32Array (0-255 or similar depending on FFT)
        if (spectrum && spectrum.length > 0) {
            const numBins = spectrum.length;
            // We only care about 0-8kHz usually. 
            // If sample rate is 44.1k, Nyquist is 22k. 
            // 512 bins -> ~43Hz per bin. 
            // 8000Hz / 43 = ~186 bins.
            const maxBin = Math.min(numBins, 200);

            for (let i = 0; i < maxBin; i++) {
                const value = spectrum[i]; // Magnitude
                // Map magnitude to color
                // Assuming magnitude is roughly 0-100 (dB-ish) or linear amplitude
                // Let's assume linear 0-1 for now, or check AudioEngine.
                // AudioEngine uses simpleFFT returning magnitude.

                // Normalize roughly. 
                const intensity = Math.min(255, value * 5000); // Scale factor might need tuning

                // Heatmap: 
                // Low: Blue (0,0,255)
                // Mid: Red (255,0,0)
                // High: Yellow (255,255,0)

                let r = 0, g = 0, b = 0;
                if (intensity < 128) {
                    // Blue to Red
                    b = 255 - (intensity * 2);
                    r = intensity * 2;
                } else {
                    // Red to Yellow
                    r = 255;
                    g = (intensity - 128) * 2;
                }

                ctx.fillStyle = `rgb(${r},${g},${b})`;

                // Draw a block for this frequency bin
                // Y-axis is frequency (low at bottom)
                const y = h - (i / maxBin) * h;
                const binHeight = h / maxBin;

                ctx.fillRect(width - speed, y - binHeight, speed, binHeight + 1);
            }
        }

        requestRef.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        if (isAudioActive) {
            requestRef.current = requestAnimationFrame(draw);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isAudioActive]);

    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-inner">
            <canvas
                ref={canvasRef}
                width={600}
                height={height}
                className="w-full h-full"
            />
            {showLabels && (
                <div className="absolute left-2 top-2 text-xs text-white/50 font-mono pointer-events-none">
                    <div>8kHz</div>
                </div>
            )}
            {showLabels && (
                <div className="absolute left-2 bottom-2 text-xs text-white/50 font-mono pointer-events-none">
                    <div>0Hz</div>
                </div>
            )}
        </div>
    );
};

export default Spectrogram;
