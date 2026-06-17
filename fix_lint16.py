# Restore test files that got corrupted by the global to globalThis replacement if they broke
import os
os.system('git restore src/components/ui/button.test.jsx src/components/ui/QuickActions.jsx src/components/viz/BrightnessMeter.test.jsx src/components/viz/QualityVisualizer.jsx src/components/viz/HighResSpectrogram.test.jsx src/components/viz/Spectrogram3D.test.jsx src/components/viz/SpectrumAnalyzer.test.jsx src/components/ui/LoadingSpinner.test.jsx')
