const fs = require('fs');
let content = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');

// There is an extra closing bracket or unmatched bracket in the original file
content = content.replace(/        \/\/ REMOVED: requestAnimationFrame\(loop\) \- handled by renderCoordinator\n    \}, \[dataRef\]\);/g, `        // REMOVED: requestAnimationFrame(loop) - handled by renderCoordinator`);

fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', content);
