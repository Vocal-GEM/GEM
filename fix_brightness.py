with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    content = f.read()

new_content = content.replace(
    """// Override global mock for this test to include Smile
vi.mock('lucide-react', () => {
    const React = require('react');
    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });""",
    """// Override global mock for this test to include Smile
vi.mock('lucide-react', async () => {
    const React = await import('react');
    const createIcon = (name) => {
        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });
        Icon.displayName = name;
        return Icon;
    };"""
)

with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.write(new_content)
