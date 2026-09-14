const fs = require('fs');

let pw = fs.readFileSync('src/audio/PitchWorklet.js', 'utf8');
pw = pw.replace(/const processingTime = \(currentTime - startTime\) \* 1000; \/\/ Convert to ms/, 'const processingTime = (globalThis.currentTime - startTime) * 1000; // Convert to ms');
pw = pw.replace(/timestamp: currentTime,/, 'timestamp: globalThis.currentTime,');
fs.writeFileSync('src/audio/PitchWorklet.js', pw, 'utf8');

console.log("fixes applied");
