const fs = require('fs');
let filepath = 'src/components/ui/RecommendedToolsWidget.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
    `"{recommendations.rationale.split('.')[0]}."`,
    `&quot;{recommendations.rationale.split('.')[0]}.&quot;`
);

fs.writeFileSync(filepath, content);
console.log('RecommendedToolsWidget.jsx patched.');
