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

replaceInFile('src/components/community/SuccessStories.test.jsx', /import React from 'react';\nimport React from 'react';/, "import React from 'react';");
replaceInFile('src/components/ui/LoadingSpinner.test.jsx', /import { render, screen } from '@testing-library\/react';\nimport { render, screen } from '@testing-library\/react';/, "import { render, screen } from '@testing-library/react';");
