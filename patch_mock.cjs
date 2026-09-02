const fs = require('fs');
const file = 'src/components/viz/BrightnessMeter.test.jsx';
let content = fs.readFileSync(file, 'utf8');

// The require error is from lucide-react mock
content = content.replace(/const React = require\('react'\);/, '');
content = content.replace(/React\.createElement\('div'/g, `require('react').createElement('div'`); // oh wait no, import React from 'react' is at the top. We can just use React.createElement
content = content.replace(
  /vi\.mock\('lucide-react', \(\) => {[\s\S]*?return {/g,
  `vi.mock('lucide-react', () => {\n    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });\n\n    return {`
);

fs.writeFileSync(file, content);
