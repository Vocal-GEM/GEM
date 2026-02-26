import { DSP } from './DSP';

export class FormantAnalyzer {
    constructor() {
        this.smoothedF1 = 0;
        this.smoothedF2 = 0;
    }

    analyze(windowedBuffer, sampleRate) {
        const lpcOrder = 12;
        const r = DSP.computeAutocorrelation(windowedBuffer, lpcOrder);
        const { a, error } = DSP.levinsonDurbin(r, lpcOrder);
        const lpcEnvelope = DSP.computeLPCSpectrum(a, error, 512);
        const formantCandidates = DSP.findPeaks(lpcEnvelope, 16000); // Target rate is usually 16k for this DSP

        let p1 = { freq: 0, amp: -Infinity };
        let p2 = { freq: 0, amp: -Infinity };

        for (let candidate of formantCandidates) {
            if (candidate.freq >= 200 && candidate.freq <= 1200) {
                if (candidate.amp > p1.amp) p1 = candidate;
            }
        }
        for (let candidate of formantCandidates) {
            if (candidate.freq >= 1200 && candidate.freq <= 3500) {
                if (candidate.amp > p2.amp) p2 = candidate;
            }
        }

        // Formant Smoothing
        if (!this.smoothedF1) this.smoothedF1 = p1.freq;
        if (!this.smoothedF2) this.smoothedF2 = p2.freq;

        if (p1.freq > 0) {
            const diff = Math.abs(p1.freq - this.smoothedF1);
            const alpha = diff > 100 ? 0.3 : 0.1;
            this.smoothedF1 = this.smoothedF1 * (1 - alpha) + p1.freq * alpha;
        }
        if (p2.freq > 0) {
            const diff = Math.abs(p2.freq - this.smoothedF2);
            const alpha = diff > 150 ? 0.3 : 0.1;
            this.smoothedF2 = this.smoothedF2 * (1 - alpha) + p2.freq * alpha;
        }

        const vowel = DSP.estimateVowel(this.smoothedF1, this.smoothedF2);

        return {
            f1: this.smoothedF1,
            f2: this.smoothedF2,
            vowel
        };
    }

    reset() {
        this.smoothedF1 = 0;
        this.smoothedF2 = 0;
    }
}
