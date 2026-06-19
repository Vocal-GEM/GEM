with open("src/components/viz/BrightnessMeter.test.jsx", "r") as f:
    content = f.read()

# Add display name to the second component too
search = "const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });"
replace = """const createIcon = (name) => {
        const IconComponent = (props) => React.createElement('div', { ...props, 'data-testid': name });
        IconComponent.displayName = name;
        return IconComponent;
    };"""

content = content.replace(search, replace)

with open("src/components/viz/BrightnessMeter.test.jsx", "w") as f:
    f.write(content)
