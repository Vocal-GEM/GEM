const fs = require('fs');
let content = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');

const search = `        return () => {
            unsubscribe();
        };
    }, [dataRef, targetRange, colorBlindMode, id]);
    }, [dataRef, targetRange, colorBlindMode, componentId]);`;

const replace = `        return () => {
            unsubscribe();
        };
    }, [dataRef, targetRange, colorBlindMode, componentId]);`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', content);
