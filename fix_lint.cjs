const fs = require('fs');

let content = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
content = content.replace(/    return \{\n        Sun: createIcon\('Sun'\),\n        Moon: createIcon\('Moon'\),\n        Smile: createIcon\('Smile'\)\n    \};\n\}\);/, `    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Smile: createIcon('Smile'),
        Info: createIcon('Info')
    };
});`);
fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', content);
