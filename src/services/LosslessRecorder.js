export class LosslessRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.config = {
            mimeType: 'audio/webm;codecs=opus', // Default fallback
            audioBitsPerSecond: 256000 // High bitrate
        };
    }

    async start(deviceId = 'default') {
        try {
            const constraints = {
                audio: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    channelCount: 2, // Stereo if available
                    sampleRate: 48000, // High sample rate
                    echoCancellation: false, // Turn off processing for raw audio
                    noiseSuppression: false,
                    autoGainControl: false
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Check supported types for highest quality
            const types = [
                'audio/webm;codecs=pcm',
                'audio/wav',
                'audio/webm;codecs=opus'
            ];

            for (const type of types) {
                if (MediaRecorder.isTypeSupported(type)) {
                    this.config.mimeType = type;
                    break;
                }
            }

            this.mediaRecorder = new MediaRecorder(this.stream, this.config);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start(100);
            return true;
        } catch (error) {
            console.error('Error starting lossless recorder:', error);
            throw error;
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                return resolve(null);
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: this.config.mimeType });
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
                this.mediaRecorder = null;
                resolve(audioBlob);
            };

            if (this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            } else {
                resolve(null);
            }
        });
    }

    getStream() {
        return this.stream;
    }
}

export const losslessRecorder = new LosslessRecorder();
