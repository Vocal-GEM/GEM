import { pipeline, env } from '@xenova/transformers';

class TranscriptionEngine {
    constructor() {
        this.pipe = null;
        this.modelName = 'Xenova/whisper-tiny'; // Use tiny for better performance on client
        this.isLoading = false;
    }

    async initialize() {
        if (this.pipe) return;

        this.isLoading = true;
        try {
            console.log('Loading Whisper model...');
            // Disable local models to force fetching from Hugging Face Hub
            // This prevents 404s on local files returning HTML (which causes JSON.parse error)
            env.allowLocalModels = false;

            this.pipe = await pipeline('automatic-speech-recognition', this.modelName);
            console.log('Whisper model loaded successfully');
        } catch (error) {
            console.error('Failed to load Whisper model:', error);
            if (error.message.includes('JSON.parse') || error.message.includes('unexpected character')) {
                throw new Error('Failed to load speech model. Please check your internet connection.');
            }
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    async transcribe(audioBlob) {
        if (!this.pipe) {
            await this.initialize();
        }

        try {
            // Convert Blob to URL for the pipeline
            const url = URL.createObjectURL(audioBlob);

            // Run transcription
            // return_timestamps: true is crucial for our alignment needs
            const output = await this.pipe(url, {
                return_timestamps: true,
                chunk_length_s: 30,
                stride_length_s: 5,
            });

            URL.revokeObjectURL(url);

            return this.processOutput(output);
        } catch (error) {
            console.error('Transcription failed:', error);
            throw error;
        }
    }

    processOutput(output) {
        // Format the output to match our application's needs
        // We need an array of words with start/end times
        // Note: The 'tiny' model might not return word-level timestamps perfectly,
        // but it returns segments. We might need to map segments or use a better model if performance allows.

        // If word timestamps are not available, we'll use segment timestamps
        // and split the text, distributing the time evenly (naive approach) 
        // or just return segments if the UI supports it.

        // For now, let's look at the structure. 
        // output.chunks usually contains { text, timestamp: [start, end] }

        const words = [];

        if (output.chunks) {
            output.chunks.forEach(chunk => {
                const text = chunk.text.trim();
                const [start, end] = chunk.timestamp;
                const chunkWords = text.split(/\s+/);
                const duration = end - start;
                const timePerWord = duration / chunkWords.length;

                chunkWords.forEach((word, index) => {
                    words.push({
                        text: word,
                        start: start + (index * timePerWord),
                        end: start + ((index + 1) * timePerWord)
                    });
                });
            });
        } else {
            // Fallback if chunks aren't present
            const text = output.text.trim();
            words.push({
                text: text,
                start: 0,
                end: 0 // Unknown duration
            });
        }

        return {
            text: output.text,
            words: words
        };
    }
}

// Export a singleton instance
export const transcriptionEngine = new TranscriptionEngine();
