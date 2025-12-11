/**
 * FileSpectrogram - Static spectrogram visualization for uploaded audio files
 * Renders a complete spectrogram from an AudioBuffer with playback cursor synchronization
 */
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { generateColormap } from '../../utils/colormaps';


const FileSpectrogram = ({
    audioBuffer,
    currentTime = 0,
    duration = 0,
    onSeek
}) => {
    const canvasRef = useRef(null);
    const spectrogramDataRef = useRef(null);
    const { settings } = useSettings();

    // Dynamic colormap based on settings
    const colormap = useMemo(
        () => generateColormap(settings.spectrogramColorScheme),
        [settings.spectrogramColorScheme]
    );

    // Configuration
    const FFT_SIZE = 2048;
    const HOP_SIZE = 512; // Overlap for smoother spectrogram
    const MAX_FREQ = 8000; // Display up to 8kHz

    /**
     * Generate spectrogram data from AudioBuffer
     * This runs once when audioBuffer changes
     */
    const generateSpectrogramData = useCallback((buffer) => {
        if (!buffer) return null;

        const sampleRate = buffer.sampleRate;
        const channelData = buffer.getChannelData(0);
        const numFrames = Math.floor((channelData.length - FFT_SIZE) / HOP_SIZE) + 1;

        // Calculate number of bins to display (0 to MAX_FREQ)
        const nyquist = sampleRate / 2;
        const binsPerHz = (FFT_SIZE / 2) / nyquist;
        const maxBin = Math.min(FFT_SIZE / 2, Math.ceil(MAX_FREQ * binsPerHz));

        // Create offline audio context for FFT
        const offlineCtx = new OfflineAudioContext(1, buffer.length, sampleRate);
        const analyser = offlineCtx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0;

        // Store spectrogram as 2D array [time][frequency]
        const spectrogram = [];
        const fftBuffer = new Float32Array(FFT_SIZE);
        const windowFunction = new Float32Array(FFT_SIZE);

        // Hann window
        for (let i = 0; i < FFT_SIZE; i++) {
            windowFunction[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (FFT_SIZE - 1)));
        }

        // Manual FFT processing (since OfflineAudioContext FFT is complex)
        // We'll use a simpler approach: direct DFT for each frame
        for (let frame = 0; frame < numFrames; frame++) {
            const offset = frame * HOP_SIZE;

            // Apply window
            for (let i = 0; i < FFT_SIZE; i++) {
                if (offset + i < channelData.length) {
                    fftBuffer[i] = channelData[offset + i] * windowFunction[i];
                } else {
                    fftBuffer[i] = 0;
                }
            }

            // Compute magnitude spectrum using simple DFT
            // For performance, we only compute up to maxBin
            const magnitudes = new Float32Array(maxBin);

            for (let k = 0; k < maxBin; k++) {
                let real = 0, imag = 0;
                for (let n = 0; n < FFT_SIZE; n++) {
                    const angle = -2 * Math.PI * k * n / FFT_SIZE;
                    real += fftBuffer[n] * Math.cos(angle);
                    imag += fftBuffer[n] * Math.sin(angle);
                }
                // Magnitude in dB
                const magnitude = Math.sqrt(real * real + imag * imag) / FFT_SIZE;
                // Convert to dB with floor
                const db = 20 * Math.log10(magnitude + 1e-10);
                // Normalize to 0-255 range (-100dB to -20dB typical range)
                magnitudes[k] = Math.max(0, Math.min(255, (db + 100) * 3.2));
            }

            spectrogram.push(magnitudes);
        }

        return {
            data: spectrogram,
            numFrames,
            maxBin,
            sampleRate,
            duration: buffer.duration
        };
    }, [FFT_SIZE, HOP_SIZE, MAX_FREQ]);

    // Generate spectrogram when buffer changes
    useEffect(() => {
        if (audioBuffer) {
            spectrogramDataRef.current = generateSpectrogramData(audioBuffer);
            renderSpectrogram();
        }
    }, [audioBuffer, generateSpectrogramData]);

    // Re-render when colormap changes
    useEffect(() => {
        if (spectrogramDataRef.current) {
            renderSpectrogram();
        }
    }, [colormap]);

    // Render playhead on time change
    useEffect(() => {
        renderPlayhead();
    }, [currentTime]);

    /**
     * Render the full spectrogram to canvas
     */
    const renderSpectrogram = useCallback(() => {
        const canvas = canvasRef.current;
        const data = spectrogramDataRef.current;
        if (!canvas || !data) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const { data: spectrogram, numFrames, maxBin } = data;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw spectrogram
        const pixelWidth = width / numFrames;
        const pixelHeight = height / maxBin;

        for (let frame = 0; frame < numFrames; frame++) {
            const x = frame * pixelWidth;
            const magnitudes = spectrogram[frame];

            for (let bin = 0; bin < maxBin; bin++) {
                const intensity = magnitudes[bin];
                if (intensity > 10) { // Threshold
                    const color = colormap[Math.floor(intensity)];

                    // Extract RGB from packed color
                    const r = color & 0xFF;
                    const g = (color >> 8) & 0xFF;
                    const b = (color >> 16) & 0xFF;

                    ctx.fillStyle = `rgb(${r},${g},${b})`;

                    // Y axis: low freq at bottom, high at top
                    const y = height - (bin / maxBin) * height;
                    ctx.fillRect(x, y - pixelHeight, Math.ceil(pixelWidth), Math.ceil(pixelHeight));
                }
            }
        }

        // Draw frequency axis labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px sans-serif';
        const freqLabels = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
        freqLabels.forEach(freq => {
            const y = height * (1 - freq / MAX_FREQ);
            ctx.fillText(`${freq < 1000 ? freq : freq / 1000 + 'k'}`, 4, y + 3);
        });

        // Draw time axis labels
        const timeStep = Math.ceil(data.duration / 5);
        for (let t = 0; t <= data.duration; t += timeStep) {
            const x = (t / data.duration) * width;
            ctx.fillText(`${t.toFixed(1)}s`, x, height - 4);
        }

        // Render initial playhead
        renderPlayhead();
    }, [colormap, MAX_FREQ]);

    /**
     * Render playhead line
     */
    const renderPlayhead = useCallback(() => {
        const canvas = canvasRef.current;
        const data = spectrogramDataRef.current;
        if (!canvas || !data || !duration) return;

        const ctx = canvas.getContext('2d');

        // We need to redraw the spectrogram portion under the playhead area
        // For efficiency, just draw the playhead on top
        const x = (currentTime / duration) * canvas.width;

        // Save and restore to only clear the playhead area
        // For simplicity, we'll just redraw the full spectrogram each time
        // This could be optimized with double buffering

        // Draw playhead line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw playhead handle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - 6, 0);
        ctx.lineTo(x + 6, 0);
        ctx.lineTo(x, 10);
        ctx.closePath();
        ctx.fill();
    }, [currentTime, duration]);

    /**
     * Handle click to seek
     */
    const handleCanvasClick = useCallback((e) => {
        if (!onSeek || !duration) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const seekTime = (x / rect.width) * duration;

        onSeek(Math.max(0, Math.min(duration, seekTime)));
    }, [onSeek, duration]);

    // Show loading state if no buffer
    if (!audioBuffer) {
        return (
            <div className="w-full h-64 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                <p className="text-slate-500">No audio loaded</p>
            </div>
        );
    }

    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden border border-white/10">
            <canvas
                ref={canvasRef}
                width={800}
                height={256}
                className="w-full h-64 cursor-crosshair"
                onClick={handleCanvasClick}
            />

            {/* Labels */}
            <div className="absolute top-2 left-2 text-xs font-bold text-white/70 bg-black/50 px-2 rounded">
                File Spectrogram (0-8kHz)
            </div>

            {/* Time indicator */}
            <div className="absolute bottom-2 right-2 text-xs text-white/50 font-mono bg-black/50 px-2 rounded">
                {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
            </div>

            {/* Seek hint */}
            <div className="absolute top-2 right-2 text-[10px] text-white/40 bg-black/50 px-2 rounded">
                Click to seek
            </div>
        </div>
    );
};

export default FileSpectrogram;
