class VoiceQualityProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this.chunkBuffers = [];
        this.chunkTargetSamples = 0; // Will be set via message
        this.sampleRate = 0;

        this.port.onmessage = (e) => {
            if (e.data.type === 'config') {
                this.sampleRate = e.data.sampleRate;
                this.chunkTargetSamples = e.data.targetSamples;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input.length > 0) {
            const channelData = input[0];

            // We need to clone the data because the input buffer is reused
            const copy = new Float32Array(channelData);
            this.chunkBuffers.push(copy);

            const totalSamples = this.chunkBuffers.reduce((acc, buf) => acc + buf.length, 0);

            if (this.chunkTargetSamples > 0 && totalSamples >= this.chunkTargetSamples) {
                const chunk = new Float32Array(totalSamples);
                let offset = 0;
                for (const buf of this.chunkBuffers) {
                    chunk.set(buf, offset);
                    offset += buf.length;
                }

                // Send to main thread
                this.port.postMessage({
                    type: 'chunk',
                    pcm: chunk.buffer,
                    sr: this.sampleRate
                }, [chunk.buffer]); // Transfer the buffer for performance

                this.chunkBuffers = [];
            }
        }
        return true;
    }

    static get parameterDescriptors() {
        return [];
    }
}

registerProcessor('voice-quality-processor', VoiceQualityProcessor);

// Handle messages from main thread
// We can't use 'this' in the global scope, but we can listen on the port in the constructor?
// No, AudioWorkletProcessor doesn't have a global 'onmessage'.
// We handle it inside the class if needed, but for configuration, we usually use the port.

// Actually, we need to listen to the port for configuration.
// Let's add that to the constructor.
