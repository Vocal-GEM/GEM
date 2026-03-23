const fs = require('fs');
let content = fs.readFileSync('src/audio/PitchWorklet.js', 'utf8');

// Fix unused args
content = content.replace(/process\(inputs, outputs, parameters\)/g, "process(inputs, _outputs, _parameters)");

// Fix currentTime
content = content.replace(/currentTime/g, "(typeof globalThis.currentTime !== 'undefined' ? globalThis.currentTime : Date.now() / 1000)");

fs.writeFileSync('src/audio/PitchWorklet.js', content);
