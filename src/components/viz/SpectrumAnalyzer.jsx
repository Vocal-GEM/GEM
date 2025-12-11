import { useEffect, useRef, useState, useCallback } from 'react';
import { lpcAnalyzer } from '../../utils/lpcAnalysis';
import { Camera, X } from 'lucide-react';

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

const MAX_FREQ = 5000;

const SpectrumAnalyzer = ({ dataRef, userMode }) => {
    const canvasRef = useRef(null);
    const [cursorData, setCursorData] = useState(null);
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            if (!dataRef.current) {
                return;
            }

            const { timeDomainData, spectrum } = dataRef.current;
            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            // Draw Grid
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let f = 1000; f < MAX_FREQ; f += 1000) {
                const x = (f / MAX_FREQ) * width;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.fillStyle = '#64748b';
                ctx.fillText(`${f / 1000}k`, x + 2, height - 5);
            }
            ctx.stroke();

            // 1. Draw FFT Spectrum (Raw)
            if (spectrum) {
                ctx.beginPath();
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;

                const maxBin = Math.floor(spectrum.length * (MAX_FREQ / 24000));

                for (let i = 0; i < maxBin; i++) {
                    const x = (i / maxBin) * width;
                    const val = spectrum[i];
                    const y = height - (val / 255) * height;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // 2. Draw LPC Envelope (Smooth)
            if (timeDomainData && userMode === 'slp') {
                const floatData = new Float32Array(timeDomainData.length);
                for (let i = 0; i < timeDomainData.length; i++) {
                    floatData[i] = (timeDomainData[i] - 128) / 128;
                }

                const lpcResult = lpcAnalyzer.analyze(floatData);

                if (lpcResult && lpcResult.envelope) {
                    const { envelope, formants } = lpcResult;

                    ctx.beginPath();
                    ctx.strokeStyle = '#f472b6';
                    ctx.lineWidth = 3;

                    const maxEnvIndex = Math.floor(envelope.length * (MAX_FREQ / 24000));

                    for (let i = 0; i < maxEnvIndex; i++) {
                        const x = (i / maxEnvIndex) * width;
                        const val = envelope[i];
                        const y = height - ((val + 20) / 80) * height;

                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // Draw Formant Peaks
                    ctx.fillStyle = '#fbbf24';
                    formants.forEach((f, idx) => {
                        if (f.freq < MAX_FREQ) {
                            const x = (f.freq / MAX_FREQ) * width;
                            const y = height - ((f.amp + 20) / 80) * height;

                            ctx.beginPath();
                            ctx.arc(x, y, 4, 0, Math.PI * 2);
                            ctx.fill();

                            if (idx < 3) {
                                ctx.fillStyle = '#fff';
                                ctx.font = '10px sans-serif';
                                ctx.fillText(`F${idx + 1}`, x + 5, y - 5);
                                ctx.fillStyle = '#fbbf24';
                            }
                        }
                    });
                }
            }
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'spectrum-analyzer',
                draw,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef, userMode]);

    /**
     * Handle canvas click - show Hz/dB at position
     */
    const handleCanvasClick = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Map x to frequency (horizontal axis is frequency in SpectrumAnalyzer)
        const canvasX = (x / rect.width) * canvas.width;
        const frequency = (canvasX / canvas.width) * MAX_FREQ;

        // Get dB from y position (approximate)
        const canvasY = (y / rect.height) * canvas.height;
        const dB = ((1 - canvasY / canvas.height) * 80) - 20;

        setCursorData({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            frequency: Math.round(frequency),
            dB: dB.toFixed(1),
            note: hzToNote(frequency)
        });
    }, []);

    /**
     * Take screenshot
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
        tempCtx.font = '12px sans-serif';
        [1000, 2000, 3000, 4000, 5000].forEach(hz => {
            const x = (hz / MAX_FREQ) * canvas.width;
            tempCtx.fillText(`${hz / 1000}k Hz`, x + 2, canvas.height - 5);
        });

        const link = document.createElement('a');
        link.download = `spectrum_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }, []);

    return (
        <div
            className="relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <div className="absolute top-2 left-3 text-xs font-bold text-slate-400 z-10">
                Spectrum & LPC Overlay
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 cursor-crosshair"
                onClick={handleCanvasClick}
            />

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
};

export default SpectrumAnalyzer;

