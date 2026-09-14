const fs = require('fs');

let qv = fs.readFileSync('src/components/viz/QualityVisualizer.jsx', 'utf8');
qv = qv.replace(/            }\n\n        }\n\n        animationRef\.current = requestAnimationFrame\(draw\);\n    };\n\n    };\n\n    const drawLPC/, '            }\n\n        }\n\n        animationRef.current = requestAnimationFrame(draw);\n    };\n\n    const drawLPC');
qv = qv.replace(/        }\n\n    };\n\n    useEffect\(/, '        }\n\n    useEffect(');
fs.writeFileSync('src/components/viz/QualityVisualizer.jsx', qv, 'utf8');

let stm = fs.readFileSync('src/components/viz/SpectralTiltMeter.jsx', 'utf8');
stm = stm.replace(/            }\n\n        }\n        animationRef\.current = requestAnimationFrame\(draw\);\n    };\n\n    };\n\n    return \(/, '            }\n\n        }\n        animationRef.current = requestAnimationFrame(draw);\n    };\n\n    return (');
stm = stm.replace(/        }\n        animationRef\.current = requestAnimationFrame\(draw\);\n    };\n\n    return \(/, '        }\n        animationRef.current = requestAnimationFrame(draw);\n    };\n\n    return (');
fs.writeFileSync('src/components/viz/SpectralTiltMeter.jsx', stm, 'utf8');
