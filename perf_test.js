import { performance } from 'perf_hooks';

const history = Array(10000).fill(0).map(() => ({
    pitch: Math.random() * 800 + 100,
    volume: Math.random() * 0.5 + 0.1
}));

function analyzeOriginal(history) {
    if (!history || history.length === 0) return null;
    const voicedFrames = history.filter(h => h.pitch > 50 && h.pitch < 1000);
    if (voicedFrames.length === 0) return { minF0: 0, maxF0: 0, avgF0: 0, rangeST: 0, avgSPL: 0 };

    const pitches = voicedFrames.map(f => f.pitch);
    const minF0 = Math.min(...pitches);
    const maxF0 = Math.max(...pitches);
    const avgF0 = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const rangeST = 12 * Math.log2(maxF0 / minF0);

    const volumes = history.map(h => Math.max(0.0001, h.volume));
    const dbValues = volumes.map(v => 20 * Math.log10(v) + 90);
    const avgSPL = dbValues.reduce((a, b) => a + b, 0) / dbValues.length;

    return { minF0, maxF0, avgF0, rangeST, avgSPL };
}

function analyzeOptimized(history) {
    if (!history || history.length === 0) return null;

    let voicedCount = 0;
    let minF0 = Infinity;
    let maxF0 = -Infinity;
    let sumF0 = 0;
    let sumSPL = 0;

    for (let i = 0; i < history.length; i++) {
        const { pitch, volume } = history[i];

        if (pitch > 50 && pitch < 1000) {
            voicedCount++;
            sumF0 += pitch;
            if (pitch < minF0) minF0 = pitch;
            if (pitch > maxF0) maxF0 = pitch;
        }

        const vol = volume > 0.0001 ? volume : 0.0001;
        sumSPL += 20 * Math.log10(vol) + 90;
    }

    if (voicedCount === 0) {
        return { minF0: 0, maxF0: 0, avgF0: 0, rangeST: 0, avgSPL: 0 };
    }

    const avgF0 = sumF0 / voicedCount;
    const rangeST = 12 * Math.log2(maxF0 / minF0);
    const avgSPL = sumSPL / history.length;

    return { minF0, maxF0, avgF0, rangeST, avgSPL };
}

const t0 = performance.now();
for (let i = 0; i < 1000; i++) {
    analyzeOriginal(history);
}
const t1 = performance.now();

const t2 = performance.now();
for (let i = 0; i < 1000; i++) {
    analyzeOptimized(history);
}
const t3 = performance.now();

console.log(`Original: ${t1 - t0}ms`);
console.log(`Optimized: ${t3 - t2}ms`);
