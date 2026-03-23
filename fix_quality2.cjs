const fs = require('fs');
let content = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');

// There is an extra useEffect loop defined inside the useEffect
const search = `    useEffect(() => {
        const loop = () => {`;

const replace = `    const loop = useCallback(() => {`;

content = content.replace(search, replace);

const search2 = `            // No recursive requestAnimationFrame - RenderCoordinator handles this
        };

        // REMOVED: requestAnimationFrame(loop) - handled by renderCoordinator
    }, [dataRef, maxHistory, componentId]);`;

const replace2 = `            // No recursive requestAnimationFrame - RenderCoordinator handles this
        // REMOVED: requestAnimationFrame(loop) - handled by renderCoordinator
    }, [dataRef, maxHistory, componentId]);`;

content = content.replace(search2, replace2);

fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', content);
