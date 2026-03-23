const fs = require('fs');
const acorn = require('acorn');
try {
  acorn.parse(fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8'), {sourceType: 'module', ecmaVersion: 2020});
} catch(e) {
  console.log(e);
}
