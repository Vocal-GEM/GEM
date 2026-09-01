sed -i 's/global\./globalThis./g' src/components/viz/SpectrumAnalyzer.test.jsx
sed -i 's/global\./globalThis./g' src/components/viz/HighResSpectrogram.test.jsx
sed -i "s/import React from 'react';/ /g" src/components/professional/TaskRecorder.jsx
sed -i 's/import React from '"'"'react'"'"';/ /g' src/components/professional/ClientDashboard.jsx
sed -i 's/import React from '"'"'react'"'"';/ /g' src/components/professional/CAPEVAssessment.jsx
sed -i 's/import React from '"'"'react'"'"';/ /g' src/components/professional/AudioSourceManager.jsx
sed -i 's/import { ChevronRight } from '"'"'lucide-react'"'"';/ /g' src/components/professional/ClientDashboard.jsx
sed -i 's/import { Pause } from '"'"'lucide-react'"'"';/ /g' src/components/professional/SpectrogramComparison.jsx
