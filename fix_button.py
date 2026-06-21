with open('src/components/ui/button.test.jsx', 'r') as f:
    content = f.read()

content = content.split('import React from "react";')[0] + '  });\n});\n'

with open('src/components/ui/button.test.jsx', 'w') as f:
    f.write(content)
