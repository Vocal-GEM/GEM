with open('src/services/ResearchMode.js', 'r') as file:
    content = file.read()
content = content.replace("import.meta.env.MODE === 'test'", "import.meta.env.MODE === 'test'")
