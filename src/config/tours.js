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
    ],
    'spectrogram': [
        {
            target: 'visualization-area',
            title: 'Spectrogram Reading',
            content: 'The brighter areas show where your voice resonance is strongest. Try to match the target patterns.',
            placement: 'right'
        }
    ],
    'daf_mode': [
        {
            target: 'daf-modal',
            title: 'Delayed Auditory Feedback',
            content: 'This tool plays your voice back with a slight delay to alter your speech processing loop.',
            placement: 'bottom'
        },
        {
            target: 'daf-info-box',
            title: 'How it Works',
            content: 'Read this quick guide to understand the benefits for fluency and pitch control.',
            placement: 'bottom'
        },
        {
            target: 'daf-delay-selector',
            title: 'Adjust Delay',
            content: 'Start with 150ms. Longer delays (200ms+) disrupt speech more, testing your focus.',
            placement: 'top'
        },
        {
            target: 'daf-start-button',
            title: 'Start Practice',
            content: 'Put on headphones and click here to begin.',
            placement: 'top'
        }
    ],
    'recordings_view': [
        {
            target: 'recordings-list',
            title: 'Your Library',
            content: 'All your practice sessions and baselines are saved here.',
            placement: 'top'
        },
        {
            target: 'recording-play-btn',
            title: 'Playback',
            content: 'Listen to your past recordings to hear your progress.',
            placement: 'right'
        }
    ]
};
