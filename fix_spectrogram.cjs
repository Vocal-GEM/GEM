const fs = require('fs');
let content = fs.readFileSync('src/components/viz/HighResSpectrogram.jsx', 'utf8');

const search = `        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const spectrum = dataRef.current.spectrum;`;

const replace = `        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame
        const spectrum = dataRef.current.spectrum;`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/viz/HighResSpectrogram.jsx', content);
