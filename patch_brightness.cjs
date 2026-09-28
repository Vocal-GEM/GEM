const fs = require('fs');
let code = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');

code = code.replace(
    /vi\.mock\('lucide-react', \(\) => \{\n    const React = require\('react'\);\n    const createIcon = \(name\) => \(props\) => React\.createElement\('div', \{ \.\.\.props, 'data-testid': name \}\);/g,
    "vi.mock('lucide-react', async () => {\n    const React = await import('react');\n    const createIcon = (name) => {\n        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });\n        Icon.displayName = name;\n        return Icon;\n    };"
);

fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', code);
