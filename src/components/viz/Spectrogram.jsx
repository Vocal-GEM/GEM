import { useState, useEffect, useRef, useCallback, memo, useId } from 'react';
import { Camera, X } from 'lucide-react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { hzToNote } from '../../utils/musicUtils';

// Formant tracking configuration
const FORMANT_CONFIG = {
    COLORS: {
        F1: 'rgba(239, 68, 68, 0.9)',   // Red
        F2: 'rgba(59, 130, 246, 0.9)',  // Blue
        F3: 'rgba(16, 185, 129, 0.9)',  // Green
    },
    RANGES: {
        F1: { min: 200, max: 1000 },
        F2: { min: 800, max: 3000 },
        F3: { min: 2000, max: 4000 }
    }
};

const Spectrogram = memo(({
    dataRef,
    maxFreq = 5000,
    scrollSpeed = 2,
    showFormants = true
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [cursorData, setCursorData] = useState(null);
    const [showControls, setShowControls] = useState(false);

    // Performance optimization refs
    const imgDataRef = useRef(null);
    const data32Ref = useRef(null);
    const lastFormantsRef = useRef({ f1: 0, f2: 0, f3: 0 });
    const componentId = useId();

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current?.spectrum) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const spectrum = dataRef.current.spectrum;

        if (!imgDataRef.current || imgDataRef.current.width !== scrollSpeed) {
            imgDataRef.current = ctx.createImageData(scrollSpeed, height);
            data32Ref.current = new Uint32Array(imgDataRef.current.data.buffer);
        }

        const imgData = imgDataRef.current;
        const data32 = data32Ref.current;

        // Shift existing content
        ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

        // Draw new column
        const nyquist = 24000;
        const maxBin = Math.floor((maxFreq / nyquist) * spectrum.length);

        for (let y = 0; y < height; y++) {
            const freqRatio = (height - 1 - y) / height;
            const binIndex = Math.floor(freqRatio * maxBin);
            const val = spectrum[binIndex] || 0;

            // Logarithmic mapping with noise floor handling
            let intensity = Math.max(0, (val + 100) / 100);
            intensity = Math.pow(intensity, 1.5) * 255;
            intensity = Math.min(255, Math.max(0, intensity));

            // Custom Viridis-like colormap (dark blue -> green -> yellow)
            let r, g, b;
            const normalized = intensity / 255;

            if (normalized < 0.3) {
                // Dark blue to blue
                r = 0; g = 0; b = normalized * 3 * 255;
            } else if (normalized < 0.7) {
                // Blue to green
                const t = (normalized - 0.3) / 0.4;
                r = 0; g = t * 255; b = 255 - (t * 200);
            } else {
                // Green to yellow/white
                const t = (normalized - 0.7) / 0.3;
                r = t * 255; g = 255; b = t * 100;
            }

            const color = (255 << 24) | (b << 16) | (g << 8) | r;

            const rowOffset = y * scrollSpeed;
            for (let x = 0; x < scrollSpeed; x++) {
                data32[rowOffset + x] = color;
            }
        }

        ctx.putImageData(imgData, width - scrollSpeed, 0);

        // Draw Formants
        if (showFormants) {
            const { f1, f2, f3 } = dataRef.current;
            const last = lastFormantsRef.current;

            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const drawFormant = (currFreq, lastFreq, color, range) => {
                // Basic validation against expected ranges to prevent wild jumps
                if (currFreq > range.min && currFreq < range.max &&
                    lastFreq > range.min && lastFreq < range.max) {

                    const currY = height * (1 - currFreq / maxFreq);
                    const lastY = height * (1 - lastFreq / maxFreq);

                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.moveTo(width - scrollSpeed * 2, lastY);
                    ctx.lineTo(width - scrollSpeed, currY);
                    ctx.stroke();
                }
            };

            drawFormant(f1, last.f1, FORMANT_CONFIG.COLORS.F1, FORMANT_CONFIG.RANGES.F1);
            drawFormant(f2, last.f2, FORMANT_CONFIG.COLORS.F2, FORMANT_CONFIG.RANGES.F2);
            // f3 optional depending on analysis depth
            if (f3) drawFormant(f3, last.f3, FORMANT_CONFIG.COLORS.F3, FORMANT_CONFIG.RANGES.F3);

            lastFormantsRef.current = { f1, f2, f3 };
        }

    }, [dataRef, maxFreq, scrollSpeed, showFormants]);

    // Handle Resize
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;

        if (!container || !canvas) return;

        const updateSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();

            const newWidth = Math.round(rect.width * dpr);
            const newHeight = 300; // Fixed high vertical resolution

            if (canvas.width !== newWidth || canvas.height !== newHeight) {
                canvas.width = newWidth;
                canvas.height = newHeight;
                imgDataRef.current = null;
                data32Ref.current = null;

                // Fill black initially
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, newWidth, newHeight);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateSize);
        });

        resizeObserver.observe(container);
        updateSize();

        return () => resizeObserver.disconnect();
    }, []);

    // Render loop
    useEffect(() => {
        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            draw,
            renderCoordinator.PRIORITY.MEDIUM
        );
        return () => unsubscribe();
    }, [componentId, draw]);

    const handleCanvasClick = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const canvasY = (y / rect.height) * canvas.height;
        const freqRatio = 1 - (canvasY / canvas.height);
        const frequency = freqRatio * maxFreq;

        const spectrum = dataRef.current?.spectrum;
        let dB = -100;
        if (spectrum) {
            const nyquist = 24000;
            const maxBin = Math.floor((maxFreq / nyquist) * spectrum.length);
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
    }, [dataRef, maxFreq]);

    const handleScreenshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        tempCtx.font = '14px sans-serif';
        tempCtx.textAlign = 'left';

        const labels = [0, maxFreq * 0.25, maxFreq * 0.5, maxFreq * 0.75, maxFreq];
        labels.forEach(hz => {
            if (hz === 0) return;
            const y = canvas.height * (1 - hz / maxFreq);
            tempCtx.fillText(`${hz < 1000 ? hz : hz / 1000 + 'k'} Hz`, 5, y + 4);
        });

        const link = document.createElement('a');
        link.download = `spectrogram_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }, [maxFreq]);

    return (
        <div
            className="relative h-full w-full bg-black rounded-xl overflow-hidden border border-slate-800 group"
            ref={containerRef}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair block"
                onClick={handleCanvasClick}
            />

            {/* Legend / Axes overlay */}
            <div className="absolute top-2 left-2 flex gap-3 text-[10px] font-bold bg-black/60 px-2 py-1 rounded backdrop-blur pointer-events-none">
                {showFormants && (
                    <>
                        <span style={{color: FORMANT_CONFIG.COLORS.F1}}>F1 (Jaw)</span>
                        <span style={{color: FORMANT_CONFIG.COLORS.F2}}>F2 (Tongue)</span>
                        <span style={{color: FORMANT_CONFIG.COLORS.F3}}>F3 (Lips)</span>
                    </>
                )}
            </div>

            <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[9px] text-white/50 py-2 pointer-events-none">
                <span>{maxFreq / 1000}k</span>
                <span>{maxFreq / 2000}k</span>
                <span>0</span>
            </div>

            {cursorData && (
                <div
                    className="absolute z-20 bg-slate-900/95 border border-teal-500/50 rounded-lg px-3 py-2 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                    style={{
                        left: Math.min(cursorData.x, containerRef.current?.offsetWidth - 120 || 280) + 10,
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

            {showControls && (
                <button
                    onClick={handleScreenshot}
                    className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-white/70 hover:text-white transition-all z-10 animate-in fade-in duration-200"
                    title="Save Screenshot"
                >
                    <Camera size={16} />
                </button>
            )}

            {showControls && !cursorData && (
                <div className="absolute bottom-2 left-2 text-[10px] text-white/40 bg-black/50 px-2 py-1 rounded animate-in fade-in duration-200 pointer-events-none">
                    Click to inspect Hz/dB
                </div>
            )}
        </div>
    );
});

Spectrogram.displayName = 'Spectrogram';

export default Spectrogram;
