import re

with open("src/components/viz/QualityVisualizer.jsx", "r") as f:
    content = f.read()

def count_braces(text):
    open_p = text.count('(')
    close_p = text.count(')')
    open_c = text.count('{')
    close_c = text.count('}')
    return open_p, close_p, open_c, close_c

print("Parentheses: ({}, {})".format(content.count('('), content.count(')')))
print("Curly: ({}, {})".format(content.count('{'), content.count('}')))
print("Divs: ({}, {})".format(content.count('<div'), content.count('</div')))
