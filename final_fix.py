import re

# PitchWorklet.js
with open('src/audio/PitchWorklet.js', 'r') as f:
    content = f.read()

content = content.replace("const startTime = typeof currentTime !== 'undefined' ? currentTime : performance.now() / 1000;", "// eslint-disable-next-line no-undef\n                const startTime = typeof currentTime !== 'undefined' ? currentTime : performance.now() / 1000;")
content = content.replace("const currentT = typeof currentTime !== 'undefined' ? currentTime : performance.now() / 1000;", "// eslint-disable-next-line no-undef\n                const currentT = typeof currentTime !== 'undefined' ? currentTime : performance.now() / 1000;")
content = content.replace("timestamp: typeof currentTime !== 'undefined' ? currentTime : performance.now() / 1000,", "// eslint-disable-next-line no-undef\n                    timestamp: typeof currentTime !== 'undefined' ? currentTime : performance.now() / 1000,")

with open('src/audio/PitchWorklet.js', 'w') as f:
    f.write(content)

# SuccessStories.test.jsx
with open('src/components/community/SuccessStories.test.jsx', 'r') as f:
    content = f.read()
content = content.replace("import React from 'react';\nimport { render, screen, waitFor } from '@testing-library/react';\nimport { describe, it, expect, vi, beforeEach } from 'vitest';\nimport React from 'react';", "import React from 'react';\nimport { render, screen, waitFor } from '@testing-library/react';\nimport { describe, it, expect, vi, beforeEach } from 'vitest';")
with open('src/components/community/SuccessStories.test.jsx', 'w') as f:
    f.write(content)

# ClientDashboard.jsx
with open('src/components/professional/ClientDashboard.jsx', 'r') as f:
    content = f.read()
if "Activity" not in content.split("\n")[0]:
    content = content.replace("import { Users, FileText, Settings, Video, FileAudio, ChevronRight, MessageSquare, Mic, User } from 'lucide-react';", "import { Users, FileText, Settings, Video, FileAudio, ChevronRight, MessageSquare, Mic, User, Activity } from 'lucide-react';")
with open('src/components/professional/ClientDashboard.jsx', 'w') as f:
    f.write(content)

# TaskRecorder.jsx
with open('src/components/professional/TaskRecorder.jsx', 'r') as f:
    content = f.read()
content = content.replace('Click "Start"', 'Click &quot;Start&quot;')
content = content.replace('click "Save"', 'click &quot;Save&quot;')
content = content.replace("You haven't", "You haven&apos;t")
with open('src/components/professional/TaskRecorder.jsx', 'w') as f:
    f.write(content)

# IntakeQuestionnaire.jsx
with open('src/components/ui/IntakeQuestionnaire.jsx', 'r') as f:
    content = f.read()
content = content.replace("I 'm", "I&apos;m")
content = content.replace("It's", "It&apos;s")
content = content.replace("don't", "don&apos;t")
content = content.replace('"I want to be read as female 100% of the time"', '&quot;I want to be read as female 100% of the time&quot;')
content = content.replace('"I want a slightly more feminine voice, but still androgynous"', '&quot;I want a slightly more feminine voice, but still androgynous&quot;')
with open('src/components/ui/IntakeQuestionnaire.jsx', 'w') as f:
    f.write(content)

# JournalForm.test.jsx
with open('src/components/ui/JournalForm.test.jsx', 'r') as f:
    content = f.read()
bad_mock = """vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    isRecording: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    isRecording: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    dataRef: { current: {} }
  })
}));"""
good_mock = """vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    isRecording: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    dataRef: { current: {} }
  })
}));"""
content = content.replace(bad_mock, good_mock)
with open('src/components/ui/JournalForm.test.jsx', 'w') as f:
    f.write(content)

# LoadingSpinner.test.jsx
with open('src/components/ui/LoadingSpinner.test.jsx', 'r') as f:
    content = f.read()
content = content.replace("import { render, screen } from '@testing-library/react';\nimport { describe, it, expect } from 'vitest';\nimport { render, screen } from '@testing-library/react';", "import { render, screen } from '@testing-library/react';\nimport { describe, it, expect } from 'vitest';")
with open('src/components/ui/LoadingSpinner.test.jsx', 'w') as f:
    f.write(content)

# LoadingSpinnerVerification.jsx
with open('src/components/ui/LoadingSpinnerVerification.jsx', 'r') as f:
    content = f.read()
bad_ret = """    return (
        return () => clearTimeout(timer);
    }, []);"""
good_ret = """        return () => clearTimeout(timer);
    }, []);"""
content = content.replace(bad_ret, good_ret)
with open('src/components/ui/LoadingSpinnerVerification.jsx', 'w') as f:
    f.write(content)

# MicrophoneCalibration.jsx
with open('src/components/ui/MicrophoneCalibration.jsx', 'r') as f:
    content = f.read()
content = content.replace('"Ooo"', '&quot;Ooo&quot;')
content = content.replace('"Eee"', '&quot;Eee&quot;')
content = content.replace('"Ahhh"', '&quot;Ahhh&quot;')
with open('src/components/ui/MicrophoneCalibration.jsx', 'w') as f:
    f.write(content)

# QuickActions.jsx
with open('src/components/ui/QuickActions.jsx', 'r') as f:
    content = f.read()
bad_qa = """            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                </>
            }"""
good_qa = """            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                </>
            )}"""
content = content.replace(bad_qa, good_qa)
with open('src/components/ui/QuickActions.jsx', 'w') as f:
    f.write(content)

# RecommendedToolsWidget.jsx
with open('src/components/ui/RecommendedToolsWidget.jsx', 'r') as f:
    content = f.read()
content = content.replace('"Ahhh"', '&quot;Ahhh&quot;')
content = content.replace('"Mmmmm"', '&quot;Mmmmm&quot;')
with open('src/components/ui/RecommendedToolsWidget.jsx', 'w') as f:
    f.write(content)

# button.test.jsx
with open('src/components/ui/button.test.jsx', 'r') as f:
    content = f.read()
bad_btn = """  });
import React from 'react';
import { render, screen } from '@testing-library/react';"""
good_btn = """  });"""
content = content.replace(bad_btn, good_btn)
with open('src/components/ui/button.test.jsx', 'w') as f:
    f.write(content)

# BreathinessMeter.jsx
with open('src/components/viz/BreathinessMeter.jsx', 'r') as f:
    content = f.read()
content = content.replace("import { renderCoordinator } from '../../services/RenderCoordinator';\nimport { renderCoordinator } from '../../services/RenderCoordinator';", "import { renderCoordinator } from '../../services/RenderCoordinator';")
with open('src/components/viz/BreathinessMeter.jsx', 'w') as f:
    f.write(content)

# BrightnessMeter.test.jsx
with open('src/components/viz/BrightnessMeter.test.jsx', 'r') as f:
    content = f.read()
content = content.replace("require('react').createElement", "React.createElement")
with open('src/components/viz/BrightnessMeter.test.jsx', 'w') as f:
    f.write(content)

# HighResSpectrogram.jsx
with open('src/components/viz/HighResSpectrogram.jsx', 'r') as f:
    content = f.read()
bad_ctx = """        // Optimization: Use alpha: false for better performance
        // Optimized: Remove 'willReadFrequently: true' to encourage GPU acceleration
        const ctx = canvas.getContext('2d', { alpha: false });

        const width = canvas.width;
        const height = canvas.height;
        const scrollSpeed = 2; // px per frame"""
good_ctx = """        """
content = content.replace(bad_ctx, good_ctx)
with open('src/components/viz/HighResSpectrogram.jsx', 'w') as f:
    f.write(content)

# SpectralTiltMeter.jsx
with open('src/components/viz/SpectralTiltMeter.jsx', 'r') as f:
    content = f.read()
bad_tilt = """    useEffect(() => {
        const updateTilt = () => {
        if (!dataRef.current) return;"""
good_tilt = """    const updateTilt = useCallback(() => {
        if (!dataRef.current) return;"""
content = content.replace(bad_tilt, good_tilt)
bad_tilt_end = """                return next;
            });
        }
    useEffect(() => {
        const updateTilt = () => {"""
good_tilt_end = """                return next;
            });
        }
    }, [dataRef]);"""
content = content.replace(bad_tilt_end, good_tilt_end)
with open('src/components/viz/SpectralTiltMeter.jsx', 'w') as f:
    f.write(content)

# PrivacyManager.js
with open('src/services/PrivacyManager.js', 'r') as f:
    content = f.read()
content = content.replace("shareProgress: true,\n    shareProgress: false,", "shareProgress: false,")
with open('src/services/PrivacyManager.js', 'w') as f:
    f.write(content)

# ResearchMode.js
with open('src/services/ResearchMode.js', 'r') as f:
    content = f.read()
content = content.replace("if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {", "if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') { // eslint-disable-line no-undef")
with open('src/services/ResearchMode.js', 'w') as f:
    f.write(content)
