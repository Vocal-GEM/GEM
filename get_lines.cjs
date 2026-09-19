const fs = require('fs');

function readLines(file, lines) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf-8');
    const allLines = content.split('\n');
    console.log(`\n--- ${file} ---`);
    lines.forEach(l => {
        const idx = l - 1;
        if (idx >= 0 && idx < allLines.length) {
            console.log(`${l}: ${allLines[idx]}`);
        }
    });
}

readLines('src/components/community/SuccessStories.test.jsx', [3, 4, 5, 6]);
readLines('src/components/professional/ClientDashboard.jsx', [128, 129, 130, 131, 132]);
readLines('src/components/ui/JournalForm.test.jsx', [15, 16, 17, 18, 19]);
readLines('src/components/ui/LoadingSpinner.test.jsx', [3, 4, 5, 6, 7]);
readLines('src/components/ui/LoadingSpinnerVerification.jsx', [84, 85, 86, 87]);
readLines('src/components/ui/QuickActions.jsx', [80, 81, 82, 83]);
readLines('src/components/viz/BreathinessMeter.jsx', [3, 4, 5, 6, 7]);
readLines('src/components/viz/HighResSpectrogram.jsx', [33, 34, 35, 36]);
readLines('src/components/viz/QualityVisualizer.jsx', [251, 252, 253, 254]);
readLines('src/components/viz/SpectralTiltMeter.jsx', [52, 53, 54, 55]);
