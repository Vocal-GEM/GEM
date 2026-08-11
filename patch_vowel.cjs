const fs = require('fs');

const path = 'src/components/viz/VowelAnalysis.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `const VowelAnalysis = ({ dataRef, colorBlindMode }) => {
    const [currentVowel, setCurrentVowel] = useState('');
    const [currentF1, setCurrentF1] = useState(0);
    const [currentF2, setCurrentF2] = useState(0);

    useEffect(() => {
        const loop = () => {
            if (dataRef.current) {
                const { f1, f2, vowel } = dataRef.current;
                setCurrentVowel(vowel || '');
                setCurrentF1(f1 || 0);
                setCurrentF2(f2 || 0);
            }
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'vowel-analysis',
                loop,
                renderCoordinator.PRIORITY.LOW
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);`;

const searchRegex = /const VowelAnalysis = \(\(\{ dataRef, colorBlindMode \}\) => \{\n    const \[currentVowel, setCurrentVowel\] = useState\(''\);\n    const \[currentF1, setCurrentF1\] = useState\(0\);\n    const \[currentF2, setCurrentF2\] = useState\(0\);\n\n    useEffect\(\(\) => \{\n        const loop = \(\) => \{\n[\s\S]*?        return \(\) => \{\n            if \(unsubscribe\) unsubscribe\(\);\n        \};\n    \}, \[dataRef\]\);/;

content = content.replace(searchRegex, replacement);
fs.writeFileSync(path, content);
