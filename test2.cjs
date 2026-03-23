const fs = require('fs');
const content = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');

const babel = require('@babel/core');
try {
  babel.parse(content, {filename: 'src/components/viz/QualityVisualizer.jsx', presets: ['@babel/preset-react']});
} catch(e) {
  console.log(e.message);
}
