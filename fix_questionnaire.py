with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    content = f.read()

search1 = """                🔒 Your data is stored locally and private to you. We only capture what's needed to help you find your voice."""
replace1 = """                🔒 Your data is stored locally and private to you. We only capture what&apos;s needed to help you find your voice."""

search2 = """            Click "Complete Profile" to generate your personalized roadmap."""
replace2 = """            Click &quot;Complete Profile&quot; to generate your personalized roadmap."""

content = content.replace(search1, replace1)
content = content.replace(search2, replace2)

with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(content)
print("Success fixing questionnaire")
