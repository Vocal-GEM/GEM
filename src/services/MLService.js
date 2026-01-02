import { EdgePitchModel } from '../ml/EdgePitchModel';

class MLService {
    constructor() {
        this.edgePitchModel = new EdgePitchModel();
        this.isReady = false;
        this.useML = true; // Feature flag
    }

    async initialize() {
        if (!this.useML) return;

        try {
            await this.edgePitchModel.load();
            this.isReady = true;
            console.log('ML Service initialized');
        } catch (error) {
            console.warn('ML Service initialization failed, falling back to DSP', error);
            this.isReady = false;
        }
    }

    async detectPitch(audioBuffer) {
        if (this.isReady && this.useML) {
            try {
                const result = await this.edgePitchModel.predict(audioBuffer);
                if (result && result.pitch !== null) {
                    return {
                        pitch: result.pitch,
                        confidence: result.confidence,
                        method: 'ml'
                    };
                }
            } catch (error) {
                // Silent fail to fallback
            }
        }

        return null; // Signal to use fallback algorithm
    }
}

export const mlService = new MLService();
