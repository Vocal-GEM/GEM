const fs = require('fs');

const path = 'src/components/viz/VowelSpacePlot.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `    const [currentVowel, setCurrentVowel] = useState('');
    const [hitScore, setHitScore] = useState(0);

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // History trail
        const trail = [];

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Fade background slightly for trail effect
            ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // slate-950
            ctx.fillRect(0, 0, width, height);

            if (dataRef.current) {
                const { f1, f2, vowel } = dataRef.current;

                if (f1 > 0 && f2 > 0) {
                    const x = width - ((f2 - minF2) / (maxF2 - minF2)) * width;
                    const y = ((f1 - minF1) / (maxF1 - minF1)) * height;

                    // Add to trail
                    trail.push({ x, y });
                    if (trail.length > 20) trail.shift();

                    // Draw Trail
                    if (isRecording) {
                        ctx.beginPath();
                        ctx.moveTo(trail[0].x, trail[0].y);
                        for (let i = 1; i < trail.length; i++) {
                            ctx.lineTo(trail[i].x, trail[i].y);
                        }
                        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    } else if (trail.length > 0) {
                        trail.length = 0; // clear if not recording
                    }

                    // Update DOM Ref directly for high-perf point
                    if (pointRef.current) {
                        pointRef.current.style.transform = \`translate(\${x}px, \${y}px)\`;
                        pointRef.current.style.opacity = '1';
                    }
                    if (labelRef.current) {
                        labelRef.current.innerText = \`\${f1.toFixed(0)} / \${f2.toFixed(0)} Hz\`;
                        // Move label with point
                        labelRef.current.style.transform = \`translate(\${x + 15}px, \${y}px)\`;
                    }

                    setCurrentVowel(vowel);
                } else if (pointRef.current) {
                    pointRef.current.style.opacity = '0.1';
                }
            }
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'vowel-space',
                render,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        // Resize handler
        const resize = () => {
            if (!canvas.parentElement) return;
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        return () => {
            if (unsubscribe) unsubscribe();
            window.removeEventListener('resize', resize);
        };
    }, [dataRef, isRecording, maxF1, maxF2, minF1, minF2]);`;

const searchRegex = /    const \[currentVowel, setCurrentVowel\] = useState\(''\);\n    const \[hitScore, setHitScore\] = useState\(0\);\n\n    \/\/ Animation Loop\n    useEffect\(\(\) => \{\n[\s\S]*?        window.addEventListener\('resize', resize\);\n        resize\(\);\n\n        return \(\) => \{\n            cancelAnimationFrame\(animationId\);\n            window.removeEventListener\('resize', resize\);\n        \};\n    \}, \[dataRef, isRecording, maxF1, maxF2, minF1, minF2\]\);/;

content = content.replace(searchRegex, replacement);
fs.writeFileSync(path, content);
