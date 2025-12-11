import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../../context/AudioContext';

const LTASPlot = ({ width = 600, height = 300 }) => {
    const { dataRef, isAudioActive } = useAudio();
    const canvasRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const accumulatorRef = useRef(new Float32Array(1024).fill(0)); // Assuming 1024 bins from AudioEngine
    const frameCountRef = useRef(0);

    useEffect(() => {
        let animationId;

        const draw = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;

            // Get current spectrum
            const spectrum = dataRef.current?.spectrum;

            // Accumulate if recording
            if (isRecording && spectrum && spectrum.length > 0) {
                if (accumulatorRef.current.length !== spectrum.length) {
                    accumulatorRef.current = new Float32Array(spectrum.length).fill(0);
                    frameCountRef.current = 0;
                }

                for (let i = 0; i < spectrum.length; i++) {
                    accumulatorRef.current[i] += spectrum[i];
                }
                frameCountRef.current++;
            }

            // Clear
            ctx.fillStyle = '#0f172a'; // Slate 950
            ctx.fillRect(0, 0, w, h);

            // Grid
            ctx.strokeStyle = '#1e293b';
            ctx.beginPath();
            for (let i = 0; i < w; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, h); }
            for (let i = 0; i < h; i += 50) { ctx.moveTo(0, i); ctx.lineTo(w, i); }
            ctx.stroke();

            // Draw LTAS Curve
            if (frameCountRef.current > 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#fbbf24'; // Amber 400
                ctx.lineWidth = 2;

                const len = accumulatorRef.current.length;
                // Only plot up to Nyquist/2 or relevant range (e.g. 0-8kHz)
                // Assuming spectrum is 0-Nyquist.

                for (let i = 0; i < len; i++) {
                    const avgMag = accumulatorRef.current[i] / frameCountRef.current;
                    // Convert to dB for display: 20 * log10(mag)
                    // Normalize to fit canvas height (approx -100dB to 0dB)
                    const db = 20 * Math.log10(avgMag + 0.00001);

                    // Map dB to Y (0dB = top, -100dB = bottom)
                    const y = h - ((db + 100) / 100) * h;
                    const x = (i / len) * w;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Draw Live Spectrum (Ghost)
            if (spectrum && spectrum.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'; // Slate 400 low opacity
                ctx.lineWidth = 1;
                for (let i = 0; i < spectrum.length; i++) {
                    const db = 20 * Math.log10(spectrum[i] + 0.00001);
                    const y = h - ((db + 100) / 100) * h;
                    const x = (i / spectrum.length) * w;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isRecording]);

    const reset = () => {
        accumulatorRef.current.fill(0);
        frameCountRef.current = 0;
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                <canvas ref={canvasRef} width={width} height={height} className="w-full h-full bg-slate-950" />
                <div className="absolute top-2 left-2 text-xs text-amber-400 font-mono">Long-Term Average Spectrum (LTAS)</div>
                <div className="absolute bottom-2 right-2 text-xs text-slate-500">Frequency (Hz) →</div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${isRecording ? 'bg-rose-500 text-white' : 'bg-teal-500 text-white'}`}
                >
                    {isRecording ? 'Stop Integration' : 'Start Integration'}
                </button>
                <button
                    onClick={reset}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default LTASPlot;
