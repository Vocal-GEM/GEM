import re

with open('src/components/ui/button.test.jsx', 'r') as file:
    content = file.read()
# Let's check what's wrong with button.test.jsx
print("button.test.jsx length:", len(content))
