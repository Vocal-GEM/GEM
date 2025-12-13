/**
 * AudioEnhancer - Audio quality improvement utility
 * Applies noise reduction, normalization, and DC offset removal to audio recordings
 */

export class AudioEnhancer {
    /**
     * Enhance an AudioBuffer by applying noise reduction and normalization
     * @param {AudioBuffer} audioBuffer - The original audio buffer
     * @returns {Promise<AudioBuffer>} - Enhanced audio buffer
     */
    static async enhance(audioBuffer) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create offline context for processing
        const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        // Create source from original buffer
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        // 1. High-pass filter to remove low-frequency rumble (80Hz cutoff)
        const highpassFilter = offlineContext.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.value = 80;
        highpassFilter.Q.value = 0.7;

        // 2. Low-pass filter to remove high-frequency hiss (12kHz cutoff)
        const lowpassFilter = offlineContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 12000;
        lowpassFilter.Q.value = 0.7;

        // 3. Gentle notch filter for 60Hz hum (common power line interference)
        const notchFilter = offlineContext.createBiquadFilter();
        notchFilter.type = 'notch';
        notchFilter.frequency.value = 60;
        notchFilter.Q.value = 30; // Narrow Q to only affect 60Hz

        // Connect the processing chain
        source.connect(highpassFilter);
        highpassFilter.connect(lowpassFilter);
        lowpassFilter.connect(notchFilter);
        notchFilter.connect(offlineContext.destination);

        // Start processing
        source.start(0);
        const filteredBuffer = await offlineContext.startRendering();

        // Apply DC offset removal and normalization
        const enhancedBuffer = this.normalizeAndRemoveDC(filteredBuffer, audioContext);

        await audioContext.close();
        return enhancedBuffer;
    }

    /**
     * Remove DC offset and normalize audio to -3dB peak
     * @param {AudioBuffer} buffer - Input buffer
     * @param {AudioContext} audioContext - Audio context for creating new buffer
     * @returns {AudioBuffer} - Normalized buffer
     */
    static normalizeAndRemoveDC(buffer, audioContext) {
        const numberOfChannels = buffer.numberOfChannels;
        const length = buffer.length;
        const sampleRate = buffer.sampleRate;

        // Create new buffer for output
        const outputBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

        for (let channel = 0; channel < numberOfChannels; channel++) {
            const inputData = buffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);

            // Calculate DC offset (mean of all samples)
            let sum = 0;
            for (let i = 0; i < length; i++) {
                sum += inputData[i];
            }
            const dcOffset = sum / length;

            // Remove DC offset and find peak
            let peak = 0;
            for (let i = 0; i < length; i++) {
                outputData[i] = inputData[i] - dcOffset;
                const absSample = Math.abs(outputData[i]);
                if (absSample > peak) {
                    peak = absSample;
                }
            }

            // Normalize to -3dB (0.708 linear)
            const targetPeak = 0.708;
            if (peak > 0.001) { // Avoid division by near-zero
                const gain = targetPeak / peak;
                // Apply gain with soft limiting
                for (let i = 0; i < length; i++) {
                    let sample = outputData[i] * gain;
                    // Soft clip to prevent harsh clipping
                    if (sample > 1) sample = 1 - Math.exp(-(sample - 1));
                    else if (sample < -1) sample = -1 + Math.exp(-(-sample - 1));
                    outputData[i] = sample;
                }
            }
        }

        return outputBuffer;
    }

    /**
     * Convert an AudioBuffer back to a Blob for upload
     * @param {AudioBuffer} audioBuffer - The audio buffer to convert
     * @param {string} mimeType - Target MIME type (default: audio/wav)
     * @returns {Promise<Blob>} - The audio as a Blob
     */
    static async bufferToBlob(audioBuffer, mimeType = 'audio/wav') {
        // Encode as WAV
        const wavData = this.encodeWAV(audioBuffer);
        return new Blob([wavData], { type: mimeType });
    }

    /**
     * Encode AudioBuffer as WAV format
     * @param {AudioBuffer} audioBuffer 
     * @returns {ArrayBuffer}
     */
    static encodeWAV(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        // Interleave channels
        let interleaved;
        if (numChannels === 2) {
            const left = audioBuffer.getChannelData(0);
            const right = audioBuffer.getChannelData(1);
            interleaved = new Float32Array(left.length + right.length);
            for (let i = 0, j = 0; i < left.length; i++, j += 2) {
                interleaved[j] = left[i];
                interleaved[j + 1] = right[i];
            }
        } else {
            interleaved = audioBuffer.getChannelData(0);
        }

        const dataLength = interleaved.length * (bitDepth / 8);
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // Subchunk1Size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
        view.setUint16(32, numChannels * (bitDepth / 8), true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // Write audio data
        let offset = 44;
        for (let i = 0; i < interleaved.length; i++) {
            const sample = Math.max(-1, Math.min(1, interleaved[i]));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }

        return buffer;
    }
}

export default AudioEnhancer;
