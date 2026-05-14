const fs = require('fs');
const file = 'src/components/viz/HighResSpectrogram.jsx';
let content = fs.readFileSync(file, 'utf8');

const search = `    // Handle Resize with ResizeObserver
    // Cache dimensions to avoid getBoundingClientRect in loop or resize thrashing
    const cachedWidthRef = useRef(0);

    useEffect(() => {`;

const replace = `    // Handle Resize with ResizeObserver
    // Cache dimensions to avoid getBoundingClientRect in loop or resize thrashing
    const cachedWidthRef = useRef(0);

    useEffect(() => {`;
