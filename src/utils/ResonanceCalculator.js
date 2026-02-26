export class ResonanceCalculator {
    calculate(spectrum, nyquist) {
        let spectralCentroid = 0;
        let totalMagnitude = 0;

        for (let i = 0; i < spectrum.length; i++) {
            const freq = (i / spectrum.length) * nyquist;
            spectralCentroid += freq * spectrum[i];
            totalMagnitude += spectrum[i];
        }

        const centroid = totalMagnitude > 0 ? spectralCentroid / totalMagnitude : 0;
        const confidence = totalMagnitude > 0.01 ? 0.8 : 0.3; // Simple confidence based on signal strength

        return {
            resonance: centroid,
            confidence
        };
    }
}
