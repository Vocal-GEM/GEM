const height = 512;
const maxBin = 341; // typical value for 8kHz range
const iterations = 10000; // Simulate 10000 frames

// Baseline
console.time('Baseline');
let totalBinIndex = 0;
for (let i = 0; i < iterations; i++) {
    for (let y = 0; y < height; y++) {
        const freqRatio = (height - 1 - y) / height;
        const binIndex = Math.floor(freqRatio * maxBin);
        totalBinIndex += binIndex;
    }
}
console.timeEnd('Baseline');

// Optimization: Precomputed Lookup
console.time('Precomputed');
const lookup = new Int32Array(height);
for (let y = 0; y < height; y++) {
    const freqRatio = (height - 1 - y) / height;
    lookup[y] = Math.floor(freqRatio * maxBin);
}

let totalBinIndexOpt = 0;
for (let i = 0; i < iterations; i++) {
    for (let y = 0; y < height; y++) {
        totalBinIndexOpt += lookup[y];
    }
}
console.timeEnd('Precomputed');
