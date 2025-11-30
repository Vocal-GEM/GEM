/**
 * DSP Utility Library
 * Ported from resonance-processor.js for main-thread fallback
 */

export class DSP {
    static decimate(buffer, inputRate, targetRate) {
        if (targetRate >= inputRate) return buffer;
        const ratio = Math.floor(inputRate / targetRate);
        const newLength = Math.floor(buffer.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
            let sum = 0;
            for (let j = 0; j < ratio; j++) {
                sum += buffer[(i * ratio) + j];
            }
            result[i] = sum / ratio;
        }
        return result;
    }

    static applyWindow(signal) {
        const output = new Float32Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            output[i] = signal[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (signal.length - 1)));
        }
        return output;
    }

    static calculatePitchYIN(buffer, sampleRate, adaptiveThreshold = 0.15) {
        const bufferSize = buffer.length;
        const halfSize = Math.floor(bufferSize / 2);
        const yinBuffer = new Float32Array(halfSize);

        for (let tau = 0; tau < halfSize; tau++) {
            for (let i = 0; i < halfSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                yinBuffer[tau] += delta * delta;
            }
        }

        yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < halfSize; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        let tau = 0;
        for (tau = 2; tau < halfSize; tau++) {
            if (yinBuffer[tau] < adaptiveThreshold) {
                while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                break;
            }
        }

        if (tau == halfSize || yinBuffer[tau] >= adaptiveThreshold) return -1;

        let betterTau = tau;
        if (tau > 0 && tau < halfSize - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
            betterTau += adjustment;
        }

        const pitch = sampleRate / betterTau;
        if (pitch < 50 || pitch > 800) return -1;
        return pitch;
    }

    static getMagnitudeAtFrequency(buffer, freq, sampleRate) {
        const omega = 2 * Math.PI * freq / sampleRate;
        let real = 0;
        let imag = 0;
        for (let i = 0; i < buffer.length; i++) {
            real += buffer[i] * Math.cos(omega * i);
            imag -= buffer[i] * Math.sin(omega * i);
        }
        return Math.sqrt(real * real + imag * imag);
    }

    static simpleFFT(signal) {
        const N = signal.length;
        const spectrum = new Float32Array(N / 2);

        for (let k = 0; k < N / 2; k++) {
            let real = 0;
            let imag = 0;
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += signal[n] * Math.cos(angle);
                imag += signal[n] * Math.sin(angle);
            }
            spectrum[k] = Math.sqrt(real * real + imag * imag);
        }
        return spectrum;
    }

    static computeAutocorrelation(signal, order) {
        const R = new Float32Array(order + 1);
        const N = signal.length;
        for (let k = 0; k <= order; k++) {
            let sum = 0;
            for (let i = 0; i < N - k; i++) {
                sum += signal[i] * signal[i + k];
            }
            R[k] = sum;
        }
        return R;
    }

    static levinsonDurbin(R, order) {
        const a = new Float32Array(order + 1);
        const E = new Float32Array(order + 1);

        E[0] = R[0];
        a[0] = 1;

        const a_prev = new Float32Array(order + 1);

        for (let i = 1; i <= order; i++) {
            let sum = 0;
            for (let j = 1; j < i; j++) {
                sum += a_prev[j] * R[i - j];
            }

            const k = (R[i] - sum) / E[i - 1];

            a[i] = k;
            for (let j = 1; j < i; j++) {
                a[j] = a_prev[j] - k * a_prev[i - j];
            }

            E[i] = E[i - 1] * (1 - k * k);

            for (let j = 0; j <= i; j++) a_prev[j] = a[j];
        }

        return { a: a.slice(1), error: E[order] };
    }

    static computeLPCSpectrum(a, error, numPoints) {
        const magnitude = new Float32Array(numPoints);
        const gain = Math.sqrt(error);

        for (let i = 0; i < numPoints; i++) {
            const omega = (Math.PI * i) / (numPoints - 1);
            let real = 1.0;
            let imag = 0.0;

            for (let k = 0; k < a.length; k++) {
                const angle = -omega * (k + 1);
                real += a[k] * Math.cos(angle);
                imag += a[k] * Math.sin(angle);
            }

            const magA = Math.sqrt(real * real + imag * imag);
            magnitude[i] = 20 * Math.log10(gain / (magA + 1e-10));
        }
        return magnitude;
    }

    static findPeaks(envelope, sampleRate) {
        const peaks = [];
        const numPoints = envelope.length;

        for (let i = 1; i < numPoints - 1; i++) {
            if (envelope[i] > envelope[i - 1] && envelope[i] > envelope[i + 1]) {
                const freq = (i / (numPoints - 1)) * (sampleRate / 2);
                if (freq > 200) {
                    peaks.push({ freq, amp: envelope[i] });
                }
            }
        }
        return peaks;
    }

    static estimateVowel(f1, f2) {
        if (!f1 || !f2 || f1 === 0 || f2 === 0) return '';
        if (f1 < 550 && f2 > 1900) return 'i';
        if (f1 > 600 && f2 < 1800 && f2 > 1200) return 'a';
        if (f1 < 500 && f2 < 1200) return 'u';
        if (f1 > 500 && f1 < 800 && f2 < 1200) return 'o';
        return '';
    }

    static median(values) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const half = Math.floor(sorted.length / 2);
        if (sorted.length % 2) return sorted[half];
        return (sorted[half - 1] + sorted[half]) / 2.0;
    }

    static hzToSemitones(hz) {
        return 12 * Math.log2(hz / 440) + 69;
    }
}
