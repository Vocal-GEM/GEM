import fs from 'fs';

let content = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
content = content.replace(
    "    const React = require('react');\n    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });\n\n    return {\n        Sun: createIcon('Sun'),\n        Moon: createIcon('Moon'),\n        Info: createIcon('Info'),\n        Smile: createIcon('Smile')\n    };\n});",
    `    const createIcon = (name) => {
        const MockComponent = function MockComponent(props) {
            return <div data-testid={name} {...props} />;
        };
        MockComponent.displayName = name;
        return MockComponent;
    };

    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});`
);
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', content);
