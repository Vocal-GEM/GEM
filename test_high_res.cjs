const fs = require('fs');

try {
  const content = fs.readFileSync('src/components/viz/HighResSpectrogram.jsx', 'utf8');
  console.log("File is intact.");
} catch (e) {
  console.log("Error reading file", e);
}
