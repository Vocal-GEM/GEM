import os
import re

def fix_mic_calibration():
    with open('src/components/ui/MicrophoneCalibration.jsx', 'r') as f:
        content = f.read()
    content = content.replace('Say "Ahhhh"', 'Say &quot;Ahhhh&quot;')
    with open('src/components/ui/MicrophoneCalibration.jsx', 'w') as f:
        f.write(content)

def fix_intake_questionnaire():
    with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
        content = f.read()
    content = content.replace('Click "Complete Profile"', 'Click &quot;Complete Profile&quot;')
    content = content.replace('what\'s', 'what&apos;s')
    with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
        f.write(content)

def fix_task_recorder():
    with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
        content = f.read()
    content = content.replace('"{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}"', '&quot;{task.prompt.replace(\'Read: "\', \'\').replace(\'"\', \'\')}&quot;')
    with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
        f.write(content)

def fix_client_dashboard():
    with open('src/components/professional/ClientDashboard.jsx', 'r') as f:
        content = f.read()
    content = content.replace("import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';", "import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical, Activity } from 'lucide-react';")
    with open('src/components/professional/ClientDashboard.jsx', 'w') as f:
        f.write(content)

def fix_pitch_worklet():
    with open('src/audio/PitchWorklet.js', 'r') as f:
        content = f.read()
    content = content.replace('const startTime = currentTime;', 'const startTime = globalThis.currentTime || 0;')
    content = content.replace('const processingTime = (currentTime - startTime) * 1000;', 'const processingTime = ((globalThis.currentTime || 0) - startTime) * 1000;')
    content = content.replace('timestamp: currentTime,', 'timestamp: globalThis.currentTime || 0,')
    with open('src/audio/PitchWorklet.js', 'w') as f:
        f.write(content)

def fix_breathiness_meter():
    with open('src/components/viz/BreathinessMeter.jsx', 'r') as f:
        lines = f.readlines()
    with open('src/components/viz/BreathinessMeter.jsx', 'w') as f:
        found_import = False
        for line in lines:
            if "import { renderCoordinator } from '../../services/RenderCoordinator';" in line:
                if found_import:
                    continue # skip duplicate
                found_import = True
            f.write(line)

def fix_brightness_meter_test():
    with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
        content = f.read()
    content = content.replace("const React = require('react');", "const React = await import('react');")
    with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
        f.write(content)

def fix_highres_spectrogram():
    with open('src/components/viz/HighResSpectrogram.jsx', 'r') as f:
        lines = f.readlines()
    with open('src/components/viz/HighResSpectrogram.jsx', 'w') as f:
        for line in lines:
            if "const componentId = `spectrogram-highres-${uniqueId}`;" in line:
                continue
            f.write(line)

def fix_pitchorb_test():
    with open('src/components/viz/PitchOrb.test.jsx', 'r') as f:
        content = f.read()
    content = content.replace('global.requestAnimationFrame = mockRequestAnimationFrame;', 'globalThis.requestAnimationFrame = mockRequestAnimationFrame;')
    with open('src/components/viz/PitchOrb.test.jsx', 'w') as f:
        f.write(content)

def fix_quality_visualizer():
    with open('src/components/viz/QualityVisualizer.jsx', 'r') as f:
        content = f.read()
    content = content.replace('</p>;', '</p>')
    content = content.replace('</div>;', '</div>')
    with open('src/components/viz/QualityVisualizer.jsx', 'w') as f:
        f.write(content)

def fix_spectral_tilt_meter():
    with open('src/components/viz/SpectralTiltMeter.jsx', 'r') as f:
        content = f.read()
    content = content.replace('});\n            // No recursive requestAnimationFrame - RenderCoordinator handles this\n        };', '        };\n')
    with open('src/components/viz/SpectralTiltMeter.jsx', 'w') as f:
        f.write(content)

def fix_spectrogram3d_test():
    with open('src/components/viz/Spectrogram3D.test.jsx', 'r') as f:
        content = f.read()
    content = content.replace('global.', 'globalThis.')
    with open('src/components/viz/Spectrogram3D.test.jsx', 'w') as f:
        f.write(content)

def fix_spectrum_analyzer_test():
    with open('src/components/viz/SpectrumAnalyzer.test.jsx', 'r') as f:
        content = f.read()
    content = content.replace('global.', 'globalThis.')
    with open('src/components/viz/SpectrumAnalyzer.test.jsx', 'w') as f:
        f.write(content)

def fix_privacy_manager():
    with open('src/services/PrivacyManager.js', 'r') as f:
        content = f.read()
    content = content.replace('    shareProgress: false,\n    shareProgress: false,\n', '    shareProgress: false,\n')
    with open('src/services/PrivacyManager.js', 'w') as f:
        f.write(content)

def fix_research_mode():
    with open('src/services/ResearchMode.js', 'r') as f:
        content = f.read()
    content = content.replace('process.env.REACT_APP_RESEARCH_SALT', 'import.meta.env.VITE_RESEARCH_SALT')
    with open('src/services/ResearchMode.js', 'w') as f:
        f.write(content)

fix_mic_calibration()
fix_intake_questionnaire()
fix_task_recorder()
fix_client_dashboard()
fix_pitch_worklet()
fix_breathiness_meter()
fix_brightness_meter_test()
fix_highres_spectrogram()
fix_pitchorb_test()
fix_quality_visualizer()
fix_spectral_tilt_meter()
fix_spectrogram3d_test()
fix_spectrum_analyzer_test()
fix_privacy_manager()
fix_research_mode()
