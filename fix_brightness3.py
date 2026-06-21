import re

with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    content = f.read()

new_mock = """vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const createIcon = (name) => function MockIcon(props) { return React.createElement('div', { ...props, 'data-testid': name }); };

    return {
        ...actual,
        Sun: createIcon('mock-sun'),
        Moon: createIcon('mock-moon'),
        Smile: createIcon('mock-smile')
    };
});"""

content = re.sub(r"vi\.mock\('lucide-react', \(\) => \{.*?\n\}\);\n", new_mock + "\n", content, flags=re.DOTALL)

with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(content)
