import { useEffect, useRef, useState, useId } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useAudio } from '../../context/AudioContext';

const LTASPlot = ({ width = 600, height = 300 }) => {
    const { dataRef } = useAudio();
    const canvasRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const accumulatorRef = useRef(null);
    const frameCountRef = useRef(0);
    const componentId = useId();

    // Lazy initialization
    if (!accumulatorRef.current) {
        accumulatorRef.current = new Float32Array(1024).fill(0);
    }

    useEffect(() => {
        const draw = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;

            // Get current spectrum
            const spectrum = dataRef.current?.spectrum;

            // Accumulate if recording
            if (isRecording && spectrum && spectrum.length > 0) {
                if (!accumulatorRef.current || accumulatorRef.current.length !== spectrum.length) {
                    accumulatorRef.current = new Float32Array(spectrum.length).fill(0);
                }
                for (let i = 0; i < spectrum.length; i++) {
                    accumulatorRef.current[i] += spectrum[i];
                }
                frameCountRef.current += 1;
            }

            // Draw Background
            ctx.fillStyle = '#0f172a'; // slate-950
            ctx.fillRect(0, 0, w, h);

            // Draw Grid (Log Frequency Scale approximation)
            ctx.strokeStyle = '#334155'; // slate-700
            ctx.lineWidth = 1;
            ctx.beginPath();
            [500, 1000, 2000, 4000, 8000].forEach(freq => {
                const x = (Math.log10(freq) - 1.5) / 3 * w; // Very rough mapping
                if (x > 0 && x < w) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                }
            });
            ctx.stroke();

            // Draw Current Spectrum (faded)
            if (spectrum && spectrum.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'; // slate-400
                ctx.lineWidth = 1;
                for (let i = 0; i < spectrum.length; i++) {
                    const x = (i / spectrum.length) * w; // Linear for now
                    const y = h - (Math.max(0, spectrum[i] + 100) / 100) * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Draw LTAS (Accumulated average)
            if (frameCountRef.current > 0 && accumulatorRef.current) {
                ctx.beginPath();
                ctx.strokeStyle = '#38bdf8'; // sky-400
                ctx.lineWidth = 2;
                for (let i = 0; i < accumulatorRef.current.length; i++) {
                    const avg = accumulatorRef.current[i] / frameCountRef.current;
                    const x = (i / accumulatorRef.current.length) * w;
                    const y = h - (Math.max(0, avg + 100) / 100) * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            draw,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => unsubscribe();
    }, [isRecording, dataRef, componentId]);

    const reset = () => {
        if (accumulatorRef.current) {
            accumulatorRef.current.fill(0);
        }
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
