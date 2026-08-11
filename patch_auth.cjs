const fs = require('fs');

const path = 'src/context/AuthContext.test.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace("import { render, waitFor } from '@testing-library/react';", "import { render, screen, waitFor } from '@testing-library/react';");
fs.writeFileSync(path, content);
