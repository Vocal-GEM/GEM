import os

filepath = 'src/components/viz/BrightnessMeter.test.jsx'
with open(filepath, 'r') as f:
    content = f.read()

old_mock = """vi.mock('lucide-react', () => {
    const React = require('react');
    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });

    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});"""

new_mock = """vi.mock('lucide-react', async () => {
    const React = await import('react');
    const createIcon = (name) => {
        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });
        Icon.displayName = name;
        return Icon;
    };

    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});"""

content = content.replace(old_mock, new_mock)

with open(filepath, 'w') as f:
    f.write(content)
