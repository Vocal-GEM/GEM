export function computeMelSpectrogram(audioBuffer, config) {
    const {
        sampleRate = 16000,
        fftSize = 2048,
        hopLength = 160, // 10ms at 16kHz
        nMels = 80,
        fMin = 50,
        fMax = 8000
    } = config;

    const data = audioBuffer.getChannelData(0);
    const nFft = fftSize;
    const numFrames = Math.floor((data.length - nFft) / hopLength) + 1;

    // Create Mel filterbank
    const melBasis = createMelFilterbank(sampleRate, nFft, nMels, fMin, fMax);
    const melSpectrogram = new Float32Array(numFrames * nMels);

    // Hanning window
    const window = new Float32Array(nFft);
    for (let i = 0; i < nFft; i++) {
        window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (nFft - 1)));
    }

    const spectrum = new Float32Array(nFft / 2 + 1);
    const fftReal = new Float32Array(nFft);
    const fftImag = new Float32Array(nFft);

    for (let i = 0; i < numFrames; i++) {
        const start = i * hopLength;

        // Windowing
        for (let j = 0; j < nFft; j++) {
            fftReal[j] = data[start + j] * window[j];
            fftImag[j] = 0;
        }

        // FFT (Simple implementation for creating the file, later could use a library or optimized version)
        // For now, let's assume a simplified power spectrum calculation to keep it pure JS without heavy deps if possible,
        // or we can implement a basic Cooley-Tukey if Web Audio API isn't available for this offline processing.
        // However, usually we can use the Web Audio API's AnalyserNode for real-time, but for buffer processing we might need manual FFT.
        // Let's implement a basic Cooley-Tukey for now.
        fft(fftReal, fftImag);

        // Power Spectrum
        for (let j = 0; j <= nFft / 2; j++) {
            spectrum[j] = (fftReal[j] * fftReal[j] + fftImag[j] * fftImag[j]);
        }

        // Mel bin integration
        for (let m = 0; m < nMels; m++) {
            let sum = 0;
            for (let k = 0; k < spectrum.length; k++) {
                if (melBasis[m][k] > 0) {
                    sum += spectrum[k] * melBasis[m][k];
                }
            }
            // Log compression (dB)
            melSpectrogram[i * nMels + m] = Math.log10(Math.max(1e-10, sum));
        }
    }

    return melSpectrogram;
}

function createMelFilterbank(sampleRate, nFft, nMels, fMin, fMax) {
    const nFreqs = nFft / 2 + 1;
    const melMin = hzToMel(fMin);
    const melMax = hzToMel(fMax);
    const melPoints = new Float32Array(nMels + 2);
    const hzPoints = new Float32Array(nMels + 2);
    const binPoints = new Int32Array(nMels + 2);
    const filters = []; // Array of Float32Arrays

    for (let i = 0; i < nMels + 2; i++) {
        melPoints[i] = melMin + (i * (melMax - melMin)) / (nMels + 1);
        hzPoints[i] = melToHz(melPoints[i]);
        binPoints[i] = Math.floor(((nFft + 1) * hzPoints[i]) / sampleRate);
    }

    for (let m = 0; m < nMels; m++) {
        const filter = new Float32Array(nFreqs);
        for (let k = 0; k < nFreqs; k++) {
            if (k >= binPoints[m] && k < binPoints[m + 1]) {
                filter[k] = (k - binPoints[m]) / (binPoints[m + 1] - binPoints[m]);
            } else if (k >= binPoints[m + 1] && k < binPoints[m + 2]) {
                filter[k] = (binPoints[m + 2] - k) / (binPoints[m + 2] - binPoints[m + 1]);
            } else {
                filter[k] = 0;
            }
        }
        filters.push(filter);
    }
    return filters;
}

function hzToMel(f) {
    return 2595 * Math.log10(1 + f / 700);
}

function melToHz(m) {
    return 700 * (10 ** (m / 2595) - 1);
}

function fft(re, im) {
    const n = re.length;
    if (n <= 1) return;

    const half = n / 2;
    const evenRe = new Float32Array(half);
    const evenIm = new Float32Array(half);
    const oddRe = new Float32Array(half);
    const oddIm = new Float32Array(half);

    for (let i = 0; i < half; i++) {
        evenRe[i] = re[2 * i];
        evenIm[i] = im[2 * i];
        oddRe[i] = re[2 * i + 1];
        oddIm[i] = im[2 * i + 1];
    }

    fft(evenRe, evenIm);
    fft(oddRe, oddIm);

    for (let k = 0; k < half; k++) {
        const tRe = Math.cos(-2 * Math.PI * k / n) * oddRe[k] - Math.sin(-2 * Math.PI * k / n) * oddIm[k];
        const tIm = Math.sin(-2 * Math.PI * k / n) * oddRe[k] + Math.cos(-2 * Math.PI * k / n) * oddIm[k];

        re[k] = evenRe[k] + tRe;
        im[k] = evenIm[k] + tIm;
        re[k + half] = evenRe[k] - tRe;
        im[k + half] = evenIm[k] - tIm;
    }
}
