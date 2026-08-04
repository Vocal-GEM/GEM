import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The error is 'require' is not defined and Component definition is missing display name

    mock_code = """
vi.mock('lucide-react', () => {
    const React = require('react');
    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });

    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});
"""

    new_mock_code = """
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        Sun: (props) => <div data-testid="Sun" {...props} />,
        Moon: (props) => <div data-testid="Moon" {...props} />,
        Info: (props) => <div data-testid="Info" {...props} />,
        Smile: (props) => <div data-testid="Smile" {...props} />
    };
});
"""

    content = content.replace(mock_code.strip(), new_mock_code.strip())

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/components/viz/BrightnessMeter.test.jsx")
