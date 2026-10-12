const fs = require('fs');

function replaceInFile(filePath, searchRegex, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(searchRegex, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

replaceInFile('src/components/community/SuccessStories.test.jsx', /import { render, screen, waitFor, fireEvent } from '@testing-library\/react';\nimport { vi, describe, test, expect, beforeEach } from 'vitest';\nimport React from 'react';\nimport { render, screen, fireEvent, waitFor } from '@testing-library\/react';\nimport { describe, it, expect, vi, beforeEach } from 'vitest';/g, "import { render, screen, waitFor, fireEvent } from '@testing-library/react';\nimport { vi, describe, test, expect, beforeEach, it } from 'vitest';\nimport React from 'react';");

replaceInFile('src/components/ui/LoadingSpinner.test.jsx', /import React from 'react';\nimport { render, screen } from '@testing-library\/react';\nimport { describe, it, expect } from 'vitest';\nimport LoadingSpinner from '\.\/LoadingSpinner';\nimport { render, screen } from '@testing-library\/react';\nimport { describe, test, expect } from 'vitest';\nimport LoadingSpinner from '\.\/LoadingSpinner';/, "import React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport { describe, it, test, expect } from 'vitest';\nimport LoadingSpinner from './LoadingSpinner';");

replaceInFile('src/components/ui/JournalForm.test.jsx', /    const stopRecording = vi\.fn\(\);\n    stopRecording = vi\.fn\(\);/g, "    const stopRecording = vi.fn();");

replaceInFile('src/components/ui/LoadingSpinnerVerification.jsx', /    return \(\n        <LoadingSpinner \/>\n    \);\n    return \(\n        <LoadingSpinner \/>\n    \);/g, "    return (\n        <LoadingSpinner />\n    );");

replaceInFile('src/components/ui/QuickActions.jsx', /        \}\n        \}\n    \}/g, "        }\n    }");

replaceInFile('src/components/ui/button.test.jsx', /import \{ render, screen \} from '@testing-library\/react';\nimport \{ describe, test, expect \} from 'vitest';\nimport \{ Button \} from '\.\/button';\nimport \{ render, screen \} from '@testing-library\/react';\nimport \{ describe, test, expect \} from 'vitest';\nimport \{ Button \} from '\.\/button';/, "import { render, screen } from '@testing-library/react';\nimport { describe, test, expect } from 'vitest';\nimport { Button } from './button';");

replaceInFile('src/components/viz/BreathinessMeter.jsx', /const renderCoordinator = new RenderCoordinator\(\);\nconst renderCoordinator = new RenderCoordinator\(\);/g, "const renderCoordinator = new RenderCoordinator();");

replaceInFile('src/components/viz/HighResSpectrogram.jsx', /    const componentId = useId\(\);\n    const componentId = useId\(\);/g, "    const componentId = useId();");

replaceInFile('src/components/viz/QualityVisualizer.jsx', /        \};\n        \};\n    \}, \[\]\);/g, "        };\n    }, []);");

replaceInFile('src/components/viz/SpectralTiltMeter.jsx', /        \};\n        \};\n    \}, \[\]\);/g, "        };\n    }, []);");
