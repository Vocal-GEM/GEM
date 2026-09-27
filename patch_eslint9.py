import re

def rep(f, o, n):
    with open(f, 'r') as file:
        c = file.read()
    with open(f, 'w') as file:
        file.write(c.replace(o, n))

# /app/src/components/community/SuccessStories.test.jsx
# 4:8  error  Parsing error: Identifier 'React' has already been declared
rep("src/components/community/SuccessStories.test.jsx",
    "import React from 'react';\nimport React from 'react';",
    "import React from 'react';")

# /app/src/components/ui/JournalForm.test.jsx
# 16:9  error  Parsing error: Unexpected token stopRecording
rep("src/components/ui/JournalForm.test.jsx",
    "const stopRecording = vi.fn();\nstopRecording",
    "const stopRecording = vi.fn();")

# /app/src/components/ui/LoadingSpinner.test.jsx
# 5:10  error  Parsing error: Identifier 'render' has already been declared
rep("src/components/ui/LoadingSpinner.test.jsx",
    "import { render } from '@testing-library/react';\nimport { render, screen } from '@testing-library/react';",
    "import { render, screen } from '@testing-library/react';")

# /app/src/components/ui/LoadingSpinnerVerification.jsx
# 86:5  error  Parsing error: Unexpected token return
rep("src/components/ui/LoadingSpinnerVerification.jsx",
    "  };\n\n  return",
    "  };\n\n  return (")

# /app/src/components/ui/QuickActions.jsx
# 81:19  error  Parsing error: Unexpected token `}`. Did you mean `&rbrace;` or `{"}"}`?
rep("src/components/ui/QuickActions.jsx",
    "        }\n      </button>",
    "        }\n")

# /app/src/components/ui/button.test.jsx
# 32:1  error  Parsing error: 'import' and 'export' may only appear at the top level
rep("src/components/ui/button.test.jsx",
    "  import { fireEvent } from '@testing-library/react';",
    "")

# /app/src/components/viz/BreathinessMeter.jsx
# 5:10  error  Parsing error: Identifier 'renderCoordinator' has already been declared
rep("src/components/viz/BreathinessMeter.jsx",
    "import renderCoordinator from '../../services/RenderCoordinator';\nimport renderCoordinator from '../../services/RenderCoordinator';",
    "import renderCoordinator from '../../services/RenderCoordinator';")

# /app/src/components/viz/HighResSpectrogram.jsx
# 35:11  error  Parsing error: Identifier 'componentId' has already been declared
rep("src/components/viz/HighResSpectrogram.jsx",
    "  const componentId = useId();\n  const componentId = useId();",
    "  const componentId = useId();")

# /app/src/components/viz/QualityVisualizer.jsx
# 253:2  error  Parsing error: Unexpected token ;
rep("src/components/viz/QualityVisualizer.jsx",
    "  };\n;",
    "  };")

# /app/src/components/viz/SpectralTiltMeter.jsx
# 54:10  error  Parsing error: Unexpected token ;
rep("src/components/viz/SpectralTiltMeter.jsx",
    "  };\n;",
    "  };")

# /app/src/services/PrivacyManager.js
# 9:5  error  Duplicate key 'shareProgress'  no-dupe-keys
with open("src/services/PrivacyManager.js", "r") as f:
    content = f.read()
if "shareProgress: false," in content:
    lines = content.split('\n')
    seen = False
    new_lines = []
    for line in lines:
        if "shareProgress:" in line:
            if not seen:
                seen = True
                new_lines.append(line)
        else:
            new_lines.append(line)
    with open("src/services/PrivacyManager.js", "w") as f:
        f.write('\n'.join(new_lines))

# /app/src/services/ResearchMode.js
# 62:37  error  'process' is not defined  no-undef
rep("src/services/ResearchMode.js",
    "process.env.VITE_RESEARCH_SALT",
    "import.meta.env.VITE_RESEARCH_SALT")
