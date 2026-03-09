with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    content = f.read()

content = content.replace(
"""// Override global mock for this test to include Smile
vi.mock('lucide-react', () => {
    const React = require('react');
    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });

    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});""",
"""// Override global mock for this test to include Smile
vi.mock('lucide-react', async (importOriginal) => {
    const React = await import('react');
    const createIcon = (name) => {
        const component = (props) => React.createElement('div', { ...props, 'data-testid': name });
        component.displayName = name;
        return component;
    };
    return {
        ...(await importOriginal()),
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});"""
)

with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.write(content)
