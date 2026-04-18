with open("src/components/ui/JournalForm.test.jsx", "r") as f:
    lines = f.readlines()

new_lines = lines[:15] + lines[19:]

with open("src/components/ui/JournalForm.test.jsx", "w") as f:
    f.writelines(new_lines)
