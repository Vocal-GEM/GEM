import React, { useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';

const Spectrogram = ({ height = 200, showLabels = true }) => {
    const canvasRef = useRef(null);
    const { dataRef, isAudioActive, audioContext } = useAudio();
    const requestRef = useRef();

    // Spectrogram State
    const speed = 2; // Pixels per frame

    // Heatmap Color Map (Deep Blue -> Cyan -> Green -> Yellow -> Red)
    // Value 0-255
    const getHeatmapColor = (value) => {
        const normalized = value / 255;
        let r = 0, g = 0, b = 0;

        if (normalized < 0.2) {
            // Dark Blue to Blue
            b = 128 + (normalized / 0.2) * 127;
        } else if (normalized < 0.4) {
            // Blue to Cyan
            g = ((normalized - 0.2) / 0.2) * 255;
            b = 255;
        } else if (normalized < 0.6) {
            // Cyan to Green
            g = 255;
            b = 255 - ((normalized - 0.4) / 0.2) * 255;
        } else if (normalized < 0.8) {
            // Green to Yellow
            r = ((normalized - 0.6) / 0.2) * 255;
            g = 255;
        } else {
            // Yellow to Red
            r = 255;
            g = 255 - ((normalized - 0.8) / 0.2) * 255;
        }

        return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current) return;

        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no alpha
        const width = canvas.width;
        const h = canvas.height;

        // 1. Shift existing image to the left
        // Optimized: Draw the canvas onto itself shifted by -speed
        ctx.drawImage(canvas, speed, 0, width - speed, h, 0, 0, width - speed, h);

        // 2. Clear the new strip at the right
        ctx.fillStyle = '#000';
        ctx.fillRect(width - speed, 0, speed, h);

        // 3. Draw new column at the right edge
        const spectrum = dataRef.current.spectrum; // Float32Array (Linear magnitude usually)
        if (spectrum && spectrum.length > 0) {

            // FFT Config
            // Assuming AudioEngine uses fftSize=2048 => 1024 bins
            // Sample rate ~44100 or 48000
            // Nyquist ~22050 or 24000

            // We want to display up to ~8000Hz (Speech range)
            // If SR=44100, 1024 bins = 21.5Hz/bin
            // 8000Hz / 21.5 = ~372 bins

            const sampleRate = audioContext?.sampleRate || 44100;
            const contextNyquist = sampleRate / 2;
            const binsTotal = spectrum.length;
            const hzPerBin = contextNyquist / binsTotal;

            const maxFreq = 8000; // Display up to 8kHz
            const maxBin = Math.min(binsTotal, Math.ceil(maxFreq / hzPerBin));

            // Logarithmic scale is often better for speech, but linear is easier to read specific harmonics
            // Let's stick to Linear Frequency Y-Axis for now as it's clearer for harmonic stacks

            for (let i = 0; i < maxBin; i++) {
                const value = spectrum[i];

                // AudioEngine spectrum is likely raw magnitude from analyser.getFloatFrequencyData (-dB) OR time domain FFT?
                // Wait, useAudio likely exposes `spectrum` from `analyser.getByteFrequencyData` (0-255) OR `getFloatFrequencyData` (-Infinity to 0ish)
                // Let's check what useAudio provides. The previous code assumed 0-255 ish logic or normalized float.
                // Assuming `dataRef.current.spectrum` is Uint8Array (0-255) if standard analyser setup, OR Float32.
                // If it's Float32 (decibels), range is -100 to -30 typically.
                // Let's handle both.

                let intensity = 0;
                if (value instanceof Float32Array || typeof value === 'number') {
                    // If it's number < 0, it's likely dB.
                    if (value < 0) {
                        // Map -100dB (silence) to 0, -30dB (loud) to 255
                        intensity = Math.max(0, Math.min(255, (value + 100) * 3.6));
                    } else {
                        // Linear 0-1
                        intensity = Math.min(255, value * 255 * 2); // Boost a bit
                    }
                } else {
                    // Assume byte 0-255
                    intensity = value;
                }

                if (intensity > 10) { // Threshold
                    ctx.fillStyle = getHeatmapColor(intensity);

                    // Linear Y mapping
                    // i=0 is 0Hz (Bottom), i=maxBin is 8kHz (Top)
                    // Wait, standard spectators usually have 0Hz at BOTTOM.
                    // Canvas Y=0 is TOP.
                    // So 0Hz (i=0) should be at Y=height.

                    const y = h - (i / maxBin) * h;
                    const binHeight = Math.max(1, h / maxBin); // Ensure at least 1px

                    ctx.fillRect(width - speed, y - binHeight, speed, binHeight);
                }
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

    // Generate Labels
    const renderLabels = () => {
        if (!showLabels) return null;
        const labels = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

        return (
            <div className="absolute inset-0 pointer-events-none select-none">
                {labels.map(hz => {
                    // 0Hz is at bottom (100%), 8000Hz is at top (0%)
                    const p = (hz / 8000) * 100;
                    const bottom = `${p}%`;

                    if (p > 100) return null;

                    return (
                        <div key={hz} className="absolute left-1 w-full border-b border-white/5 text-[9px] text-white/50 flex items-end" style={{ bottom: bottom }}>
                            <span className="bg-black/50 px-1 rounded">{hz < 1000 ? hz : `${hz / 1000}k`}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-inner group">
            <canvas
                ref={canvasRef}
                width={800} // Higher res width
                height={height}
                className="w-full h-full block"
            />
            {renderLabels()}
        </div>
    );
};

export default Spectrogram;
