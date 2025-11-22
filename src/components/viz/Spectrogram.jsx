import React, { useEffect, useRef } from 'react';

const Spectrogram = ({ dataRef }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
        const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = 256;
        const colormap = new Uint32Array(256);
        for (let i = 0; i < 256; i++) { const t = i / 255; const r = Math.min(255, Math.max(0, t * 400 - 100)); const g = Math.min(255, Math.max(0, t * 400 - 200)); const b = Math.min(255, Math.max(0, t * 400 - 50)); colormap[i] = (255 << 24) | (b << 16) | (g << 8) | r; }
        const loop = () => {
            const spectrum = dataRef.current.spectrum; if (!spectrum) { requestAnimationFrame(loop); return; }
            const width = canvas.width; const height = canvas.height; const scrollSpeed = 2;
            ctx.drawImage(canvas, scrollSpeed, 0, width - scrollSpeed, height, 0, 0, width - scrollSpeed, height);
            const imgData = ctx.createImageData(scrollSpeed, height); const data = new Uint32Array(imgData.data.buffer);
            for (let y = 0; y < height; y++) { const specIndex = Math.floor(y * (350 / height)); const val = spectrum[specIndex] || 0; let intensity = Math.log10(val + 1) * 50; intensity = Math.min(255, Math.max(0, intensity)); const color = colormap[Math.floor(intensity)]; for (let x = 0; x < scrollSpeed; x++) { data[(height - 1 - y) * scrollSpeed + x] = color; } }
            ctx.putImageData(imgData, width - scrollSpeed, 0); requestAnimationFrame(loop);
        };
        const id = requestAnimationFrame(loop); return () => cancelAnimationFrame(id);
    }, []);
    return (<div className="h-32 w-full relative overflow-hidden rounded-xl bg-black"> <canvas ref={canvasRef} className="w-full h-full"></canvas> <div className="absolute bottom-1 right-2 text-[9px] text-white/50 font-mono">0 - 4kHz</div> </div>);
};

export default Spectrogram;
