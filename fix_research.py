with open("src/services/ResearchMode.js", "r") as f:
    c = f.read()

c = c.replace('process.env.REACT_APP_RESEARCH_SALT', 'import.meta.env.VITE_RESEARCH_SALT || ""')

with open("src/services/ResearchMode.js", "w") as f:
    f.write(c)
