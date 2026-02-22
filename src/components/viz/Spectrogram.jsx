import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { generateColormap } from '../../utils/colormaps';
import { Camera, X } from 'lucide-react';

/**
 * Convert frequency to musical note
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

const Spectrogram = ({ height = 200, showLabels = true }) => {
    const canvasRef = useRef(null);
    const { dataRef, isAudioActive, audioContext } = useAudio();
    const { settings } = useSettings();

    // Lazy initialization of component ID
    const idRef = useRef(null);
    if (!idRef.current) {
        idRef.current = `spectrogram-${Math.random().toString(36).substr(2, 9)}`;
    }
    const componentId = idRef.current;

    // Tap cursor state
    const [cursorData, setCursorData] = useState(null);
    const [showControls, setShowControls] = useState(false);

    // Optimized History Buffer (Circular Buffer)
    const HISTORY_FRAMES = 2500;
    const historyBufferRef = useRef(null); // Float32Array
    const historyMetaRef = useRef(null); // Metadata per frame
    const historyHeadRef = useRef(0); // Points to the next write position (frame index)

    // Lazy init
    if (!historyMetaRef.current) {
        historyMetaRef.current = new Array(HISTORY_FRAMES).fill(null);
    }

    // Cache for high-performance rendering artifacts
    // Optimization: Avoid object allocation and repeated math in the hot path (60fps)
    const cacheRef = useRef({
        binMap: null,       // Int16Array: y -> binIndex lookup table
        data32: null,       // Uint32Array: view of imageData buffer
        imageData: null,    // ImageData object
        lastHeight: 0,
        lastMaxBin: 0
    });

    // Spectrogram State
    const speed = 2; // Pixels per frame
    const MAX_FREQ = 8000;

    // Pre-calculate colormap as Uint32Array (ABGR) for fast pixel manipulation
    const colormap = useMemo(
        () => generateColormap(settings.spectrogramColorScheme),
        [settings.spectrogramColorScheme]
    );

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current) return;

        const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
        const width = canvas.width;
        const h = canvas.height;

        // 1. Shift existing image to the left
        // drawImage is optimized by browsers
        ctx.drawImage(canvas, speed, 0, width - speed, h, 0, 0, width - speed, h);

        const spectrum = dataRef.current.spectrum;
        if (spectrum && spectrum.length > 0) {
            const sampleRate = audioContext?.sampleRate || 44100;
            const contextNyquist = sampleRate / 2;
            const binsTotal = spectrum.length;
            const hzPerBin = contextNyquist / binsTotal;
            const maxBin = Math.min(binsTotal, Math.ceil(MAX_FREQ / hzPerBin));

            // --- OPTIMIZATION: History Buffer Management ---
            // Lazy initialization of history buffer
            if (!historyBufferRef.current || historyBufferRef.current.length < HISTORY_FRAMES * maxBin) {
                // Allocate or re-allocate if maxBin grows significantly
                historyBufferRef.current = new Float32Array(HISTORY_FRAMES * maxBin);
                // Also reset meta
                historyMetaRef.current = new Array(HISTORY_FRAMES).fill(null);
                historyHeadRef.current = 0;
            }

            const head = historyHeadRef.current;
            const buffer = historyBufferRef.current;
            const offset = head * maxBin;

            // Copy spectrum to history buffer
            for (let i = 0; i < maxBin; i++) {
                buffer[offset + i] = spectrum[i];
            }

            // Store metadata for this frame
            historyMetaRef.current[head] = { hzPerBin, maxBin };

            // Advance head (circular)
            historyHeadRef.current = (head + 1) % HISTORY_FRAMES;
            // -----------------------------------------------

            // --- OPTIMIZATION: Direct Pixel Manipulation ---
            const cache = cacheRef.current;

            // Initialize or retrieve ImageData
            if (!cache.imageData || cache.imageData.height !== h) {
                cache.imageData = ctx.createImageData(speed, h);
                // Create a 32-bit view for fast pixel writing (ABGR)
                cache.data32 = new Uint32Array(cache.imageData.data.buffer);
                cache.lastHeight = h;
            }

            // Optimization: Pre-calculate bin mapping if height or maxBin changed
            // This replaces O(h) float divisions/floor operations with O(h) array lookups per frame
            if (cache.lastHeight !== h || cache.lastMaxBin !== maxBin || !cache.binMap) {
                const map = new Int16Array(h);
                for (let y = 0; y < h; y++) {
                    // Linear mapping logic: 0 -> maxBin (low -> high frequency)
                    // y=0 is top (high freq), y=h is bottom (low freq)
                    const freqRatio = 1 - (y / h);
                    map[y] = Math.min(maxBin - 1, Math.floor(freqRatio * maxBin));
                }
                cache.binMap = map;
                cache.lastMaxBin = maxBin;
                cache.lastHeight = h;
            }

            const data32 = cache.data32;
            const binMap = cache.binMap;

            // Fill the column(s)
            for (let y = 0; y < h; y++) {
                // Use pre-calculated bin index
                const binIndex = binMap[y];

                // Get intensity from spectrum
                const value = spectrum[binIndex] || 0;

                let intensity = 0;
                if (value < 0) {
                    intensity = Math.max(0, Math.min(255, (value + 100) * 3.6));
                } else {
                    intensity = Math.min(255, value * 255 * 2);
                }

                // Color lookup
                let color = 0xFF000000; // Black (ABGR)
                if (intensity > 10) {
                    const colorIndex = Math.floor(intensity);
                    color = colormap[Math.min(255, Math.max(0, colorIndex))];
                }

                // Write to all columns in the 'speed' strip
                const rowOffset = y * speed;
                for (let x = 0; x < speed; x++) {
                    data32[rowOffset + x] = color;
                }
            }

            ctx.putImageData(cache.imageData, width - speed, 0);
            // -----------------------------------------------
        } else {
            // Clear the new strip if no data
            ctx.fillStyle = '#000';
            ctx.fillRect(width - speed, 0, speed, h);
        }
    }, [audioContext, colormap, dataRef]);

    useEffect(() => {
        let unsubscribe;
        if (isAudioActive) {
            unsubscribe = renderCoordinator.subscribe(
                componentId,
                draw,
                renderCoordinator.PRIORITY.MEDIUM
            );
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [isAudioActive, draw, componentId]);

    /**
     * Handle canvas click - show Hz/dB/Note at tap position
     */
    const handleCanvasClick = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const canvasX = (x / rect.width) * canvas.width;
        const canvasY = (y / rect.height) * canvas.height;

        const distanceFromRight = canvas.width - canvasX;
        const framesBack = Math.floor(distanceFromRight / speed);

        if (framesBack >= HISTORY_FRAMES) return;

        let frameIndex = historyHeadRef.current - 1 - framesBack;
        if (frameIndex < 0) {
            frameIndex += HISTORY_FRAMES;
        }

        if (!historyMetaRef.current) return;

        const meta = historyMetaRef.current[frameIndex];

        if (meta) {
            const buffer = historyBufferRef.current;
            const offset = frameIndex * meta.maxBin;

            const freqRatio = 1 - (canvasY / canvas.height);
            const binIndex = Math.floor(freqRatio * meta.maxBin);
            const frequency = binIndex * meta.hzPerBin;

            const rawValue = buffer[offset + binIndex] || 0;

            let dB = rawValue;
            if (rawValue >= 0) {
                dB = 20 * Math.log10(rawValue + 0.00001);
            }

            setCursorData({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                frequency: Math.round(frequency),
                dB: dB.toFixed(1),
                note: hzToNote(frequency)
            });
        }
    }, []);

    /**
     * Take high-quality screenshot of spectrogram
     */
    const handleScreenshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        tempCtx.font = '12px sans-serif';
        tempCtx.textAlign = 'left';
        const labels = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
        labels.forEach(hz => {
            const y = canvas.height * (1 - hz / MAX_FREQ);
            tempCtx.fillText(`${hz < 1000 ? hz : hz / 1000 + 'k'} Hz`, 5, y + 4);
        });

        const link = document.createElement('a');
        link.download = `spectrogram_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }, []);

    // Generate Labels
    const renderLabels = () => {
        if (!showLabels) return null;
        const labels = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

        return (
            <div className="absolute inset-0 pointer-events-none select-none">
                {labels.map(hz => {
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
        <div
            className="relative w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-inner group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <canvas
                ref={canvasRef}
                width={800}
                height={height}
                className="w-full h-full block cursor-crosshair"
                onClick={handleCanvasClick}
            />
            {renderLabels()}

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
                <div className="absolute bottom-2 left-2 text-[10px] text-white/40 bg-black/50 px-2 py-1 rounded animate-in fade-in duration-200">
                    Click to inspect Hz/dB
                </div>
            )}
        </div>
    );
};

export default Spectrogram;
