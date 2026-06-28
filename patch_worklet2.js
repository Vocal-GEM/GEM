<<<<<<< SEARCH
                const processingTime = (currentTime - startTime) * 1000; // Convert to ms
                this.totalProcessTime += processingTime;
                this.processCount++;

                // Send result to main thread
                this.port.postMessage({
                    type: 'pitch',
                    pitch: result.pitch,
                    confidence: result.confidence,
                    timestamp: currentTime,
                    latency: processingTime,
=======
                const processingTime = (globalThis.currentTime - startTime) * 1000; // Convert to ms
                this.totalProcessTime += processingTime;
                this.processCount++;

                // Send result to main thread
                this.port.postMessage({
                    type: 'pitch',
                    pitch: result.pitch,
                    confidence: result.confidence,
                    timestamp: globalThis.currentTime,
                    latency: processingTime,
>>>>>>> REPLACE
