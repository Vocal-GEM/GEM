import React, { useEffect, useRef } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useSettings } from '../../context/SettingsContext';
const Spectrogram3D = React.lazy(() => import('./Spectrogram3D'));

const Spectrogram = React.memo(({ dataRef, audioRef }) => {
    const canvasRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        // Initialize Audio Context and Analyser if audioRef is provided
        if (audioRef?.current && !audioContextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            try {
                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
            } catch (e) {
                console.warn("Could not connect audio source for spectrogram:", e);
            }
        }

        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [audioRef]);

    const { colorBlindMode } = useSettings();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 256;

        const colormap = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            const t = i / 255;
            let r, g, b;

            if (colorBlindMode) {
                // Accessible Palette (Viridis-like: Purple -> Teal -> Yellow)
                // Simple approximation
                if (t < 0.5) {
                    // Purple to Teal
                    const tt = t * 2;
                    r = 75 + (30 - 75) * tt;
                    g = 0 + (150 - 0) * tt;
                    b = 130 + (130 - 130) * tt;
                } else {
                    // Teal to Yellow
                    const tt = (t - 0.5) * 2;
                    r = 30 + (255 - 30) * tt;
                    g = 150 + (255 - 150) * tt;
                    b = 130 + (0 - 130) * tt;
                }
            } else {
                // Standard Heatmap (Dark -> Red/Orange -> White)
                r = Math.min(255, Math.max(0, t * 400 - 100));
                g = Math.min(255, Math.max(0, t * 400 - 200));
                b = Math.min(255, Math.max(0, t * 400 - 50));
            }

            colormap[i] = (255 << 24) | (Math.floor(b) << 16) | (Math.floor(g) << 8) | Math.floor(r);
        }

        const loop = () => {
            let spectrum;

            // Priority 1: Live Data from dataRef
            if (dataRef?.current?.spectrum) {
                spectrum = dataRef.current.spectrum;
            }
            // Priority 2: Playback Data from Analyser
            else if (analyserRef.current && audioRef?.current && !audioRef.current.paused) {
                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyserRef.current.getByteFrequencyData(dataArray);
                spectrum = dataArray;
            }

            const width = canvas.width;
            const height = canvas.height;
            const scrollSpeed = 2;

            // Shift canvas left
            ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

            const imgData = ctx.createImageData(scrollSpeed, height);
            const data = new Uint32Array(imgData.data.buffer);

            if (spectrum) {
                // Draw Spectrum
                for (let y = 0; y < height; y++) {
                    const maxIndex = spectrum.length;
                    const targetMaxFreq = 8000;
                    const sampleRate = 16000;
                    const maxTargetIndex = Math.floor(maxIndex * targetMaxFreq / (sampleRate / 2));

                    const mappedIndex = Math.floor(y / height * maxTargetIndex);
                    const val = spectrum[mappedIndex] || 0;

                    let intensity;
                    // Silence Check
                    if (dataRef?.current?.isSilent) {
                        intensity = 0;
                    } else if (dataRef?.current) {
                        intensity = Math.log10(val + 1) * 50;
                    } else {
                        intensity = val;
                    }

                    intensity = Math.min(255, Math.max(0, intensity));
                    const color = colormap[Math.floor(intensity)];

                    for (let x = 0; x < scrollSpeed; x++) {
                        data[(height - 1 - y) * scrollSpeed + x] = color;
                    }
                }
            } else {
                // Draw Silence (Black)
                const black = (255 << 24) | (0 << 16) | (0 << 8) | 0;
                for (let i = 0; i < data.length; i++) {
                    data[i] = black;
                }
            }

            ctx.putImageData(imgData, width - scrollSpeed, 0);
        };

        // Use RenderCoordinator instead of individual RAF
        const unsubscribe = renderCoordinator.subscribe(
            'spectrogram',
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [dataRef, audioRef]);

    const [is3D, setIs3D] = React.useState(false);

    return (
        <div className="h-full w-full relative overflow-hidden rounded-xl bg-black group">
            {is3D ? (
                <React.Suspense fallback={<div className="text-white p-4">Loading 3D...</div>}>
                    <Spectrogram3D dataRef={dataRef} />
                </React.Suspense>
            ) : (
                <>
                    <canvas ref={canvasRef} className="w-full h-full"></canvas>
                    <div className="absolute bottom-1 right-2 text-[9px] text-white/50 font-mono">0 - 8kHz</div>
                </>
            )}

            <button
                onClick={() => setIs3D(!is3D)}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs px-2 py-1 rounded backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
            >
                {is3D ? "2D View" : "3D View"}
            </button>
        </div>
    );
});

export default Spectrogram;
