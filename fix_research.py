with open('src/services/ResearchMode.js', 'r') as f:
    content = f.read()

content = content.replace("(typeof process !== 'undefined' ? process.env : {})", "import.meta.env")
with open('src/services/ResearchMode.js', 'w') as f:
    f.write(content)
