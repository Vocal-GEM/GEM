import React, { useEffect, useRef } from 'react';

const Spectrogram = ({ dataRef, audioRef }) => {
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

            // Connect audio element to analyser
            // Note: This requires the audio element to have crossorigin="anonymous" if loading from external source
            // and might need user interaction to start context.
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
            const r = Math.min(255, Math.max(0, t * 400 - 100));
            const g = Math.min(255, Math.max(0, t * 400 - 200));
            const b = Math.min(255, Math.max(0, t * 400 - 50));
            colormap[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        }

        const loop = () => {
            let spectrum;

            // Priority 1: Live Data from dataRef
            if (dataRef?.current?.spectrum) {
                spectrum = dataRef.current.spectrum;
            }
            // Priority 2: Playback Data from Analyser
            else if (analyserRef.current && !audioRef.current.paused) {
                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyserRef.current.getByteFrequencyData(dataArray);
                // Convert to format expected by renderer (0-1 float or similar? Original code used raw magnitude)
                // Original code: val = spectrum[specIndex] || 0; intensity = Math.log10(val + 1) * 50;
                // ByteFreqData is 0-255 (dB-like). 
                // Let's normalize to match expected input or adjust renderer.
                // The original code expects linear magnitude roughly. 
                // Let's just use the byte data directly but adjust intensity calc.
                spectrum = dataArray;
            }

            if (!spectrum) {
                requestAnimationFrame(loop);
                return;
            }

            const width = canvas.width;
            const height = canvas.height;
            const scrollSpeed = 2;

            ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);

            const imgData = ctx.createImageData(scrollSpeed, height);
            const data = new Uint32Array(imgData.data.buffer);

            for (let y = 0; y < height; y++) {
                const specIndex = Math.floor(y * (spectrum.length / 2 / height)); // Map height to freq range (approx half sample rate)
                // Actually original code: specIndex = Math.floor(y * (350 / height)); which is weirdly specific index mapping
                // Let's assume standard mapping: 0 to Nyquist.
                // If spectrum is from Analyser (1024 bins for 2048 FFT), it covers 0-SampleRate/2.
                // We want 0-4kHz usually for voice.
                // If SampleRate is 44100, 4kHz is roughly index 185 out of 1024.

                // Let's use a mapping that focuses on 0-8kHz
                const maxIndex = spectrum.length; // 1024
                const targetMaxFreq = 8000;
                const sampleRate = 44100; // Approx
                const maxTargetIndex = Math.floor(maxIndex * targetMaxFreq / (sampleRate / 2));

                const mappedIndex = Math.floor(y / height * maxTargetIndex);

                const val = spectrum[mappedIndex] || 0;

                let intensity;
                if (dataRef?.current) {
                    // Linear magnitude from custom analyzer
                    intensity = Math.log10(val + 1) * 50;
                } else {
                    // Byte data (0-255) from Web Audio Analyser
                    intensity = val;
                }

                intensity = Math.min(255, Math.max(0, intensity));
                const color = colormap[Math.floor(intensity)];

                for (let x = 0; x < scrollSpeed; x++) {
                    data[(height - 1 - y) * scrollSpeed + x] = color;
                }
            }

            ctx.putImageData(imgData, width - scrollSpeed, 0);
            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [dataRef, audioRef]);

    return (<div className="h-32 w-full relative overflow-hidden rounded-xl bg-black"> <canvas ref={canvasRef} className="w-full h-full"></canvas> <div className="absolute bottom-1 right-2 text-[9px] text-white/50 font-mono">0 - 8kHz</div> </div>);
};

export default Spectrogram;
