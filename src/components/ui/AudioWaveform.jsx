import { useRef, useEffect, useCallback } from 'react';

const AudioWaveform = ({ audioUrl, isPlaying = false, currentTime = 0, duration = 0 }) => {
    const canvasRef = useRef(null);
    const waveformDataRef = useRef(null);

    // Draw waveform
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !waveformDataRef.current) return;

        const ctx = canvas.getContext('2d');
        const data = waveformDataRef.current;
        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / data.length;
        const progressPercent = duration > 0 ? currentTime / duration : 0;

        ctx.clearRect(0, 0, width, height);

        data.forEach((value, index) => {
            const x = index * barWidth;
            const barHeight = value * height * 0.8;
            const y = (height - barHeight) / 2;

            // Color based on playback progress
            const isPlayed = (index / data.length) < progressPercent;

            ctx.fillStyle = isPlayed
                ? '#14b8a6' // Teal for played
                : 'rgba(148, 163, 184, 0.5)'; // Slate for unplayed

            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }, [currentTime, duration]);

    // Generate waveform data from audio
    useEffect(() => {
        if (!audioUrl) return;

        const generateWaveform = async () => {
            try {
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const rawData = audioBuffer.getChannelData(0);
                const samples = 100;
                const blockSize = Math.floor(rawData.length / samples);
                const waveform = [];

                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[i * blockSize + j]);
                    }
                    waveform.push(sum / blockSize);
                }

                // Normalize
                const max = Math.max(...waveform);
                waveformDataRef.current = waveform.map(v => v / max);
                drawWaveform();

                audioContext.close();
            } catch (error) {
                console.error('Failed to generate waveform:', error);
            }
        };

        generateWaveform();
    }, [audioUrl, drawWaveform]);


    // Redraw on playback update
    useEffect(() => {
        drawWaveform();
    }, [currentTime, isPlaying]);

    return (
        <div className="w-full h-16 bg-slate-800 rounded-lg overflow-hidden">
            <canvas
                ref={canvasRef}
                width={400}
                height={64}
                className="w-full h-full"
            />
        </div>
    );
};

export default AudioWaveform;
