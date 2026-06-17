import re
import os
import json

with open('lint_errors.txt', 'r') as f:
    lines = f.readlines()

for line in lines:
    if "error" in line and "no-unescaped-entities" in line:
        # Example format: 175:73  error    `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`  react/no-unescaped-entities
        pass

# Actually, the quickest way to fix these is to run ESLint with --fix, if it supports fixing react/no-unescaped-entities.
