/**
 * Microphone Quality Analyzer
 * Analyzes microphone quality and recommends optimal settings
 */

/**
 * Analyze microphone quality
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {MediaStreamAudioSourceNode} microphoneSource - Microphone source node
 * @param {number} durationMs - Analysis duration in milliseconds
 * @returns {Promise<Object>} Quality analysis results
 */
export const analyzeMicrophoneQuality = async (audioContext, microphoneSource, durationMs = 3000) => {
    // Create analyzer
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    microphoneSource.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    const freqData = new Float32Array(bufferLength);

    // Collect samples
    const samples = [];
    const startTime = Date.now();

    return new Promise((resolve) => {
        const collectSamples = () => {
            if (Date.now() - startTime >= durationMs) {
                // Analysis complete
                analyser.disconnect();

                const analysis = analyzeSamples(samples, audioContext.sampleRate);
                resolve(analysis);
                return;
            }

            // Get time domain and frequency data
            analyser.getFloatTimeDomainData(dataArray);
            analyser.getFloatFrequencyData(freqData);

            samples.push({
                timeDomain: new Float32Array(dataArray),
                frequency: new Float32Array(freqData)
            });

            requestAnimationFrame(collectSamples);
        };

        collectSamples();
    });
};

/**
 * Analyze collected samples
 * @param {Array} samples - Collected audio samples
 * @param {number} sampleRate - Sample rate
 * @returns {Object} Analysis results
 */
const analyzeSamples = (samples, sampleRate) => {
    // Calculate noise floor (average RMS during collection)
    const rmsValues = samples.map(s => {
        const rms = Math.sqrt(
            s.timeDomain.reduce((sum, val) => sum + val * val, 0) / s.timeDomain.length
        );
        return rms;
    });

    const avgRms = rmsValues.reduce((a, b) => a + b, 0) / rmsValues.length;
    const noiseFloorDb = 20 * Math.log10(avgRms + 0.0001);

    // Analyze frequency response
    const freqResponse = analyzeFrequencyResponse(samples, sampleRate);

    // Calculate quality score (0-100)
    const qualityScore = calculateQualityScore(noiseFloorDb, freqResponse);

    // Generate recommendations
    const recommendations = getRecommendedSettings(noiseFloorDb, freqResponse, qualityScore);

    return {
        noiseFloorDb,
        frequencyResponse: freqResponse,
        qualityScore,
        recommendations,
        environment: getEnvironmentType(noiseFloorDb),
        timestamp: Date.now()
    };
};

/**
 * Analyze frequency response
 * @param {Array} samples - Collected samples
 * @param {number} sampleRate - Sample rate
 * @returns {Object} Frequency response analysis
 */
const analyzeFrequencyResponse = (samples, sampleRate) => {
    // Average frequency data across all samples
    const avgFreqData = new Float32Array(samples[0].frequency.length);

    samples.forEach(s => {
        for (let i = 0; i < s.frequency.length; i++) {
            avgFreqData[i] += s.frequency[i];
        }
    });

    for (let i = 0; i < avgFreqData.length; i++) {
        avgFreqData[i] /= samples.length;
    }

    // Analyze key frequency bands for voice
    const binSize = sampleRate / (avgFreqData.length * 2);

    const bands = {
        low: { min: 80, max: 250 },      // Fundamental frequency range
        mid: { min: 250, max: 2000 },    // Formant range
        high: { min: 2000, max: 8000 }   // Brightness/clarity
    };

    const response = {};

    for (const [name, band] of Object.entries(bands)) {
        const startBin = Math.floor(band.min / binSize);
        const endBin = Math.floor(band.max / binSize);

        let sum = 0;
        let count = 0;

        for (let i = startBin; i < endBin && i < avgFreqData.length; i++) {
            sum += avgFreqData[i];
            count++;
        }

        response[name] = count > 0 ? sum / count : -100;
    }

    // Calculate flatness (good mics have flat response)
    const values = Object.values(response);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const flatness = Math.sqrt(variance);

    return {
        ...response,
        flatness,
        isFlatResponse: flatness < 10 // Less than 10dB variance is good
    };
};

/**
 * Calculate overall quality score
 * @param {number} noiseFloorDb - Noise floor in dB
 * @param {Object} freqResponse - Frequency response analysis
 * @returns {number} Quality score 0-100
 */
const calculateQualityScore = (noiseFloorDb, freqResponse) => {
    let score = 100;

    // Penalize high noise floor
    if (noiseFloorDb > -40) {
        score -= 30; // Very noisy
    } else if (noiseFloorDb > -50) {
        score -= 15; // Moderately noisy
    } else if (noiseFloorDb > -60) {
        score -= 5; // Slightly noisy
    }

    // Penalize poor frequency response
    if (!freqResponse.isFlatResponse) {
        score -= 20;
    }

    // Penalize weak low frequencies (important for pitch detection)
    if (freqResponse.low < -60) {
        score -= 15;
    }

    return Math.max(0, Math.round(score));
};

/**
 * Get recommended settings based on analysis
 * @param {number} noiseFloorDb - Noise floor in dB
 * @param {Object} freqResponse - Frequency response
 * @param {number} qualityScore - Quality score
 * @returns {Object} Recommended settings
 */
const getRecommendedSettings = (noiseFloorDb, freqResponse, qualityScore) => {
    // Noise gate threshold: 6dB above noise floor
    const noiseGateDb = noiseFloorDb + 6;
    // Convert to linear amplitude (approximate)
    const noiseGateThreshold = Math.pow(10, noiseGateDb / 20);

    // Gain compensation for quiet mics
    const gainCompensation = noiseFloorDb > -40 ? 1.2 : 1.0;

    // Smoothing factor based on noise level
    const smoothingFactor = noiseFloorDb > -30 ? 0.9 : 0.8;

    // Pitch detection confidence threshold
    const confidenceThreshold = qualityScore > 70 ? 0.6 : 0.75;

    return {
        noiseGateThreshold,
        gainCompensation,
        smoothingFactor,
        confidenceThreshold,
        message: getRecommendationMessage(qualityScore, noiseFloorDb)
    };
};

/**
 * Get environment type based on noise floor
 * @param {number} noiseFloorDb - Noise floor in dB
 * @returns {string} Environment type
 */
const getEnvironmentType = (noiseFloorDb) => {
    if (noiseFloorDb < -60) return 'quiet';
    if (noiseFloorDb < -45) return 'normal';
    return 'noisy';
};

/**
 * Get user-friendly recommendation message
 * @param {number} qualityScore - Quality score
 * @param {number} noiseFloorDb - Noise floor
 * @returns {string} Recommendation message
 */
const getRecommendationMessage = (qualityScore, noiseFloorDb) => {
    if (qualityScore >= 80) {
        return '✅ Excellent microphone quality! Your setup is optimal for voice training.';
    } else if (qualityScore >= 60) {
        return '✓ Good microphone quality. Results should be accurate.';
    } else if (qualityScore >= 40) {
        if (noiseFloorDb > -40) {
            return '⚠️ High background noise detected. Try to find a quieter environment or use a headset microphone.';
        } else {
            return '⚠️ Microphone quality is fair. Consider using an external microphone for better results.';
        }
    } else {
        return '❌ Poor microphone quality. For best results, use a headset or external microphone in a quiet room.';
    }
};

/**
 * Quick microphone test (simplified version)
 * @param {AudioContext} audioContext - Audio context
 * @param {MediaStreamAudioSourceNode} microphoneSource - Microphone source
 * @returns {Promise<Object>} Quick test results
 */
export const quickMicrophoneTest = async (audioContext, microphoneSource) => {
    return analyzeMicrophoneQuality(audioContext, microphoneSource, 1000);
};
