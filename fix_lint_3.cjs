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

replaceInFile('src/components/ui/RecommendedToolsWidget.jsx', /"See how you match"/g, '&quot;See how you match&quot;');
