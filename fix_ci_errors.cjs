const fs = require('fs');

function replaceStr(file, oldStr, newStr) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(oldStr, newStr);
        fs.writeFileSync(file, content);
    } catch(e) {}
}

replaceStr('src/components/professional/ClientDashboard.jsx', '<Activity size={18} />', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>');
