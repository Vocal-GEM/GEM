import { useEffect, useRef, useMemo, useState, useCallback, useId } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { getColormapFunction } from '../../utils/colormaps';
import { generateColormap } from '../../utils/colormaps';
import { Camera, X } from 'lucide-react';
import { renderCoordinator } from '../../services/RenderCoordinator';

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
    // Unique ID for render coordinator
    // Use useId directly, assuming React 18+ as seen in package.json (react ^18.3.1)
    const reactId = useId();
    const componentId = useRef(reactId).current;

    // Tap cursor state
    const [cursorData, setCursorData] = useState(null);
    const [showControls, setShowControls] = useState(false);

    // Optimized History Buffer (Circular Buffer)
    // We allocate a large flat array to store history instead of pushing/shifting objects.
    // Each frame stores 'maxBin' floats.
    // We increase history size to handle large screens (e.g. 4k).
    // 2500 frames * 2px speed = 5000px width coverage.
    const HISTORY_FRAMES = 2500;
    const historyBufferRef = useRef(null); // Float32Array
    const historyMetaRef = useRef(new Array(HISTORY_FRAMES).fill(null)); // Metadata per frame
    const historyHeadRef = useRef(0); // Points to the next write position (frame index)

    // Spectrogram State
    const speed = 2; // Pixels per frame
    const MAX_FREQ = 8000;

    // Pre-calculate colormap as Uint32Array (ABGR) for fast pixel manipulation
    const colormap = useMemo(
        () => generateColormap(settings.spectrogramColorScheme),
        [settings.spectrogramColorScheme]
    );

    const draw = useCallback((_deltaTime) => {
    // Reusable objects to reduce GC
    const imageDataRef = useRef(null);

    const draw = () => {
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
                // Allocate or re-allocate if maxBin grows significantly (unlikely dynamically)
                historyBufferRef.current = new Float32Array(HISTORY_FRAMES * maxBin);
                // Also reset meta
                historyMetaRef.current = new Array(HISTORY_FRAMES).fill(null);
                historyHeadRef.current = 0;
            }

            const head = historyHeadRef.current;
            const buffer = historyBufferRef.current;
            const offset = head * maxBin;

            // Copy spectrum to history buffer (avoiding new Float32Array per frame)
            // We only need the first maxBin items
            for (let i = 0; i < maxBin; i++) {
                buffer[offset + i] = spectrum[i];
            }

            // Store metadata for this frame
            historyMetaRef.current[head] = { hzPerBin, maxBin };

            // Advance head (circular)
            historyHeadRef.current = (head + 1) % HISTORY_FRAMES;
            // -----------------------------------------------

            // --- OPTIMIZATION: Direct Pixel Manipulation ---
            // Instead of thousands of ctx.fillRect calls, we generate the column pixels
            // directly into an ImageData buffer and put it onto the canvas.

            // Reuse ImageData object
            if (!imageDataRef.current || imageDataRef.current.height !== h || imageDataRef.current.width !== speed) {
                imageDataRef.current = ctx.createImageData(speed, h);
            }

            const imageData = imageDataRef.current;
            const data32 = new Uint32Array(imageData.data.buffer); // View as 32-bit integers (ABGR)

            // Fill the column(s). Since speed is width, we fill 'speed' columns identically.
            // We map pixels (y) to frequency bins.
            for (let y = 0; y < h; y++) {
                // Invert y because canvas 0 is top, but we want low freq at bottom
                // y=0 is top (high freq), y=h is bottom (low freq)
                // Bin mapping: 0 -> maxBin (low -> high)

                // Linear mapping matches the original code: y = h - (i / maxBin) * h
                // So i / maxBin = (h - y) / h = 1 - y/h

                const freqRatio = 1 - (y / h);
                const binIndex = Math.min(maxBin - 1, Math.floor(freqRatio * maxBin));

                // Get intensity from spectrum
                const value = spectrum[binIndex] || 0;

                let intensity = 0;
                if (value < 0) {
                     // DB-ish scale handling from original code
                     intensity = Math.max(0, Math.min(255, (value + 100) * 3.6));
                } else {
                     // Linear scale handling
                     intensity = Math.min(255, value * 255 * 2);
                }

                // Color lookup
                let color = 0xFF000000; // Black (ABGR: A=255, B=0, G=0, R=0)
                if (intensity > 10) {
                     const colorIndex = Math.floor(intensity);
                     color = colormap[Math.min(255, Math.max(0, colorIndex))];
                }

                // Write to all columns in the 'speed' strip
                // Row y has 'speed' pixels
                const rowOffset = y * speed;
                for (let x = 0; x < speed; x++) {
                    data32[rowOffset + x] = color;
                }
            }
        }
    }, [getColor, audioContext]);
    }, [dataRef, audioContext, getColor]); // Removed recursive requestAnimationFrame

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
            // Subscribe to renderCoordinator instead of using requestAnimationFrame directly
            return renderCoordinator.subscribe(componentId, draw, renderCoordinator.PRIORITY.MEDIUM);
        }
    }, [isAudioActive, draw, componentId]);

            ctx.putImageData(imageData, width - speed, 0);
            // -----------------------------------------------
        } else {
             // Clear the new strip if no data
             ctx.fillStyle = '#000';
             ctx.fillRect(width - speed, 0, speed, h);
        }
    }, [getColor, dataRef, audioContext]);

    useEffect(() => {
        if (!isAudioActive) return;

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'spectrogram',
                draw,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [isAudioActive, draw]);

    /**
     * Handle canvas click - show Hz/dB/Note at tap position
     */
    const handleCanvasClick = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Map x/y to frequency and time
        const canvasX = (x / rect.width) * canvas.width;
        const canvasY = (y / rect.height) * canvas.height;

        // Find the frame in history
        // The rightmost pixel (width-speed) corresponds to the latest frame (historyHead - 1)
        // x moves left, so we go back in history.
        // Distance from right edge:
        const distanceFromRight = canvas.width - canvasX;
        const framesBack = Math.floor(distanceFromRight / speed);

        // Safety check: Don't look further back than our buffer allows
        if (framesBack >= HISTORY_FRAMES) return;

        let frameIndex = historyHeadRef.current - 1 - framesBack;

        // Handle wrapping
        if (frameIndex < 0) {
            frameIndex += HISTORY_FRAMES;
        }

        const meta = historyMetaRef.current[frameIndex];

        if (meta) {
            // Retrieve data from flattened buffer
            const buffer = historyBufferRef.current;
            const offset = frameIndex * meta.maxBin;

            const freqRatio = 1 - (canvasY / canvas.height);
            const binIndex = Math.floor(freqRatio * meta.maxBin);
            const frequency = binIndex * meta.hzPerBin;

            // Read value
            const rawValue = buffer[offset + binIndex] || 0;

            // Convert to dB
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

        // Create a clean copy without UI overlays
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // Add frequency labels
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        tempCtx.font = '12px sans-serif';
        tempCtx.textAlign = 'left';
        const labels = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
        labels.forEach(hz => {
            const y = canvas.height * (1 - hz / MAX_FREQ);
            tempCtx.fillText(`${hz < 1000 ? hz : hz / 1000 + 'k'} Hz`, 5, y + 4);
        });

        // Download
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

            {/* Screenshot Button (appears on hover) */}
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
};

export default Spectrogram;
