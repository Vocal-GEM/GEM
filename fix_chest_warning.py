with open('src/components/viz/RegisterGauge.jsx', 'r') as f:
    c = f.read()

import re
# Check if it was deleted, and if so add it back
if "const showChestWarning" not in c:
    c = c.replace("    return (\n        <div className=\"bg-slate-900/50 rounded-2xl p-5 border border-slate-800\">", "    // F0 Threshold Check (300 Hz)\n    const showChestWarning = f0 > 300 && registerData.mechanism === 'M1';\n\n    return (\n        <div className=\"bg-slate-900/50 rounded-2xl p-5 border border-slate-800\">")
    with open('src/components/viz/RegisterGauge.jsx', 'w') as f:
        f.write(c)
