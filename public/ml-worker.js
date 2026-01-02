// ml-worker.js

// Cache name
const CACHE_NAME = 'gem-ml-models-v1';

// Files to cache
const MODEL_FILES = [
    '/models/pitch_detector_quantized/model.json',
    '/models/pitch_detector_quantized/group1-shard1of1.bin'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(MODEL_FILES);
            })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/models/')) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(
                        (response) => {
                            // Check if we received a valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            // Clone the response
                            var responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        }
                    );
                })
        );
    }
});

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    if (event.data.type === 'PREDICT_PITCH') {
        // In a real implementation, we could run TFJS inside the worker 
        // using offscreen canvas / webgl backend if supported, or CPU backend.
        // For now, we will just acknowledge the message.
        // TF.js in web worker requires specific setup (setBackend('cpu') or 'wasm').

        // This is a placeholder for actual worker-side inference logic
        // which would import the EdgePitchModel and run it here.
        console.log('Worker received prediction request');
        self.postMessage({ type: 'PREDICTION_RESULT', payload: { pitch: 220, confidence: 0.9 } });
    }
});
