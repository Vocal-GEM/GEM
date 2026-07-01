const fs = require('fs');
const content = fs.readFileSync('src/components/viz/VowelAnalysis.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('useEffect')) {
        console.log('Found useEffect at line', index + 1);
        for(let i=index; i<index+30; i++) {
            if (lines[i]) console.log(lines[i]);
        }
    }
});
