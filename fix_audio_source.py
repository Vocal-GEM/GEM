with open('src/components/professional/AudioSourceManager.jsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';")

content = content.replace("    useEffect(() => {\n        checkPermissionAndEnumerate();\n    }, []);", "    useEffect(() => {\n        checkPermissionAndEnumerate();\n        // eslint-disable-next-line react-hooks/exhaustive-deps\n    }, []);")

with open('src/components/professional/AudioSourceManager.jsx', 'w') as f:
    f.write(content)
