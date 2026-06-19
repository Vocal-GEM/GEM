with open("src/services/ResearchMode.js", "r") as f:
    content = f.read()
content = content.replace("process.env.REACT_APP_RESEARCH_SALT", "import.meta.env.VITE_RESEARCH_SALT || 'default_salt'")
with open("src/services/ResearchMode.js", "w") as f:
    f.write(content)
