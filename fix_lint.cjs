const fs = require('fs');

function replaceFile(file, regex, replacement) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
}

replaceFile('src/components/viz/BrightnessMeter.test.jsx', /require\('react'\)/g, 'vi.fn()("react")');
