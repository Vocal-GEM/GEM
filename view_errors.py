import sys

files_to_check = {
    "src/components/ui/MicrophoneCalibration.jsx": [300],
    "src/components/ui/IntakeQuestionnaire.jsx": [166, 401],
    "src/components/professional/TaskRecorder.jsx": [116],
    "src/components/professional/ClientDashboard.jsx": [130],
    "src/audio/PitchWorklet.js": [1, 51, 56, 65],
    "src/components/viz/BreathinessMeter.jsx": [5],
    "src/components/viz/HighResSpectrogram.jsx": [35],
    "src/components/viz/QualityVisualizer.jsx": [253],
    "src/components/viz/SpectralTiltMeter.jsx": [54],
    "src/services/PrivacyManager.js": [9],
    "src/services/ResearchMode.js": [62],
    "src/components/viz/BrightnessMeter.test.jsx": [17, 18],
    "src/components/viz/PitchOrb.test.jsx": [33],
    "src/components/viz/Spectrogram3D.test.jsx": [55, 66, 82, 94, 98, 99],
    "src/components/viz/SpectrumAnalyzer.test.jsx": [27]
}

for file, lines in files_to_check.items():
    print(f"\n--- {file} ---")
    try:
        with open(file, 'r') as f:
            content = f.readlines()
            for line in lines:
                start = max(0, line - 3)
                end = min(len(content), line + 2)
                print(f"Lines {start+1}-{end}:")
                for i in range(start, end):
                    print(f"{i+1}: {content[i].rstrip()}")
    except Exception as e:
        print(f"Error reading file: {e}")
