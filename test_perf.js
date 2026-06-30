const history = Array(100).fill(0).map(() => Math.random() * 100);
const currentP = 50;

if (history.length > 10 && currentP > 0) {
    const recent = history.slice(-10).filter(p => p > 0);
    if (recent.length > 5) {
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const variance = recent.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / recent.length;
        const stdDev = Math.sqrt(variance);
        console.log("Original:", stdDev);
    }
}

if (history.length > 10 && currentP > 0) {
    let sum = 0;
    let count = 0;
    for (let i = Math.max(0, history.length - 10); i < history.length; i++) {
        const p = history[i];
        if (p > 0) {
            sum += p;
            count++;
        }
    }
    if (count > 5) {
        const avg = sum / count;
        let varSum = 0;
        for (let i = Math.max(0, history.length - 10); i < history.length; i++) {
            const p = history[i];
            if (p > 0) {
                varSum += (p - avg) * (p - avg);
            }
        }
        const variance = varSum / count;
        const stdDev = Math.sqrt(variance);
        console.log("Optimized:", stdDev);
    }
}
