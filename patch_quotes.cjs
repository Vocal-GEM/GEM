const fs = require('fs');

let file = 'src/components/ui/RecommendedToolsWidget.jsx';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/"Daily Warm-Up"/g, "&quot;Daily Warm-Up&quot;");
    content = content.replace(/"Pitch Range Profile"/g, "&quot;Pitch Range Profile&quot;");
    content = content.replace(/"Pitch Range Profile"/g, "&quot;Pitch Range Profile&quot;");
    fs.writeFileSync(file, content);
}
