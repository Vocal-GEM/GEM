with open('src/components/viz/RegisterGauge.jsx', 'r') as f:
    c = f.read()

import re

# Remove the messy duplicate showChestWarning declarations
c = re.sub(r'        // F0 Threshold Check \(300 Hz\)\n    // eslint-disable-next-line no-unused-vars\n    const showChestWarning = f0 > 300 && registerData\.mechanism === \'M1\';\n\n', '', c)
c = re.sub(r'    // F0 Threshold Check \(300 Hz\)\n        // F0 Threshold Check \(300 Hz\)\n    \n\n    // F0 Threshold Check \(300 Hz\)\n    // eslint-disable-next-line no-unused-vars\n    const showChestWarning = f0 > 300 && registerData\.mechanism === \'M1\';\n\n', '', c)

# Insert it neatly just once before return (
if "const showChestWarning" not in c:
    c = c.replace("    return (", "    // F0 Threshold Check (300 Hz)\n    const showChestWarning = f0 > 300 && registerData.mechanism === 'M1';\n\n    return (")

# Remove eslint disable comments
c = c.replace("// eslint-disable-next-line no-unused-vars\n", "")

# We also had an unused `showChestWarning` inside the useEffect from the messy patch.
# Wait, let's just make sure it's correct.

with open('src/components/viz/RegisterGauge.jsx', 'w') as f:
    f.write(c)
