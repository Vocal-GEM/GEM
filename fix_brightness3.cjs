const fs = require('fs');
let bTest = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf-8');
bTest = bTest.replace("    const React = require('react');", "    const React = require('react');");
bTest = bTest.replace("    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });", "    const createIcon = (name) => { const MockIcon = (props) => React.createElement('div', { ...props, 'data-testid': name }); MockIcon.displayName = name; return MockIcon; };");
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', bTest);
