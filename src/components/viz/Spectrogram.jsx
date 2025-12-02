import React, { useEffect, useRef } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { useSettings } from '../../context/SettingsContext';

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

            if (!spectrum) return;

            const width = canvas.width;
            const height = canvas.height;
            const scrollSpeed = 2;

            ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

            const imgData = ctx.createImageData(scrollSpeed, height);
            const data = new Uint32Array(imgData.data.buffer);

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

    return (
        <div className="h-full w-full relative overflow-hidden rounded-xl bg-black">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
            <div className="absolute bottom-1 right-2 text-[9px] text-white/50 font-mono">0 - 8kHz</div>
        </div>
    );
});

export default Spectrogram;
