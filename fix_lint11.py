import os
import re

with open('src/test/validation/algorithmValidation.test.js', 'r') as f:
    content = f.read()

content = re.sub(r"let pitchEnsemble;\s*", "", content)

with open('src/test/validation/algorithmValidation.test.js', 'w') as f:
    f.write(content)
