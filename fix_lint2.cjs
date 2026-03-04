const fs = require('fs');

function replaceFile(path, searchRe, replaceStr) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(searchRe, replaceStr);
  fs.writeFileSync(path, content);
}

// 1. QuickActions.jsx (line 81)
let qa = fs.readFileSync('src/components/ui/QuickActions.jsx', 'utf8');
qa = qa.replace(/        \n        \n                \}\)\}/, '                ))}');
fs.writeFileSync('src/components/ui/QuickActions.jsx', qa);

// 2. button.test.jsx (line 32)
let bt = fs.readFileSync('src/components/ui/button.test.jsx', 'utf8');
bt = bt.replace(/import React from "react";\nimport \{ render, screen, fireEvent \} from "@testing-library\/react";/, '');
fs.writeFileSync('src/components/ui/button.test.jsx', bt);

// 3. QualityVisualizer.jsx
let qv = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
qv = qv.replace(/            <div className="flex justify-between items-center px-1 text-xs text-gray-500 mt-1">\n                <span>Light (Head)<\/span>\n                <span>Heavy (Chest)<\/span>\n            <\/div>\n        <\/div>\n    ;\n};/, '            <div className="flex justify-between items-center px-1 text-xs text-gray-500 mt-1">\n                <span>Light (Head)</span>\n                <span>Heavy (Chest)</span>\n            </div>\n        </div>\n    );\n};');
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', qv);

// 4. SpectralTiltMeter.jsx
let stm = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');
stm = stm.replace(/            <div className="flex justify-between items-center px-1 text-xs text-gray-500 mt-1">\n                <span>Darker (Heavy)<\/span>\n                <span>Brighter (Light)<\/span>\n            <\/div>\n        <\/div>\n    ;\n};/, '            <div className="flex justify-between items-center px-1 text-xs text-gray-500 mt-1">\n                <span>Darker (Heavy)</span>\n                <span>Brighter (Light)</span>\n            </div>\n        </div>\n    );\n};');
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', stm);

// 5. PrivacyManager.js
let pm = fs.readFileSync('src/services/PrivacyManager.js', 'utf8');
pm = pm.replace(/    shareProgress: false,\n    shareProgress: false,/, '    shareProgress: false,');
fs.writeFileSync('src/services/PrivacyManager.js', pm);
