export const TOURS = {
    'practice_mode': [
        {
            target: 'mic-button',
            title: 'Start Practicing',
            content: 'Tap here to turn on the microphone and start real-time analysis.',
            placement: 'bottom'
        },
        {
            target: 'practice-tabs',
            title: 'Switch Views',
            content: 'Toggle between different visualizations like Pitch, Resonance, and Spectrogram.',
            placement: 'bottom'
        },
        {
            target: 'visualization-area',
            title: 'Real-time Feedback',
            content: 'Watch your voice metrics visualize here in real-time.',
            placement: 'right'
        },
        {
            target: 'dashboard-area',
            title: 'Analysis Dashboard',
            content: 'See detailed metrics and gender perception analysis as you practice.',
            placement: 'left'
        }
    ],
    'history_view': [
        {
            target: 'history-tabs',
            title: 'Track Progress',
            content: 'Switch between your Overview stats, detailed Session logs, and Journal entries.',
            placement: 'bottom'
        },
        {
            target: 'history-stats',
            title: 'Key Stats',
            content: 'Keep an eye on your streak and total practice time here.',
            placement: 'bottom'
        },
        {
            target: 'history-charts',
            title: 'Trends',
            content: 'Visualize your progress over time with these charts.',
            placement: 'top'
        }
    ]
};
