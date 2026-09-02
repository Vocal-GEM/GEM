const fs = require('fs');
const file = 'src/components/viz/BrightnessMeter.test.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /const { PRIORITY } = require\('\.\.\/\.\.\/services\/RenderCoordinator'\);\nvi\.mock\('\.\.\/\.\.\/services\/RenderCoordinator', \(\) => \(\{/,
  `vi.mock('../../services/RenderCoordinator', () => {
    const PRIORITY = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return {`
);
fs.writeFileSync(file, content);
