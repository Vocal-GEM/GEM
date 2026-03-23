const fs = require('fs');
let content = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');

const search = `            // No recursive requestAnimationFrame - RenderCoordinator handles this
        };

        // Update history
        ['jitter', 'shimmer', 'weight'].forEach(key => {
            historyRef.current[key].push(data[key] || 0);
            if (historyRef.current[key].length > maxHistory) {
                historyRef.current[key].shift();
            }
        });

        // REMOVED: requestAnimationFrame(loop) - handled by renderCoordinator
    }, [dataRef]);`;

const replace = `            // No recursive requestAnimationFrame - RenderCoordinator handles this
        };

        // REMOVED: requestAnimationFrame(loop) - handled by renderCoordinator
    }, [dataRef, maxHistory, componentId]);`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', content);
