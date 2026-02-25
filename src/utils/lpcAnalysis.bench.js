
import { describe, bench } from 'vitest';
import { LPCAnalyzer } from './lpcAnalysis';

describe('LPCAnalyzer Benchmark', () => {
    const analyzer = new LPCAnalyzer();
    // const sampleRate = 48000; // Unused
    const bufferSize = 1024; // Typical buffer size
    const input = new Float32Array(bufferSize);

    // Fill with some data
    for (let i = 0; i < bufferSize; i++) {
        input[i] = Math.sin(i * 0.1) + 0.5 * Math.sin(i * 0.3);
    }

    bench('analyze', () => {
        analyzer.analyze(input);
    }, { time: 1000 });
});
