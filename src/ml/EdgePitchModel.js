import * as tf from '@tensorflow/tfjs';
import { computeMelSpectrogram } from '../utils/melSpectrogram';

export class EdgePitchModel {
    constructor() {
        this.model = null;
        this.isLoaded = false;
    }

    async load() {
        try {
            // Load quantized model for mobile
            // In a real scenario, this URL would point to a hosted model file
            // For now we will assume it is served from the public/models directory
            this.model = await tf.loadGraphModel('/models/pitch_detector_quantized/model.json');
            this.isLoaded = true;
            console.log('EdgePitchModel loaded successfully');
        } catch (error) {
            console.error('Failed to load EdgePitchModel:', error);
            this.isLoaded = false;
        }
    }

    async predict(audioBuffer) {
        if (!this.isLoaded || !this.model) {
            console.warn('EdgePitchModel not loaded, cannot predict');
            return { pitch: null, confidence: 0 };
        }

        // Preprocess
        const input = this.preprocess(audioBuffer);

        // Run inference
        const tensor = tf.tensor2d([input], [1, input.length]); // Ensure correct shape [batch, features]

        try {
            const output = await this.model.executeAsync(tensor);

            // Postprocess
            const result = this.postprocess(output);

            // Cleanup tensors
            tensor.dispose();
            if (Array.isArray(output)) {
                output.forEach(t => t.dispose());
            } else {
                output.dispose();
            }

            return result;
        } catch (error) {
            console.error('Error during inference:', error);
            tensor.dispose();
            return { pitch: null, confidence: 0 };
        }
    }

    preprocess(audioBuffer) {
        // Compute mel spectrogram (same as training)
        // Flattening the spectrogram for the model input if expected, 
        // or keeping 2D depending on model architecture. 
        // Assuming flattened for a simple dense network or specific input shape.
        const melSpec = computeMelSpectrogram(audioBuffer, {
            sampleRate: 16000,
            nMels: 80,
            hopLength: 160,
            fMin: 50,
            fMax: 8000
        });

        return melSpec;
    }

    postprocess(output) {
        // Assuming output is [pitch_hz, confidence]
        // Or classification logits. Let's assume regression for pitch and separate confidence node
        const data = output.dataSync ? output.dataSync() : output[0].dataSync();

        const pitch = data[0];
        const confidence = data[1] !== undefined ? data[1] : 1.0; // Default confidence if not provided

        return {
            pitch,
            confidence
        };
    }
}
