import React, { useEffect, useRef, useState } from 'react';
import { lpcAnalyzer } from '../../utils/lpcAnalysis';

const SpectrumAnalyzer = ({ dataRef, userMode }) => {
    const canvasRef = useRef(null);
    const [peaks, setPeaks] = useState([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const draw = () => {
            if (!dataRef.current) {
                animationId = requestAnimationFrame(draw);
                return;
            }

            const { timeDomainData, spectrum } = dataRef.current;
            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas
            ctx.fillStyle = '#0f172a'; // slate-900
            ctx.fillRect(0, 0, width, height);

            // Draw Grid
            ctx.strokeStyle = '#334155'; // slate-700
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Freq lines (log scale approx or linear? usually linear for formants is easier to read for beginners, but log is standard)
            // Let's stick to linear 0-5kHz for simplicity in this view
            for (let f = 1000; f < 5000; f += 1000) {
                const x = (f / 5000) * width;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.fillStyle = '#64748b';
                ctx.fillText(`${f / 1000}k`, x + 2, height - 5);
            }
            ctx.stroke();

            // 1. Draw FFT Spectrum (Raw)
            if (spectrum) {
                ctx.beginPath();
                ctx.strokeStyle = '#475569'; // slate-600
                ctx.lineWidth = 1;

                const binWidth = width / spectrum.length;
                // Only draw up to 5kHz (approx 1/4 of 48kHz/2 = 24kHz? No. 
                // Nyquist is 24kHz. 5kHz is ~20% of spectrum)
                // Assuming spectrum is 1024 bins covering 0-24kHz
                const maxBin = Math.floor(spectrum.length * (5000 / 24000));

                for (let i = 0; i < maxBin; i++) {
                    const x = (i / maxBin) * width;
                    const val = spectrum[i]; // 0-255
                    const y = height - (val / 255) * height;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // 2. Draw LPC Envelope (Smooth)
            if (timeDomainData && userMode === 'slp') {
                // Convert Uint8 to Float32 [-1, 1]
                const floatData = new Float32Array(timeDomainData.length);
                for (let i = 0; i < timeDomainData.length; i++) {
                    floatData[i] = (timeDomainData[i] - 128) / 128;
                }

                const lpcResult = lpcAnalyzer.analyze(floatData);

                if (lpcResult && lpcResult.envelope) {
                    const { envelope, formants } = lpcResult;

                    // Draw Envelope
                    ctx.beginPath();
                    ctx.strokeStyle = '#f472b6'; // pink-400
                    ctx.lineWidth = 3;

                    // Envelope is usually 512 points covering 0-Nyquist (24kHz)
                    // We only want 0-5kHz
                    const maxEnvIndex = Math.floor(envelope.length * (5000 / 24000));

                    for (let i = 0; i < maxEnvIndex; i++) {
                        const x = (i / maxEnvIndex) * width;
                        // Envelope is in dB, roughly 0 to 60-80 range?
                        // Normalize for display: map min-max to height
                        // Simple scaling: val is dB. 
                        const val = envelope[i];
                        // Map -20dB to 60dB to canvas height?
                        const y = height - ((val + 20) / 80) * height;

                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // Draw Formant Peaks
                    ctx.fillStyle = '#fbbf24'; // amber-400
                    formants.forEach((f, idx) => {
                        if (f.freq < 5000) {
                            const x = (f.freq / 5000) * width;
                            const y = height - ((f.amp + 20) / 80) * height;

                            ctx.beginPath();
                            ctx.arc(x, y, 4, 0, Math.PI * 2);
                            ctx.fill();

                            // Label F1, F2
                            if (idx < 3) {
                                ctx.fillStyle = '#fff';
                                ctx.font = '10px sans-serif';
                                ctx.fillText(`F${idx + 1}`, x + 5, y - 5);
                                ctx.fillStyle = '#fbbf24';
                            }
                        }
                    });

                    // Update state for UI overlay (throttled?)
                    // setPeaks(formants.filter(f => f.freq < 5000).slice(0, 3));
                }
            }

            animationId = requestAnimationFrame(draw);
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

    return (
        <div className="relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="absolute top-2 left-3 text-xs font-bold text-slate-400">
                Spectrum & LPC Overlay
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48"
            />
        </div>
    );
};

export default SpectrumAnalyzer;
