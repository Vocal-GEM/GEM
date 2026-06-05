const fs = require('fs');

function replaceInFile(filepath, search, replacement) {
    if (fs.existsSync(filepath)) {
        let content = fs.readFileSync(filepath, 'utf8');
        content = content.replace(search, replacement);
        fs.writeFileSync(filepath, content);
        console.log(`Patched ${filepath}`);
    } else {
        console.log(`File not found: ${filepath}`);
    }
}

// 1. src/audio/PitchWorklet.js
replaceInFile('src/audio/PitchWorklet.js',
    /currentTime/g,
    'globalThis.currentTime'
);

// 2. src/components/community/SuccessStories.test.jsx
replaceInFile('src/components/community/SuccessStories.test.jsx',
    `import React from 'react';\nimport React from 'react';`,
    `import React from 'react';`
);

// 3. src/components/professional/ClientDashboard.jsx
replaceInFile('src/components/professional/ClientDashboard.jsx',
    `<Activity className="h-4 w-4 text-slate-400" />`,
    `<ActivityIcon className="h-4 w-4 text-slate-400" />`
);
replaceInFile('src/components/professional/ClientDashboard.jsx',
    `import { Users, FileText, Settings, Search, TrendingUp, Calendar, ChevronRight } from 'lucide-react';`,
    `import { Users, FileText, Settings, Search, TrendingUp, Calendar, ChevronRight, Activity as ActivityIcon } from 'lucide-react';`
);

// 4. src/components/professional/TaskRecorder.jsx
replaceInFile('src/components/professional/TaskRecorder.jsx',
    `"What was your favorite part of today?"`,
    `&quot;What was your favorite part of today?&quot;`
);

// 5. src/components/ui/IntakeQuestionnaire.jsx
replaceInFile('src/components/ui/IntakeQuestionnaire.jsx',
    `How does your voice feel at the end of the day? (e.g., "tired", "sore", "normal")`,
    `How does your voice feel at the end of the day? (e.g., &quot;tired&quot;, &quot;sore&quot;, &quot;normal&quot;)`
);
replaceInFile('src/components/ui/IntakeQuestionnaire.jsx',
    `What are your primary goals for your voice? (Select all that apply)`,
    `What are your primary goals for your voice? (Select all that apply)`
);
replaceInFile('src/components/ui/IntakeQuestionnaire.jsx',
    `I don't have any specific goals yet`,
    `I don&apos;t have any specific goals yet`
);

// 6. src/components/ui/JournalForm.test.jsx
replaceInFile('src/components/ui/JournalForm.test.jsx',
    `stopRecording\n`,
    `\n`
);

// 7. src/components/ui/LoadingSpinner.test.jsx
replaceInFile('src/components/ui/LoadingSpinner.test.jsx',
    `import { render, screen } from '@testing-library/react';\nimport { render } from '@testing-library/react';`,
    `import { render, screen } from '@testing-library/react';`
);

// 8. src/components/ui/LoadingSpinnerVerification.jsx
replaceInFile('src/components/ui/LoadingSpinnerVerification.jsx',
    `return \n    );`,
    `    );`
);
replaceInFile('src/components/ui/LoadingSpinnerVerification.jsx',
    `\n    return `,
    `\n`
);

// 9. src/components/ui/MicrophoneCalibration.jsx
replaceInFile('src/components/ui/MicrophoneCalibration.jsx',
    `"Testing, testing, one two three"`,
    `&quot;Testing, testing, one two three&quot;`
);

// 10. src/components/ui/QuickActions.jsx
replaceInFile('src/components/ui/QuickActions.jsx',
    `\n    }\n}`,
    `\n    }`
);

// 11. src/components/ui/TourOverlay.jsx
replaceInFile('src/components/ui/TourOverlay.jsx',
    `"Got it"`,
    `&quot;Got it&quot;`
);

// 12. src/components/ui/button.test.jsx
replaceInFile('src/components/ui/button.test.jsx',
    `\nimport { vi } from 'vitest';`,
    ``
);

// 13. src/components/viz/BreathinessMeter.jsx
replaceInFile('src/components/viz/BreathinessMeter.jsx',
    `import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { renderCoordinator } from '../../services/RenderCoordinator';`,
    `import { renderCoordinator } from '../../services/RenderCoordinator';`
);

// 14. src/components/viz/BrightnessMeter.test.jsx
replaceInFile('src/components/viz/BrightnessMeter.test.jsx',
    `const ResizeObserverMock = require('resize-observer-polyfill');`,
    `import ResizeObserverMock from 'resize-observer-polyfill';`
);
replaceInFile('src/components/viz/BrightnessMeter.test.jsx',
    `global.ResizeObserver = ResizeObserverMock;`,
    `globalThis.ResizeObserver = class ResizeObserver {\n  observe() {}\n  unobserve() {}\n  disconnect() {}\n};`
);

// 15. src/components/viz/HighResSpectrogram.jsx
replaceInFile('src/components/viz/HighResSpectrogram.jsx',
    `const componentId = useId();\n    const componentId = useId();`,
    `const componentId = useId();`
);

// 17. src/components/viz/QualityVisualizer.jsx
replaceInFile('src/components/viz/QualityVisualizer.jsx',
    `\n;`,
    ``
);

// 18. src/components/viz/SpectralTiltMeter.jsx
replaceInFile('src/components/viz/SpectralTiltMeter.jsx',
    `\n;`,
    ``
);

// 19. src/components/viz/Spectrogram3D.test.jsx
replaceInFile('src/components/viz/Spectrogram3D.test.jsx',
    /global\.requestAnimationFrame/g,
    'globalThis.requestAnimationFrame'
);
replaceInFile('src/components/viz/Spectrogram3D.test.jsx',
    /global\.ResizeObserver/g,
    'globalThis.ResizeObserver'
);
replaceInFile('src/components/viz/Spectrogram3D.test.jsx',
    /global\.cancelAnimationFrame/g,
    'globalThis.cancelAnimationFrame'
);
replaceInFile('src/components/viz/Spectrogram3D.test.jsx',
    /global\.THREE/g,
    'globalThis.THREE'
);

// 20. src/components/viz/SpectrumAnalyzer.test.jsx
replaceInFile('src/components/viz/SpectrumAnalyzer.test.jsx',
    /global\.ResizeObserver/g,
    'globalThis.ResizeObserver'
);

// 21. src/services/PrivacyManager.js
replaceInFile('src/services/PrivacyManager.js',
    `        shareProgress: false,\n        shareProgress: false,`,
    `        shareProgress: false,`
);

// 22. src/services/ResearchMode.js
replaceInFile('src/services/ResearchMode.js',
    `process.env.NODE_ENV`,
    `import.meta.env.MODE`
);
