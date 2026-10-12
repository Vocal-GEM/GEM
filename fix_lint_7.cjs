const fs = require('fs');

function fixDuplicates(filePath) {
    if (fs.existsSync(filePath)) {
        let lines = fs.readFileSync(filePath, 'utf8').split('\n');
        let newLines = [];
        let i = 0;
        while (i < lines.length) {
            if (i < lines.length - 1 && lines[i] === lines[i+1] && lines[i].trim() !== '') {
                newLines.push(lines[i]);
                i += 2;
            } else {
                newLines.push(lines[i]);
                i += 1;
            }
        }
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`Fixed duplicates in ${filePath}`);
    }
}

fixDuplicates('src/components/community/SuccessStories.test.jsx');
fixDuplicates('src/components/ui/LoadingSpinner.test.jsx');
fixDuplicates('src/components/ui/JournalForm.test.jsx');
fixDuplicates('src/components/ui/LoadingSpinnerVerification.jsx');
fixDuplicates('src/components/ui/QuickActions.jsx');
fixDuplicates('src/components/ui/button.test.jsx');
fixDuplicates('src/components/viz/BreathinessMeter.jsx');
fixDuplicates('src/components/viz/HighResSpectrogram.jsx');
fixDuplicates('src/components/viz/QualityVisualizer.jsx');
fixDuplicates('src/components/viz/SpectralTiltMeter.jsx');
