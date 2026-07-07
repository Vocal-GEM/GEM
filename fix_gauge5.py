with open('src/components/viz/RegisterGauge.jsx', 'r') as f:
    c = f.read()

# It's inside the useEffect! That's why it complains it's unused.
c = c.replace("    // F0 Threshold Check (300 Hz)\n    const showChestWarning = f0 > 300 && registerData.mechanism === 'M1';\n\n    return () => unsubscribe();\n    }, [dataRef]);", "    return () => unsubscribe();\n    }, [dataRef]);")

with open('src/components/viz/RegisterGauge.jsx', 'w') as f:
    f.write(c)
