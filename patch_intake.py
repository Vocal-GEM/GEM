with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f:
    content = f.read()

content = content.replace("what's needed", "what&apos;s needed")
content = content.replace('I identify as "Feminine"', 'I identify as &quot;Feminine&quot;')
content = content.replace('I identify as "Masculine"', 'I identify as &quot;Masculine&quot;')
content = content.replace('I identify as "Androgynous/Neutral"', 'I identify as &quot;Androgynous/Neutral&quot;')

with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f:
    f.write(content)
