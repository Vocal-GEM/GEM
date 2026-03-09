import fs from 'fs';

// Read the code directly and eval it to avoid import issues
const code = fs.readFileSync('./src/utils/voiceAnalysis.js', 'utf8');
const modifiedCode = code
    .replace(/import .*/g, '')
    .replace('export class VoiceAnalyzer', 'class VoiceAnalyzer');

eval(modifiedCode + `
const analyzer = new VoiceAnalyzer({});

const sampleRate = 44100;
const samples = new Float32Array(2048);
for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.sin(i * 0.1) + (Math.random() - 0.5) * 0.1;
}

console.time('estimateHNR_original');
for (let i = 0; i < 100; i++) {
    analyzer.estimateHNR(samples, sampleRate);
}
console.timeEnd('estimateHNR_original');

analyzer.estimateHNR_optimized = function(samples, sampleRate) {
    const minLag = Math.floor(sampleRate / 600);
    const maxLag = Math.floor(sampleRate / 75);

    // We only need autocorrelate up to maxLag (plus 0 for the denominator)
    const autocorr = this.autocorrelate(samples, maxLag + 1);

    // Find first peak (fundamental period)
    let maxCorr = -Infinity;
    let peakIndex = 0;

    for (let i = minLag; i < Math.min(maxLag, autocorr.length); i++) {
        if (autocorr[i] > maxCorr) {
            maxCorr = autocorr[i];
            peakIndex = i;
        }
    }

    if (maxCorr <= 0) return null;

    // HNR approximation
    const hnrLinear = maxCorr / Math.abs(autocorr[0]);
    const hnrDb = 10 * Math.log10(hnrLinear + 1e-10);

    return hnrDb;
};

// Also overriding autocorrelate slightly so that it takes a maxLag parameter if provided
analyzer.autocorrelate = function(samples, maxLag) {
    const limit = maxLag !== undefined ? Math.min(samples.length, maxLag) : samples.length;
    const result = new Float32Array(limit);
    for (let lag = 0; lag < limit; lag++) {
        let sum = 0;
        for (let i = 0; i < samples.length - lag; i++) {
            sum += samples[i] * samples[i + lag];
        }
        result[lag] = sum;
    }
    return result;
};

console.time('estimateHNR_optimized');
for (let i = 0; i < 100; i++) {
    analyzer.estimateHNR_optimized(samples, sampleRate);
}
console.timeEnd('estimateHNR_optimized');
`);
