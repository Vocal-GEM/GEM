const fs = require('fs');
const content = fs.readFileSync('src/components/viz/DynamicOrb.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('SafeModeVisualizer = memo')) {
        console.log('Found SafeModeVisualizer at line', index + 1);
        for(let i=index; i<index+40; i++) {
            console.log(lines[i]);
        }
    }
});
