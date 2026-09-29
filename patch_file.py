with open("src/components/ui/IntakeQuestionnaire.jsx", "r") as f: lines = f.readlines()
lines[165] = lines[165].replace("what's", "what&apos;s")
with open("src/components/ui/IntakeQuestionnaire.jsx", "w") as f: f.writelines(lines)
