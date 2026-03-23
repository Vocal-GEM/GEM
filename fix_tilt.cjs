const fs = require('fs');
let content = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');

const search = `        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                \`spectral-tilt-meter-\${id}\`,
                loop,
                renderCoordinator.PRIORITY.MEDIUM
            );
        };

        const unsubscribe = renderCoordinator.subscribe(
            \`spectral-tilt-meter-\${componentId}\`,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };`;

const replace = `        const unsubscribe = renderCoordinator.subscribe(
            \`spectral-tilt-meter-\${componentId}\`,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', content);
