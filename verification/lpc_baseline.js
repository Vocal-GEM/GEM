import { LPCAnalyzer } from '../src/utils/lpcAnalysis.js';
import fs from 'fs';
import path from 'path';

// Use a fixed seed for random-ish values to be deterministic across runs
const seededRandom = (function() {
    let seed = 12345;
    return function() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
})();

const analyzer = new LPCAnalyzer();
const outputLog = path.join(process.cwd(), 'verification', 'lpc_baseline_output.txt');

// Generate deterministic input (complex signal)
const bufferSize = 2048;
const input = new Float32Array(bufferSize);
for (let i = 0; i < bufferSize; i++) {
    // Generate deterministic signal
    const t = i / 48000;
    input[i] = 0.5 * Math.sin(2 * Math.PI * 440 * t) +
               0.3 * Math.sin(2 * Math.PI * 880 * t) +
               0.1 * ((seededRandom() * 2) - 1);
}

// Run analysis 10 times to ensure stability
const results = [];
for (let i = 0; i < 10; i++) {
    const result = analyzer.analyze(input);
    // Deep copy results because future optimization will reuse buffers
    // We need to capture the state at this moment
    results.push({
        coefficients: Array.from(result.coefficients),
        envelopeSample: Array.from(result.envelope.slice(0, 10)),
        formants: result.formants
    });
}

if (fs.existsSync(outputLog)) {
    console.log('Comparing against baseline...');
    const baseline = JSON.parse(fs.readFileSync(outputLog, 'utf8'));

    // Compare
    const currentJson = JSON.stringify(results, null, 2);
    const baselineJson = JSON.stringify(baseline, null, 2);

    if (currentJson === baselineJson) {
        console.log('✅ PASS: Results match baseline exactly.');
    } else {
        console.error('❌ FAIL: Results do not match baseline.');
        // Diffing logic could be added here
        // For now, just fail
        process.exit(1);
    }
} else {
    fs.writeFileSync(outputLog, JSON.stringify(results, null, 2));
    console.log('Baseline generated at verification/lpc_baseline_output.txt');
}
