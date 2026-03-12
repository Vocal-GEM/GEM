import re

with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    content = f.read()

# For BrightnessMeter.test.jsx, the previous change didn't fix 'require' completely because I just disabled the undef lint.
# But it still fails. Let's change the mock to use the standard factory syntax dynamically or just standard mock syntax without require.
# The file probably has:
# vi.mock('lucide-react', () => {
#    // eslint-disable-next-line no-undef
#    const React = require('react');

new_mock = """
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const React = await import('react');
    const createIcon = (name) => {
        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });
        Icon.displayName = name;
        return Icon;
    };
"""
content = re.sub(r"vi\.mock\('lucide-react', \(\) => \{\n\s*// eslint-disable-next-line no-undef\n\s*const React = require\('react'\);\n\s*const createIcon = \(name\) => \{\n\s*const Icon = \(props\) => React\.createElement\('div', \{ \.\.\.props, 'data-testid': name \}\);\n\s*Icon\.displayName = name;\n\s*return Icon;\n\s*\};", new_mock.strip(), content)

with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.write(content)
