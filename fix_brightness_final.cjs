const fs = require('fs');
let bTest = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf-8');
bTest = bTest.replace("vi.mock('lucide-react', () => {\n    const React = require('react');", "vi.mock('lucide-react', () => {\n    // eslint-disable-next-line no-undef\n    const React = require('react');");
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', bTest);
