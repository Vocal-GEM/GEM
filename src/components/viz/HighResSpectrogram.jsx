import { useEffect, useRef, useMemo, useState, useCallback, memo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { generateColormap } from '../../utils/colormaps';
import { Camera, X } from 'lucide-react';
import { renderCoordinator } from '../../services/RenderCoordinator';

/**
 * Convert frequency to musical note with cents
 */
const hzToNote = (hz) => {
    if (hz <= 0) return '—';
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const midi = 12 * Math.log2(hz / 440) + 69;
    const noteIndex = Math.round(midi) % 12;
    const octave = Math.floor(Math.round(midi) / 12) - 1;
    const cents = Math.round((midi - Math.round(midi)) * 100);
    const centsStr = cents >= 0 ? `+${cents}` : `${cents}`;
    return `${noteNames[noteIndex]}${octave} (${centsStr}¢)`;
};

const MAX_FREQ = 8000;

const HighResSpectrogram = memo(({ dataRef }) => {
    const canvasRef = useRef(null);
    const lastFormantsRef = useRef({ f1: 0, f2: 0 });
    const { settings } = useSettings();

    // Reusable buffers
    const imgDataRef = useRef(null);
    const data32Ref = useRef(null);

    // Tap cursor state  
    const [cursorData, setCursorData] = useState(null);
    const [showControls, setShowControls] = useState(false);

    // Component ID for RenderCoordinator
    const componentId = useRef(`high-res-spectrogram-${Math.random().toString(36).substr(2, 9)}`).current;

    // Dynamic colormap based on settings
    const colormap = useMemo(
        () => generateColormap(settings.spectrogramColorScheme),
        [settings.spectrogramColorScheme]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Remove 'willReadFrequently: true' to allow GPU acceleration since we use drawImage(canvas)
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        // Set dimensions
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 512; // Higher vertical resolution

        const scrollSpeed = 2;
        const width = canvas.width;
        const height = canvas.height;

        // Pre-allocate buffers for the column update
        // We reuse these every frame to avoid garbage collection
        if (!imgDataRef.current || imgDataRef.current.height !== canvas.height) {
            imgDataRef.current = ctx.createImageData(scrollSpeed, canvas.height);
            data32Ref.current = new Uint32Array(imgDataRef.current.data.buffer);
        }

        const loop = () => {
            if (!dataRef.current || !dataRef.current.spectrum) {
                return;
            }

            const spectrum = dataRef.current.spectrum;

            // 1. Shift existing content to left
            // Optimization: Draw canvas onto itself instead of using an offscreen temp canvas.
            // This avoids double-copying the entire canvas (Canvas -> Temp -> Canvas).
            ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

            // 2. Draw new column
            // Use pre-allocated buffers
            const imgData = imgDataRef.current;
            const data32 = data32Ref.current;

            // Optimized: Reuse pre-allocated TypedArray
            const maxBin = Math.floor(spectrum.length / 3);

            for (let y = 0; y < height; y++) {
                const freqRatio = (height - 1 - y) / height;
                const binIndex = Math.floor(freqRatio * maxBin);
                const val = spectrum[binIndex] || 0;

                let intensity = Math.log10(val + 1) * 60;
                intensity = Math.min(255, Math.max(0, intensity));

                const color = colormap[Math.floor(intensity)];

                for (let x = 0; x < scrollSpeed; x++) {
                    data32[y * scrollSpeed + x] = color;
                }
            }

            ctx.putImageData(imgData, width - scrollSpeed, 0);

            // 3. Draw Formant Overlay (F1 & F2)
            const { f1, f2 } = dataRef.current;
            const last = lastFormantsRef.current;

            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const drawFormant = (currFreq, lastFreq, color) => {
                if (currFreq > 0 && lastFreq > 0) {
                    const currY = height * (1 - currFreq / MAX_FREQ);
                    const lastY = height * (1 - lastFreq / MAX_FREQ);
                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.moveTo(width - scrollSpeed * 2, lastY);
                    ctx.lineTo(width - scrollSpeed, currY);
                    ctx.stroke();
                }
            };

            drawFormant(f1, last.f1, 'rgba(255, 50, 50, 0.9)');
            drawFormant(f2, last.f2, 'rgba(255, 50, 50, 0.9)');
            lastFormantsRef.current = { f1, f2 };
        };

        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [dataRef, colormap, componentId]);

    /**
     * Handle canvas click - show Hz/dB/Note at tap position
     */
    const handleCanvasClick = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;

        // Map y to frequency
        const canvasY = (y / rect.height) * canvas.height;
        const freqRatio = 1 - (canvasY / canvas.height);
        const frequency = freqRatio * MAX_FREQ;

        // Get current dB from live spectrum
        const spectrum = dataRef.current?.spectrum;
        let dB = -100;
        if (spectrum) {
            const maxBin = Math.floor(spectrum.length / 3);
            const binIndex = Math.floor(freqRatio * maxBin);
            const val = spectrum[binIndex] || 0;
            dB = val < 0 ? val : 20 * Math.log10(val + 0.00001);
        }

        setCursorData({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            frequency: Math.round(frequency),
            dB: dB.toFixed(1),
            note: hzToNote(frequency)
        });
    }, [dataRef]);

    /**
     * Take high-quality screenshot
     */
    const handleScreenshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // Add labels
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        tempCtx.font = '14px sans-serif';
        tempCtx.textAlign = 'left';
        [0, 2000, 4000, 6000, 8000].forEach(hz => {
            const y = canvas.height * (1 - hz / MAX_FREQ);
            tempCtx.fillText(`${hz < 1000 ? hz : hz / 1000 + 'k'} Hz`, 5, y + 4);
        });

        const link = document.createElement('a');
        link.download = `spectrogram_hires_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }, []);

    return (
        <div
            className="relative h-full w-full bg-black rounded-xl overflow-hidden border border-slate-800"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                onClick={handleCanvasClick}
            />

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

            {/* Tap Cursor Tooltip */}
            {cursorData && (
                <div
                    className="absolute z-20 bg-slate-900/95 border border-teal-500/50 rounded-lg px-3 py-2 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                    style={{
                        left: Math.min(cursorData.x, 280) + 10,
                        top: Math.max(10, cursorData.y - 60)
                    }}
                >
                    <div className="text-teal-400 font-bold text-lg">{cursorData.frequency} Hz</div>
                    <div className="text-slate-300 text-sm">{cursorData.dB} dB</div>
                    <div className="text-amber-400 text-sm font-mono">{cursorData.note}</div>
                    <button
                        className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white pointer-events-auto"
                        onClick={(e) => { e.stopPropagation(); setCursorData(null); }}
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Screenshot Button */}
            {showControls && (
                <button
                    onClick={handleScreenshot}
                    className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-white/70 hover:text-white transition-all z-10 animate-in fade-in duration-200"
                    title="Save Screenshot"
                >
                    <Camera size={16} />
                </button>
            )}

            {/* Tap hint */}
            {showControls && !cursorData && (
                <div className="absolute bottom-2 left-2 text-[10px] text-white/40 bg-black/50 px-2 py-1 rounded animate-in fade-in duration-200">
                    Click to inspect Hz/dB
                </div>
            )}
        </div>
    );
});

export default HighResSpectrogram;
