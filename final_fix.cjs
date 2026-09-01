const fs = require('fs');

function fix(file, searchValue, replaceValue) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(searchValue, replaceValue);
    fs.writeFileSync(file, content);
}

// 1. MPTTracker
let mptContent = fs.readFileSync('src/components/viz/MPTTracker.jsx', 'utf8');
// Fix undefined renderCoordinator and remove animationRef unused
if (!mptContent.includes("import { renderCoordinator } from '../../services/RenderCoordinator';")) {
    mptContent = "import { renderCoordinator } from '../../services/RenderCoordinator';\n" + mptContent;
}
mptContent = mptContent.replace("const animationRef = useRef(null);", "");
fs.writeFileSync('src/components/viz/MPTTracker.jsx', mptContent);

// 2. SZRatio
let szContent = fs.readFileSync('src/components/viz/SZRatio.jsx', 'utf8');
if (!szContent.includes("import { renderCoordinator } from '../../services/RenderCoordinator';")) {
    szContent = "import { renderCoordinator } from '../../services/RenderCoordinator';\n" + szContent;
}
szContent = szContent.replace("const animationRef = useRef(null);", "");
fs.writeFileSync('src/components/viz/SZRatio.jsx', szContent);

// 3. VowelAnalysis
let vowelContent = fs.readFileSync('src/components/viz/VowelAnalysis.jsx', 'utf8');
if (!vowelContent.includes("import { renderCoordinator } from '../../services/RenderCoordinator';")) {
    vowelContent = "import { renderCoordinator } from '../../services/RenderCoordinator';\n" + vowelContent;
}
fs.writeFileSync('src/components/viz/VowelAnalysis.jsx', vowelContent);

// 4. VowelSpacePlot
let vspContent = fs.readFileSync('src/components/viz/VowelSpacePlot.jsx', 'utf8');
vspContent = vspContent.replace("cancelAnimationFrame(animationId);", "unsubscribe();");
fs.writeFileSync('src/components/viz/VowelSpacePlot.jsx', vspContent);
