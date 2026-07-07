with open('src/components/viz/RegisterGauge.jsx', 'r') as f:
    c = f.read()

import re
c = re.sub(r'const showChestWarning = f0 > 300 && registerData\.mechanism === \'M1\';', '', c)
c = c.replace("{f0 > 290 && (", "{showChestWarning && (")
c = c.replace("    return (", "    // F0 Threshold Check (300 Hz)\n    const showChestWarning = f0 > 300 && registerData.mechanism === 'M1';\n\n    return (")

with open('src/components/viz/RegisterGauge.jsx', 'w') as f:
    f.write(c)
