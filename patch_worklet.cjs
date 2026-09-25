const fs = require('fs');
const file = 'src/audio/PitchWorklet.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`            if (this.bufferIndex >= this.bufferSize) {
                const startTime = currentTime;`,
`            if (this.bufferIndex >= this.bufferSize) {
                const startTime = globalThis.currentTime;`
);
content = content.replace(
`                const processingTime = (currentTime - startTime) * 1000; // Convert to ms`,
`                const processingTime = (globalThis.currentTime - startTime) * 1000; // Convert to ms`
);
content = content.replace(
`                    timestamp: currentTime,`,
`                    timestamp: globalThis.currentTime,`
);
fs.writeFileSync(file, content);
