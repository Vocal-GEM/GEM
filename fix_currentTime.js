const fs = require('fs');
let content = fs.readFileSync('src/audio/PitchWorklet.js', 'utf8');

// AudioWorklets in standard environments have `currentTime` available as a global,
// but ESLint doesn't know it unless specified, so we'll add a global comment
if (!content.includes('/* global currentTime */')) {
    content = '/* global currentTime */\n' + content;
}

// Since ESLint is complaining and we also replaced currentTime with currentFrame / this.sampleRate previously which broke
content = content.replace(/currentTime \/ this\.sampleRate/g, 'currentTime');
content = fs.writeFileSync('src/audio/PitchWorklet.js', content);
