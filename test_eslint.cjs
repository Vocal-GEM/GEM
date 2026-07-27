const { ESLint } = require('eslint');

async function main() {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(['src/components/ui/IntakeQuestionnaire.jsx', 'src/components/ui/RecommendedToolsWidget.jsx', 'src/components/professional/TaskRecorder.jsx', 'src/components/professional/ClientDashboard.jsx', 'src/audio/PitchWorklet.js', 'src/components/viz/QualityVisualizer.jsx']);

    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
}

main().catch(console.error);
