with open('src/components/viz/BreathinessMeter.jsx', 'r') as f:
    content = f.read()

content = content.replace("const lastValueRef = useRef(50);\n    const componentId = useId();\n    const id = useId();", "const lastValueRef = useRef(50);\n    const componentId = useId();")
content = content.replace("    const uniqueId = `breathiness-meter-${id}`;", "    const uniqueId = `breathiness-meter-${componentId}`;")

with open('src/components/viz/BreathinessMeter.jsx', 'w') as f:
    f.write(content)
