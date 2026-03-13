const fs = require('fs');
let filepath = 'src/components/viz/BrightnessMeter.test.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
    "vi.mock('lucide-react', () => {",
    "vi.mock('lucide-react', async (importOriginal) => {"
);
content = content.replace(
    "const React = require('react');",
    "const React = await import('react');"
);
content = content.replace(
    "const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });",
    "const createIcon = (name) => {\n        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });\n        Icon.displayName = name;\n        return Icon;\n    };"
);

fs.writeFileSync(filepath, content);
console.log('BrightnessMeter.test.jsx patched.');
