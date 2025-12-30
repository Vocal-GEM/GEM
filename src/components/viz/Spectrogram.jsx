import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { getColormapFunction } from '../../utils/colormaps';
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

    // Store spectrum data for tap cursor lookup
    const spectrumHistoryRef = useRef([]);
    const MAX_FREQ = 8000;

    // Spectrogram State
    const speed = 2; // Pixels per frame

    // Dynamic colormap based on settings
    const getColor = useMemo(
        () => getColormapFunction(settings.spectrogramColorScheme),
        [settings.spectrogramColorScheme]
    );

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !dataRef.current) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        const width = canvas.width;
        const h = canvas.height;

        // 1. Shift existing image to the left
        ctx.drawImage(canvas, speed, 0, width - speed, h, 0, 0, width - speed, h);

        // 2. Clear the new strip at the right
        ctx.fillStyle = '#000';
        ctx.fillRect(width - speed, 0, speed, h);

        // 3. Draw new column at the right edge
        const spectrum = dataRef.current.spectrum;
        if (spectrum && spectrum.length > 0) {
            const sampleRate = audioContext?.sampleRate || 44100;
            const contextNyquist = sampleRate / 2;
            const binsTotal = spectrum.length;
            const hzPerBin = contextNyquist / binsTotal;
            const maxBin = Math.min(binsTotal, Math.ceil(MAX_FREQ / hzPerBin));

            // Store snapshot for tap cursor (keep last N columns)
            const snapshot = new Float32Array(maxBin);
            for (let i = 0; i < maxBin; i++) {
                snapshot[i] = spectrum[i];
            }
            spectrumHistoryRef.current.push({ data: snapshot, hzPerBin, maxBin });
            if (spectrumHistoryRef.current.length > width / speed) {
                spectrumHistoryRef.current.shift();
            }

            for (let i = 0; i < maxBin; i++) {
                const value = spectrum[i];
                let intensity = 0;

                if (value < 0) {
                    intensity = Math.max(0, Math.min(255, (value + 100) * 3.6));
                } else {
                    intensity = Math.min(255, value * 255 * 2);
                }

                if (intensity > 10) {
                    ctx.fillStyle = getColor(intensity);
                    const y = h - (i / maxBin) * h;
                    const binHeight = Math.max(1, h / maxBin);
                    ctx.fillRect(width - speed, y - binHeight, speed, binHeight);
                }
            }
        }
    }, [getColor, audioContext]);

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

        // Map x/y to frequency and time
        const canvasX = (x / rect.width) * canvas.width;
        const canvasY = (y / rect.height) * canvas.height;

        // Get historical spectrum at this position
        const historyIndex = Math.floor(canvasX / speed);
        const history = spectrumHistoryRef.current;

        if (historyIndex >= 0 && historyIndex < history.length) {
            const snapshot = history[historyIndex];
            const freqRatio = 1 - (canvasY / canvas.height);
            const binIndex = Math.floor(freqRatio * snapshot.maxBin);
            const frequency = binIndex * snapshot.hzPerBin;
            const rawValue = snapshot.data[binIndex] || 0;

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

