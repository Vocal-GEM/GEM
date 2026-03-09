import fs from 'fs';

const file = 'src/utils/voiceAnalysis.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /autocorrelate\(samples\) \{\s*const result = new Float32Array\(samples\.length\);\s*for \(let lag = 0; lag < samples\.length; lag\+\+\) \{\s*let sum = 0;\s*for \(let i = 0; i < samples\.length - lag; i\+\+\) \{\s*sum \+= samples\[i\] \* samples\[i \+ lag\];\s*\}\s*result\[lag\] = sum;\s*\}\s*return result;\s*\}/,
    `autocorrelate(samples, maxLag) {
        // OPTIMIZATION: Limit lag computation to avoid O(N^2) on full array length
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
    }`
);

// We need to pass maxLag to autocorrelate in estimateHNR
content = content.replace(
    /estimateHNR\(samples, sampleRate\) \{\s*const autocorr = this\.autocorrelate\(samples\);\s*\/\/ Find first peak \(fundamental period\)\s*let maxCorr = -Infinity;\s*let peakIndex = 0;\s*const minLag = Math\.floor\(sampleRate \/ 600\);\s*const maxLag = Math\.floor\(sampleRate \/ 75\);/,
    `estimateHNR(samples, sampleRate) {
        // Find first peak (fundamental period)
        const minLag = Math.floor(sampleRate / 600);
        const maxLag = Math.floor(sampleRate / 75);

        // OPTIMIZATION: Only compute autocorrelation up to the required maxLag + 1 to save CPU
        const autocorr = this.autocorrelate(samples, maxLag + 1);

        let maxCorr = -Infinity;
        let peakIndex = 0;`
);

fs.writeFileSync(file, content, 'utf8');
